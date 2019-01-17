import React, { Component, Fragment } from "react";
import axios from "axios";
import "./App.css";
import { Dropdown, Segment, Grid } from "semantic-ui-react";
import PlayerTable from "./PlayerTable";
import CurrentTournamentTable from "./CurrentTournamentTable";

class App extends Component {
  state = {
    tournaments: [],
    currentTournamet: null,
    value: null,
    historicalResults: [],
    currentTournametPlayers: [],
    currentTournamentName: ""
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
          return axios
            .get(
              `https://statdata.pgatour.com/${response2.data.tc}/${
                response2.data.tid
              }/field.json`
            )
            .then(players => {
              this.setState({
                tournaments: [...this.state.tournaments, ...tournamentOptions],
                currentTournamet: response.data.currentTournamet,
                currentTournametPlayers: players.data.Tournament.Players,
                currentTournamentName: players.data.Tournament.TournamentName
              });
            });
        })
      );
  }

  updateTournament = (e, { value }) => {
    // const currentTourney = e.currentTarget.textContent;
    const formattedString = value.slice(13);
    const finalFormatedString = formattedString.slice(0, -5);
    console.log(this.findPreviousThreeTournaments(this.state.tournaments));
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

  findPreviousThreeTournaments = tournaments => {
    const currentTourney = tournaments.find(elem => {
      return elem.value === this.state.currentTournamet;
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
    console.log(this.state);
    return (
      <Fragment>
        <Segment>
          <Dropdown
            placeholder="Select Tournament"
            fluid
            selection
            options={this.state.tournaments}
            onChange={this.updateTournament}
          />
        </Segment>
        <Grid columns={2} padded>
          <Grid.Column>
            <PlayerTable players={this.state.historicalResults} />
          </Grid.Column>
          <Grid.Column>
            <CurrentTournamentTable
              players={this.state.currentTournametPlayers}
              name={this.state.currentTournamentName}
            />
          </Grid.Column>
        </Grid>
      </Fragment>
    );
  }
}

export default App;
