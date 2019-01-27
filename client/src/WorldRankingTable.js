import React, { Fragment } from "react";
import ReactTable from "react-table";
import "react-table/react-table.css";
import matchSorter from "match-sorter";

class WorldRankingTable extends React.Component {
  render() {
    return (
      <Fragment>
        <ReactTable
          data={this.props.players}
          sortable={false}
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
              Header: "Ranking This Week",
              accessor: "thisWeek"
            },
            {
              Header: "Ranking Last Week",
              accessor: "lastWeek"
            }
          ]}
          defaultPageSize={10}
          className="-striped -highlight"
        />
      </Fragment>
    );
  }
}

export default WorldRankingTable;
