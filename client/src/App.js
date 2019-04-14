import React, { Component, Fragment } from "react";
import axios from "axios";
import "./App.css";
import { Dropdown, Segment, Grid, Header, Icon } from "semantic-ui-react";
import PlayerTable from "./PlayerTable";
import CurrentTournamentTable from "./CurrentTournamentTable";
import PriorFourResults from "./PriorFourResults";
import WorldRankingTable from "./WorldRankingTable";
import WeightedResultsTable from "./WeightedResultsTable";

class App extends Component {
  state = {
    tournaments: [],
    currentTournamet: null,
    value: null,
    historicalResults: [],
    currentTournametPlayers: [],
    currentTournamentName: "",
    threeTourneyHistory: [],
    worldRankings: [],
    selectedTourney: "",
    fedexRankings: []
  };

  componentDidMount() {
    axios
      .all([
        axios.get("/api/schedule"),
        axios.get("https://statdata.pgatour.com/r/current/message.json")
      ])
      .then(
        axios.spread((response, response2) => {
          const tournamentOptions = response.data.tournaments.map((elem, i) => {
            return {
              key: i,
              value: elem.htmlString,
              text: elem.name
            };
          });

          const priorFourTourneys = this.findPreviousFourTournaments(
            tournamentOptions,
            response.data.currentTournamet
          );
          return axios
            .all([
              axios.get(
                `https://statdata.pgatour.com/${response2.data.tc}/${
                  response2.data.tid
                }/field.json`
              ),
              axios.get(`/api/${priorFourTourneys[0]}/2019`),
              axios.get(`/api/${priorFourTourneys[1]}/2019`),
              axios.get(`/api/${priorFourTourneys[2]}/2019`),
              axios.get(`/api/${priorFourTourneys[3]}/2019`),
              axios.get("/api/world_ranking"),
              axios.get("/api/fedex_rankings")
            ])
            .then(
              axios.spread(
                (
                  players,
                  previous1,
                  previous2,
                  previous3,
                  previous4,
                  worldRankings,
                  fedexRankings
                ) => {
                  const lastFourResults = this.constructData(
                    previous1.data,
                    previous2.data,
                    previous3.data,
                    previous4.data
                  );

                  this.setState({
                    tournaments: [
                      ...this.state.tournaments,
                      ...tournamentOptions
                    ],
                    currentTournamet: response.data.currentTournamet,
                    currentTournametPlayers: players.data.Tournament.Players,
                    currentTournamentName:
                      players.data.Tournament.TournamentName,
                    fourTourneyHistory: lastFourResults,
                    worldRankings: worldRankings.data,
                    fedexRankings: fedexRankings.data
                  });
                }
              )
            );
        })
      );
  }

  updateTournament = (e, { value }) => {
    const selectedTourney = e.currentTarget.textContent;
    let formattedString;
    if (value === "https://www.theplayers.com/") {
      formattedString = "the-players";
    } else {
      formattedString = value
        .slice(13)
        .replace(/\/en/g, "")
        .slice(0, -5);
    }

    this.setState({ value: formattedString }, () => {
      axios
        .all([
          axios.get(`/api/${this.state.value}/2018`),
          axios.get(`/api/${this.state.value}/2017`),
          axios.get(`/api/${this.state.value}/2016`),
          axios.get(`/api/${this.state.value}/2015`)
        ])
        .then(
          axios.spread(
            (response2018, response2017, response2016, response2015) => {
              const allData = this.constructData(
                response2018.data,
                response2017.data,
                response2016.data,
                response2015.data
              );
              this.setState({
                historicalResults: [...allData],
                selectedTourney
              });
            }
          )
        );
    });
  };

