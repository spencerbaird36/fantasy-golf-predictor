import React, { Component, Fragment } from "react";
import axios from "axios";
import "./App.css";
import { Dropdown, Segment, Grid, Header, Icon } from "semantic-ui-react";
import PlayerTable from "./PlayerTable";
import CurrentTournamentTable from "./CurrentTournamentTable";
import PriorThreeResults from "./PriorThreeResults";
import WorldRankingTable from "./WorldRankingTable";

class App extends Component {
  state = {
    tournaments: [],
    currentTournamet: null,
    value: null,
    historicalResults: [],
    currentTournametPlayers: [],
    currentTournamentName: "",
    threeTourneyHistory: [],
    worldRankings: []
  };

  componentWillMount() {
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

          const priorThreeTourneys = this.findPreviousThreeTournaments(
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
              axios.get(`/api/${priorThreeTourneys[0]}/2019`),
              axios.get(`/api/${priorThreeTourneys[1]}/2019`),
              axios.get(`/api/${priorThreeTourneys[2]}/2019`),
              axios.get("/api/world_ranking")
            ])
            .then(
              axios.spread(
                (players, previous1, previous2, previous3, worldRankings) => {
                  const lastThreeResults = this.constructData(
                    previous1.data,
                    previous2.data,
                    previous3.data
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
                    threeTourneyHistory: lastThreeResults,
                    worldRankings: worldRankings.data
                  });
                }
              )
            );
        })
      );
  }

  updateTournament = (e, { value }) => {
    // const currentTourney = e.currentTarget.textContent;
    const formattedString = value.slice(13);
    const finalFormatedString = formattedString.slice(0, -5);
    this.setState({ value: finalFormatedString }, () => {
      axios
        .all([
          axios.get(`/api/${this.state.value}/2018`),
          axios.get(`/api/${this.state.value}/2017`),
          axios.get(`/api/${this.state.value}/2016`)
        ])
        .then(
          axios.spread((response2018, response2017, response2016) => {
            const allData = this.constructData(
              response2018.data,
              response2017.data,
              response2016.data
            );
            this.setState({
              historicalResults: [...allData]
            });
          })
        );
    });
  };

  findPreviousThreeTournaments = (tournaments, currentTournamet) => {
    const currentTourney = tournaments.find(elem => {
      return elem.value === currentTournamet;
    });
    const currentTournamentIndex = tournaments.indexOf(currentTourney);
    const previousTourneys = [];
    for (let i = currentTournamentIndex - 3; i < currentTournamentIndex; i++) {
      previousTourneys.push(tournaments[i].value);
    }
    return this.htmlParser(previousTourneys);
  };

  htmlParser = tournaments => {
    return tournaments.map(elem => {
      if (elem === "https://www.theplayers.com/") {
        return elem;
      }
      return elem
        .replace(/.html/g, "")
        .slice(13)
        .trim();
    });
  };

  constructData = (one, two, three) => {
    const reducableArray = [...one, ...two, ...three];
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
    return allPlayers;
  };

  render() {
    return (
      <Fragment>
        <Segment>
          <Grid padded>
            <Header as="h1">PGA Tour Season Schedule</Header>
            <Icon name="golf ball" size="big" />
          </Grid>

          <Dropdown
            placeholder="Select Tournament for Historial Data"
            fluid
            selection
            options={this.state.tournaments}
            onChange={this.updateTournament}
          />
        </Segment>
        <Segment>
          <Grid columns={2} padded>
            <Grid.Column>
              <Header as="h1">Historial Tournament Data</Header>
              <PlayerTable players={this.state.historicalResults} />
            </Grid.Column>
            <Grid.Column>
              <Header as="h1">Last Three Tournaments</Header>
              <PriorThreeResults players={this.state.threeTourneyHistory} />
            </Grid.Column>
            <Grid.Column>
              <Header as="h1">
                Current Tournament Field - {this.state.currentTournamentName}
              </Header>
              <CurrentTournamentTable
                players={this.state.currentTournametPlayers}
              />
            </Grid.Column>
            <Grid.Column>
              <Header as="h1">Official World Golf Rankings</Header>
              <WorldRankingTable players={this.state.worldRankings} />
            </Grid.Column>
          </Grid>
        </Segment>
      </Fragment>
    );
  }
}

export default App;
