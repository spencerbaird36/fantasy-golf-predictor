import React, { Fragment } from "react";
import ReactTable from "react-table";
import "react-table/react-table.css";
import numeral from "numeral";
import matchSorter from "match-sorter";

class PriorThreeResults extends React.Component {
  render() {
    const { players } = this.props;
    console.log(players);
    return (
      <Fragment>
        <ReactTable
          data={players}
          filterable
          columns={[
            {
              Header: "Name",
              accessor: "name",
              filterMethod: (filter, rows) =>
                matchSorter(rows, filter.value, { keys: ["name"] }),
              filterAll: true
            },
            {
              Header: "Finishes",
              accessor: "position"
            },
            {
              Header: "Money",
              accessor: "winnings",
              Cell: row => {
                return numeral(row.original.winnings).format("$0,0.00");
              }
            }
          ]}
          defaultSorted={[
            {
              id: "winnings",
              desc: true
            }
          ]}
          defaultPageSize={10}
        />
      </Fragment>
    );
  }
}

export default PriorThreeResults;
