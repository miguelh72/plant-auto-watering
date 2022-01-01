"use strict";
exports.__esModule = true;
var express = require("express");
var PORT = (process.env.PORT && parseInt(process.env.PORT)) || 3000;
var HOST = process.env.HOST || 'localhost';
var app = express();
app.get('*', function (req, res) {
    res.send('Hello World!');
});
app.listen(PORT, HOST, function () { return console.log("Server listening at http://".concat(HOST, ":").concat(PORT)); });
exports["default"] = app;
