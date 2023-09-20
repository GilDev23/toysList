// Express library with all capabilities
const express = require("express");
// Manipulates web addresses
const path = require("path");
// A library that knows how to run a server
const http = require("http");

const { routesInit } = require("./routes/configRoutes");
// mongo connect
require("./db/mongoConnect");

const app = express();

// So that we can accept Body with Jason in post, put and delete requests
app.use(express.json());

// Defines that the public folder and all the files in it will be public
app.use(express.static(path.join(__dirname, "public")));
// A function that is responsible for defining all the roets that we will create in a server application
routesInit(app);

const server = http.createServer(app);
// Checks on which port to run the server, if on a real server collects
// The variable was ported from its work environment and if not 3001
const port = process.env.PORT || 3001;
server.listen(port);