  findPreviousFourTournaments = (tournaments, currentTournamet) => {
    const currentTourney = tournaments.find(elem => {
      return elem.value === currentTournamet;
    });
    const currentTournamentIndex = tournaments.indexOf(currentTourney);
    const previousTourneys = [];
    for (let i = currentTournamentIndex - 4; i < currentTournamentIndex; i++) {
      previousTourneys.push(tournaments[i].value);
    }
    return this.htmlParser(previousTourneys);
  };

  htmlParser = tournaments => {
    return tournaments.map(elem => {
      if (elem === "https://www.theplayers.com/") {
        return "the-players";
      }
      return elem
        .slice(13)
        .replace(/\/en/g, "")
        .replace(/.html/g, "")
        .trim();
    });
  };

  constructData = (one, two, three, four) => {
    const reducableArray = [...one, ...two, ...three, ...four];
    const allPlayers = reducableArray.reduce((acc, curr) => {
      let name = curr.name;
      let found = acc.find(elem => elem.name === name);
      if (found) {
        found.winnings += curr.winnings;
        found.position += " " + curr.position;
      } else {
        acc.push(curr);
      }
      return acc;
    }, []);
    const playersWithFomattedData = allPlayers.map(player => {
      const positions = player.position.split(" ");
      const averagePosition = positions.reduce((acc, elem) => {
        if (elem.charAt(0) === "T") {
          elem = parseInt(elem.substring(1), 10);
        } else if (elem === "CUT" || elem === "W/D" || elem === "DQ") {
          elem = 80;
        }
        acc += +elem;
        return acc;
      }, 0);

      return {
        ...player,
        averagePosition: Math.round(averagePosition / positions.length)
      };
    });
    return playersWithFomattedData;
  };

  render() {
    return (
      <Fragment>
        <Segment raised>
          <Header as="h1" textAlign="center" className="header-class">
            Fantasy Golf Predictor
          </Header>
          <Segment raised>
            <Grid padded>
              <Header as="h1">PGA Tour Season Schedule</Header>
              <Icon name="golf ball" size="big" />
            </Grid>
            <Grid padded>
              <Header as="h5" className="header-current-tournament">
                Current Tournament - {this.state.currentTournamentName}
              </Header>
            </Grid>
            <Dropdown
              placeholder="Select Tournament for Historcial Data"
              fluid
              search
              selection
              options={this.state.tournaments}
              onChange={this.updateTournament}
            />
          </Segment>
          {this.state.historicalResults.length > 0 && (
            <Segment raised>
              <WeightedResultsTable
                historicalResults={this.state.historicalResults}
                lastFourResults={this.state.fourTourneyHistory}
                currentField={this.state.currentTournametPlayers}
                selectedTourney={this.state.selectedTourney}
                fedexRankings={this.state.fedexRankings}
                currentTournamentName={this.state.currentTournamentName}
              />
            </Segment>
          )}
          <Segment raised>
            <Grid columns={2} padded>
              <Grid.Column>
                <Header as="h3">
                  Historical Tournament Data{" "}
                  {this.state.selectedTourney
                    ? ` - ${this.state.selectedTourney}`
                    : ""}
                </Header>
                ***CUT, W/D or DQ are calculated as finishing 80th***
                <PlayerTable players={this.state.historicalResults} />
              </Grid.Column>
              <Grid.Column>
                <Header as="h3">Last Four Tournaments</Header>
                ***CUT, W/D or DQ are calculated as finishing 80th***
                <PriorFourResults players={this.state.fourTourneyHistory} />
              </Grid.Column>
              <Grid.Column>
                <Header as="h3">
                  Current Tournament Field - {this.state.currentTournamentName}
                </Header>
                <CurrentTournamentTable
                  players={this.state.currentTournametPlayers}
                />
              </Grid.Column>
              <Grid.Column>
                <Header as="h3">Official World Golf Rankings</Header>
                <WorldRankingTable players={this.state.worldRankings} />
              </Grid.Column>
            </Grid>
          </Segment>
        </Segment>
      </Fragment>
    );
  }
}

export default App;
