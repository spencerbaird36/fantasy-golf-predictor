import React, { Fragment } from "react";
import { Header } from "semantic-ui-react";
import ReactTable from "react-table";
import "react-table/react-table.css";

class WeightedResultsTable extends React.Component {
  rankPlayersByMoney = (players, metricName, maxPoints) => {
    const sortedPlayers = players
      .sort((a, b) => {
        if (b.winnings > a.winnings) {
          return 1;
        } else {
          return -1;
        }
      })
      .slice(0, maxPoints);

    return sortedPlayers.map((player, i) => {
      return {
        name: player.name,
        rankingPoints: sortedPlayers.length - i,
        metricName
      };
    });
  };

  rankPlayersByAverageFinish = (players, metricName, maxPoints) => {
    const playersWithTwoFinishes = players.filter(player => {
      const finishes = player.position.split(" ");
      return finishes.length > 1;
    });

    const sortedPlayers = playersWithTwoFinishes
      .sort((a, b) => {
        if (b.averagePosition < a.averagePosition) {
          return 1;
        } else {
          return -1;
        }
      })
      .slice(0, maxPoints);

    return sortedPlayers.map((player, i) => {
      return {
        name: player.name,
        rankingPoints: sortedPlayers.length - i,
        metricName
      };
    });
  };

  makePlayerData = () => {
    const rankHistoricalResultsByMoney = this.rankPlayersByMoney(
      this.props.historicalResults,
      "Historical Rank By Money",
      30
    );
    const rankHistoricalResultsByAverageFinish = this.rankPlayersByAverageFinish(
      this.props.historicalResults,
      "Historical Results By Avg Finish",
      20
    );

    const rankLastThreeResultsByMoney = this.rankPlayersByMoney(
      this.props.lastThreeResults,
      "Last Three Results By Money",
      30
    );

    const rankLastThreeResultsByAverageFinish = this.rankPlayersByAverageFinish(
      this.props.lastThreeResults,
      "Last Three Results By Avg Finish",
      20
    );
    const allPlayers = [
      ...rankHistoricalResultsByMoney,
      ...rankHistoricalResultsByAverageFinish,
      ...rankLastThreeResultsByMoney,
      ...rankLastThreeResultsByAverageFinish
    ];

    return allPlayers
      .reduce((acc, player) => {
        let playerName = player.name;
        const found = acc.find(elem => elem.name === playerName);
        if (found) {
          let ranking = player.metricName;
          let value = player.rankingPoints;
          found.totalMetrics.push({ [ranking]: value });
          found.totalPoints += player.rankingPoints;
        } else {
          player.totalMetrics = [];
          let ranking = player.metricName;
          let value = player.rankingPoints;
          player.totalMetrics.push({ [ranking]: value });
          player.totalPoints = value;
          acc.push(player);
        }
        return acc;
      }, [])
      .map(player => {
        return {
          name: player.name,
          allMetrics: player.totalMetrics,
          totalPoints: player.totalPoints
        };
      });
  };

  render() {
    return (
      <Fragment>
        <Header as="h1">Player Point Values</Header>
        <Header as="h3">{this.props.selectedTourney}</Header>
        <ReactTable
          data={this.makePlayerData()}
          columns={[
            {
              Header: "Player Name",
              accessor: "name"
            },
            {
              Header: "Historical - Money (30)",
              Cell: row => {
                const found = row.original.allMetrics.find(elem =>
                  elem.hasOwnProperty("Historical Rank By Money")
                );
                if (found) {
                  return found["Historical Rank By Money"];
                } else {
                  return 0;
                }
              }
            },
            {
              Header: "Historical - Avg Finish (20)",
              Cell: row => {
                const found = row.original.allMetrics.find(elem =>
                  elem.hasOwnProperty("Historical Results By Avg Finish")
                );
                if (found) {
                  return found["Historical Results By Avg Finish"];
                } else {
                  return 0;
                }
              }
            },
            {
              Header: "Last 3 - Money (30)",
              Cell: row => {
                const found = row.original.allMetrics.find(elem =>
                  elem.hasOwnProperty("Last Three Results By Money")
                );
                if (found) {
                  return found["Last Three Results By Money"];
                } else {
                  return 0;
                }
              }
            },
            {
              Header: "Last 3 - Avg Finish (20)",
              Cell: row => {
                const found = row.original.allMetrics.find(elem =>
                  elem.hasOwnProperty("Last Three Results By Avg Finish")
                );
                if (found) {
                  return found["Last Three Results By Avg Finish"];
                } else {
                  return 0;
                }
              }
            },
            {
              Header: "Total Points (100)",
              accessor: "totalPoints"
            }
          ]}
          defaultPageSize={10}
          defaultSorted={[
            {
              id: "totalPoints",
              desc: true
            }
          ]}
          className="-highlight"
        />
      </Fragment>
    );
  }
}

export default WeightedResultsTable;
