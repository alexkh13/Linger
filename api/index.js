var api = require('express').Router();

api.use("/geo", require("./geo"));

module.exports = api;