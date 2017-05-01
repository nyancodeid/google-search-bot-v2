var express = require("express");
var request = require("request");
var cheerio = require("cheerio");
var app     = express();

app.get('/:keyword', function(req, res) {
    
    var reqUrl = req.params.keyword.replace("%20", "+");
    var google = {
        url: "https://google.com",
        search: "/search?q="
    };
    console.log("Me!");
    console.log((!req.query.page));
    
    var responseJson = [];
    
    request(google.url + google.search + reqUrl, function(error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);
            var title, url, desc;
            
            $("ol div.g").each(function() {
                title = $(this).find("h3.r").text();
                desc = $(this).find("span.st").text();
                url = google.url + $(this).find("h3.r > a").attr("href");
                
                if (title != "" || title != null || title != undefined) {
                    if (title != "") {
                        responseJson.push({
                            title: title,
                            url: url,
                            desc: desc
                        });
                    }
                }
            });
            
            res.json(responseJson);
        }
    });
    
});

app.listen(8081);

module.exports = app;