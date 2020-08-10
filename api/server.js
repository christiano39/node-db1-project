const express = require("express");

//const db = require("../data/dbConfig.js");
const accountsRoutes = require('../routes/accountsRoutes');

const server = express();

server.use(express.json());

server.use('/api/accounts', accountsRoutes);

module.exports = server;
