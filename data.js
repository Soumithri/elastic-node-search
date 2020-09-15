const elasticsearch = require("elasticsearch");
const cities = require("./cities.json");

const client = new elasticsearch.Client({
    hosts: ["https://search-my-elastic-search-app-epw3a4a5se7yln42mgr5c3bx2q.us-east-1.es.amazonaws.com"]
});

client.ping({
    requestTimeout: 30000,
}, function(err) {
    if(err) {
        console.log("AWS Elasticsearch cluster is down");
    }
    else {
        console.log("Connected to AWS elasticsearch cluster");
    }
});

client.indices.create({
    index: 'cities-list'
}, function (err, res, status) {
    if (err) {
        console.log(err);
    }
    else {
        console.log("Created a new index", res);
    }
});

var bulk = [];
cities.forEach(city => {
    bulk.push({ index: {
        _index: "cities-list",
        _type: "cities",
    }})
    bulk.push(city);
});

client.bulk({ body: bulk }, function (err, res) {
    if (err) {
        console.log("Failed to perform bulk write operations".red, err);
    } else {
        console.log("Successfully imported %s".green, cities.length);
    }
});