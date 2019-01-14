import React, { Component, Fragment } from "react";
import axios from "axios";
import "./App.css";
import { Dropdown, Segment } from "semantic-ui-react";

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
      axios.get(`/api/${this.state.value}/2018`).then(response => {
        this.setState({
          historicalResults: response.data
        });
      });
    });
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
      </Fragment>
    );
  }
}

export default App;
