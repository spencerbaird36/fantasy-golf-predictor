import React, { Fragment } from "react";
import ReactTable from "react-table";
import "react-table/react-table.css";
import matchSorter from "match-sorter";

class CurrentTournamentTable extends React.Component {
  render() {
    const { players } = this.props;
    let updatePlayers;
    if (players) {
      updatePlayers = players.map(elem => {
        const nameArray = elem.PlayerName.split(",");
        const firstName = nameArray[1];
        const lastName = nameArray[0];
        return {
          firstName,
          lastName
        };
      });
    }
    return (
      <Fragment>
        {this.props.name
          ? `Current Tournament Players - ${this.props.name}`
          : ""}
        {updatePlayers && (
          <ReactTable
            data={updatePlayers}
            filterable
            columns={[
              {
                Header: "First Name",
                accessor: "firstName",
                filterMethod: (filter, rows) =>
                  matchSorter(rows, filter.value, { keys: ["firstName"] }),
                filterAll: true
              },
              {
                Header: "Last Name",
                accessor: "lastName",
                filterMethod: (filter, rows) =>
                  matchSorter(rows, filter.value, { keys: ["lastName"] }),
                filterAll: true
              }
            ]}
          />
        )}
      </Fragment>
    );
  }
}

export default CurrentTournamentTable;
