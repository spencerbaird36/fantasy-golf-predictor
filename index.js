const express = require("express");
const path = require("path");
const rp = require("request-promise");
const cheerio = require("cheerio");

const app = express();

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, "client/build")));

app.get("/api/schedule", (req, res) => {
  const url = "https://www.pgatour.com/tournaments/schedule.html";
  let options = {
    uri: url,
    transform: function(body) {
      return cheerio.load(body);
    }
  };

  rp(options).then($ => {
    let schedule = { tournaments: [], currentTournamet: null };
    const table = $(".table-styled").find("tr:not(.js-ad-container)");
    for (let i = 0; i < table.length; i++) {
      let current = table[i];
      let tournamentInfo = {};
      if ($(current).data("current-tournament")) {
        schedule["currentTournamet"] = $(current)
          .find(".js-tournament-name")
          .attr("href");
      }
      let name = $(current)
        .find(".js-tournament-name")
        .text()
        .trim();

      let htmlString = $(current)
        .find(".tournament-text")
        .find(".js-tournament-name")
        .attr("href");
      tournamentInfo.htmlString = htmlString;
      tournamentInfo.name = name;
      schedule["tournaments"].push(tournamentInfo);
    }
    res.json(schedule);
  });
});

app.get("/api/:tournament/:year", (req, res) => {
  const year = req.params.year;
  const tournament = req.params.tournament;
  const url = `https://www.pgatour.com/tournaments/${tournament}/past-results/jcr:content/mainParsys/pastresults.selectedYear.${year}.html`;
  let options = {
    uri: url,
    transform: function(body) {
      return cheerio.load(body);
    }
  };

  rp(options).then($ => {
    let results = [];
    const table = $(".table-styled").find("tr:not(:first-child)");
    for (let i = 0; i < table.length; i++) {
      let player = {};
      let current = table[i];
      let name = $(current)
        .children("td:nth-child(1)")
        .text()
        .trim();

      let position = $(current)
        .children("td:nth-child(2)")
        .text()
        .trim();

      let winnings = $(current)
        .children("td:nth-child(8)")
        .text()
        .trim();

      player.name = name;
      player.position = position;
      player.winnings =
        winnings === "" ? 0 : parseFloat(winnings.replace(/\$|,/g, ""));
      results.push(player);
    }
    res.json(results.slice(1));
  });
});
// Handles any requests that don't match the ones above
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log("App is listening on port " + port);
