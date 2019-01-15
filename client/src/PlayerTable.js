import React, { Fragment } from "react";
import ReactTable from "react-table";
import "react-table/react-table.css";

class PlayerTable extends React.Component {
  render() {
    const { players } = this.props;
    return (
      <Fragment>
        {players && (
          <ReactTable
            data={players}
            columns={[
              {
                Header: "Name",
                accessor: "name"
              },
              {
                Header: "Finishes",
                accessor: "position"
              },
              {
                Header: "Money",
                accessor: "winnings"
              }
            ]}
            defaultSorted={[
              {
                id: "winnings",
                desc: true
              }
            ]}
          />
        )}
      </Fragment>
    );
  }
}

export default PlayerTable;
