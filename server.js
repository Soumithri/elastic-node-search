const elasticsearch = require("elasticsearch");
const queryIndexclient = new elasticsearch.Client({
    hosts: ["https://search-my-elastic-search-app-epw3a4a5se7yln42mgr5c3bx2q.us-east-1.es.amazonaws.com"]
});

const queryIndexName = "cities-list";

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");


queryIndexclient.ping(
  {
    requestTimeout: 30000,
  },
  function (error) {
    if (error) {
      console.error("elasticsearch cluster is down!");
    } else {
      console.log("Everything is ok");
    }
  }
);

app.use(bodyParser.json());
app.set("port", process.env.PORT || 3001);

app.use(express.static(path.join(__dirname, "public")));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});


app.get("/", function (req, res) {
    res.sendFile("template.html", {
        root: path.join(__dirname, "views"),
  });
});

app.get("/search", function (req, res) {
  let body = {
    size: 200,
    from: 0,
    query: {
      wildcard: {
        name: `*${req.query["q"]}*`,
      }
    },
  };
  queryIndexclient
    .search({ index: queryIndexName, body: body, type: "cities" })
    .then((results) => {
    //   console.log(`search results = ${JSON.stringify(results)}`);
      res.send(results.hits.hits);
    })
    .catch((err) => {
      console.log(`search results err = ${JSON.stringify(err)}`);
      res.send([]);
    });
});

app.listen(app.get("port"), function () {
  console.log("Express server listening on port " + app.get("port"));
});