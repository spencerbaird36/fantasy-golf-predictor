import React, { Fragment } from "react";
import { Header, Message } from "semantic-ui-react";
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

    const rankLastFourResultsByMoney = this.rankPlayersByMoney(
      this.props.lastFourResults,
      "Last Four Results By Money",
      30
    );

    const rankLastFourResultsByAverageFinish = this.rankPlayersByAverageFinish(
      this.props.lastFourResults,
      "Last Four Results By Avg Finish",
      20
    );

    const allPlayers = [
      ...rankHistoricalResultsByMoney,
      ...rankHistoricalResultsByAverageFinish,
      ...rankLastFourResultsByMoney,
      ...rankLastFourResultsByAverageFinish
    ];

    const lastFourAndHistorical = allPlayers
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

    return lastFourAndHistorical.map(player => {
      const values = {};
      values.name = player.name;
      values.allMetrics = player.allMetrics;
      values.totalPoints = player.totalPoints;
      return values;
    });
  };

  render() {
    const takenPlayers = ["Marc Leishman", "Tony Finau"];
    const { fedexRankings } = this.props;
    const currentPlayers = this.props.currentField.map(player => {
      const name = player.PlayerName.split(",");
      return `${name[1]} ${name[0]}`.trim();
    });

    return (
      <Fragment>
        <Header as="h1">Player Point Values</Header>
        <Header as="h3">{this.props.selectedTourney}</Header>
        <Message>
          <Message.Header>Points Scale</Message.Header>
          <Message.List>
            <Message.Item>
              Historical money total for the past 4 years. Top 30 players are
              considered, giving 30 points to the top finisher.
            </Message.Item>
            <Message.Item>
              Historical average finish for the past 4 years. Top 20 players are
              considered, giving 20 points to the top finisher.{" "}
              <strong>
                Players must have played at least twice over the past 4 years to
                be considered.
              </strong>
            </Message.Item>
            <Message.Item>
              Last 4 tournaments in current season by money total. Top 30
              players are considered, giving 30 points to the top finisher.
            </Message.Item>
            <Message.Item>
              Last 4 tournaments in current season by average finish. Top 20
              players are considered, giving 20 points to the top finisher.{" "}
              <strong>
                Players must have played at least twice in the past 4
                tournaments to be considered.
              </strong>
            </Message.Item>
            <Message.Item>
              Total Points. Sum of all prior columns out of 100 possible points.
            </Message.Item>
            <Message.Item style={{ color: "#DC143C" }}>
              <strong>
                Red highlighed rows are players that have already been picked.
              </strong>
            </Message.Item>
            <Message.Item style={{ color: "#7CFC00" }}>
              <strong>
                Green highlighed rows are players that in the current top 30 of
                the Fedex Rankings.
              </strong>
            </Message.Item>
          </Message.List>
        </Message>
        <div>
          <p>
            <strong>
              # = Player is in current tournament (
              {this.props.currentTournamentName})
            </strong>
          </p>
        </div>
        <ReactTable
          data={this.makePlayerData()}
          getTdProps={(state, rowInfo, column) => {
            if (rowInfo && rowInfo.row) {
              let color;
              if (takenPlayers.includes(rowInfo.row.name)) {
                color = "#DC143C";
              } else if (fedexRankings.includes(rowInfo.row.name)) {
                color = "#7CFC00";
              }
              return {
                style: {
                  background: color
                }
              };
            } else {
              return {};
            }
          }}
          columns={[
            {
              Header: "Player Name",
              accessor: "name",
              Cell: row => {
                return currentPlayers.includes(row.original.name) &&
                  this.props.selectedTourney ===
                    this.props.currentTournamentName
                  ? `${row.original.name} #`
                  : row.original.name;
              }
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
              Header: "Last 4 - Money (30)",
              Cell: row => {
                const found = row.original.allMetrics.find(elem =>
                  elem.hasOwnProperty("Last Four Results By Money")
                );
                if (found) {
                  return found["Last Four Results By Money"];
                } else {
                  return 0;
                }
              }
            },
            {
              Header: "Last 4 - Avg Finish (20)",
              Cell: row => {
                const found = row.original.allMetrics.find(elem =>
                  elem.hasOwnProperty("Last Four Results By Avg Finish")
                );
                if (found) {
                  return found["Last Four Results By Avg Finish"];
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
