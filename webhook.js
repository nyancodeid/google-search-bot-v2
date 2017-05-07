var express = require("express");
var app = express();
var ngrok = require("ngrok");

app.get("/ping", function(req, res) {
    res.send("pong"); 
});


app.listen("8082");

ngrok.connect("8082", function (err, url) {
    console.log(url);
});