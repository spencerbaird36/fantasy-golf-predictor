const express = require("express");
const path = require("path");
const rp = require("request-promise");
const cheerio = require("cheerio");

const app = express();

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, "client/build")));

app.get("/api/year/:year", (req, res) => {
  const year = req.params.year;
  const url = `https://www.pgatour.com/tournaments/sony-open-in-hawaii/past-results/jcr:content/mainParsys/pastresults.selectedYear.${year}.html`;
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
