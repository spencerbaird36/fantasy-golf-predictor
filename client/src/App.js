import React, { Component, Fragment } from "react";
import axios from "axios";
import "./App.css";
import { Dropdown, Segment } from "semantic-ui-react";
import PlayerTable from "./PlayerTable";

class App extends Component {
  state = {
    tournaments: [],
    currentTournamet: null,
    value: null,
    historicalResults: []
  };

  componentWillMount() {
    axios.get("/api/schedule").then(response => {
      const tournamentOptions = response.data.tournaments.map(elem => {
        return {
          value: elem.htmlString,
          text: elem.name
        };
      });

      this.setState({
        tournaments: [...this.state.tournaments, ...tournamentOptions],
        currentTournamet: response.data.currentTournamet
      });
    });
  }

  updateTournament = (e, { value }) => {
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
        <PlayerTable players={this.state.historicalResults} />
      </Fragment>
    );
  }
}

export default App;
