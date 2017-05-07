var express = require("express");
var request = require("request");
var cheerio = require("cheerio");
var app     = express();

app.get('/search/:keyword', function(req, res) {
    
    var query = req.params.keyword.replace("%20", "+");
    var google = {
        url: "https://google.com",
        search: "/search?q="
    };
    console.log("search with keyword : " + query);
    
    var responseJson = [];
    
    request(google.url + google.search + query, function(error, response, html) {
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
                            title: title.replace(/_/g, "&#95;").replace(/`/g, ""),
                            url: url.replace('https://google.com/url?q=', '').replace(/_/g, "&#95;").replace(/`/g, ""),
                            desc: desc.replace(/_/g, "&#95;").replace(/`/g, "")
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