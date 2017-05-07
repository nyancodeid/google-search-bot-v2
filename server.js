var TelegramBot = require('node-telegram-bot-api');
var urlToImage = require('url-to-image');
var request = require("request");
var fs = require("fs");
var db = require('knex')({
  dialect: 'sqlite3',
  connection: {
    filename: './data.db'
  },
  useNullAsDefault: true
});

// Database
db.schema.createTableIfNotExists('users', function(table) {
  table.increments('id');
  table.string('name');
  table.integer('t_id');
  table.string('limit');
  table.string('count');
}).createTableIfNotExists('search', function(table) {
  table.increments('id');
  table.integer('user_id').unsigned().references('users.id');
  table.string('keyword');
});


var token = '327544791:AAFisTOjKFuZH4FcuAXoWF5hgDvvxJFpd5I';
var bot = new TelegramBot(token, {polling: {interval: 500}});
var apiUrl = "http://localhost:8081/search/";

bot.onText(/\/search (.*)/, function(msg, match) {
    /*
     * Register User and Logging the Search Keyword
     */
    db('users').where({
        t_id: msg.from.id
    }).select('id').then(function(rows) {
        if (rows.length == 0) {
            db.insert({name: msg.from.first_name, t_id: msg.from.id, limit: 10, count: 0}).into('users').then(function(rows) {
                console.log("users " + msg.from.first_name + " registered on Google Search Bot");
                
                db('users').where({t_id: msg.from.id}).increment('count', 1).then(function() {});
            });
            
            db.insert('search').insert({keyword: match[1], user_id: rows[0].id}).into('search').then(function(rows) {
                console.log("searched " + match[1] + " from id " + rows[0]);
            });
        } else if (rows.length == 1) {
            db.insert('search').insert({keyword: match[1], user_id: rows[0].id}).into('search').then(function(rows) {
                console.log("searched " + match[1] + " from id " + rows[0]); 
                
                db('users').where({t_id: msg.from.id}).increment('count', 1).then(function() {});
            });
        }
    });
    
    var users;
    db('users').select().where({t_id: msg.from.id}).then(function(rows) {
        users = rows;
    });
    
    var fromId = msg.from.id;
    var message = 'Search : ' + match[1] + "\n\n" ;
    
    
    bot.sendChatAction(fromId, "typing");
  
    request(apiUrl + match[1], function(error, response, body) {
        if (!error) {
            var jsonres = JSON.parse(body);
            var count;
            if (users[0].limit > jsonres.length) {
                count = jsonres.length;
            } else {
                count = users[0].limit;
            }
            
            for (var i = 0; i < count; i++) {
                message += "*" + jsonres[i].title + "*\n[" + jsonres[i].url.substr(0, 50) + "...]("+ jsonres[i].url +")\n" + jsonres[i].desc + "\n\n";
            }
             
            bot.sendMessage(fromId, message, {parse_mode: 'markdown'});
        } 
    });
});

bot.onText(/\/setlimit ([0-9]+)/, function(msg, match) {
     /*
     * Register User and Logging the Search Keyword
     */
    db('users').where({
        t_id: msg.from.id
    }).select('id').then(function(rows) {
        if (rows.length == 0) {
            db.insert({name: msg.from.first_name, t_id: msg.from.id, limit: 10, count: 0}).into('users').then(function(rows) {
                console.log("users " + msg.from.first_name + " registered on Google Search Bot");
            });
        }
    });
    
    if (match[1] >= 1 && match[1] <= 10) {
        db('users').where({t_id: msg.from.id}).update('limit', match[1]).then(function() {});
    
        bot.sendMessage(msg.from.id, "Limit changed to " + match[1]);
    } else {
        bot.sendMessage(msg.from.id, "Limit number is out of range 1 - 10");
    }
});

bot.onText(/\/status/, function(msg, match) {
    var fromId = msg.from.id;
    var message = "*Status* : \n\n";
  
    db('users').where({
        t_id: msg.from.id
    }).select('id').then(function(rows) {
        if (rows.length == 0) {
            db.insert({name: msg.from.first_name, t_id: msg.from.id, limit: 10, count: 0}).into('users').then(function(rows) {
                console.log("users " + msg.from.first_name + " registered on Google Search Bot");
            });
        }
    });
    
    db('users').select().where({t_id: msg.from.id}).then(function(rows) {
        message += "Name : " + rows[0].name + "\n";
        message += "Search Limit : " + rows[0].limit + "\n";
        message += "Searched : " + rows[0].count + "\n";
        
        bot.sendMessage(fromId, message, {parse_mode: 'markdown'});
    });
  
});

bot.onText(/\/start/, function(msg, match) {
    var fromId = msg.from.id;
  
    db('users').where({
        t_id: msg.from.id
    }).select('id').then(function(rows) {
        if (rows.length == 0) {
            db.insert({name: msg.from.first_name, t_id: msg.from.id, limit: 10, count: 0}).into('users').then(function(rows) {
                console.log("users " + msg.from.first_name + " registered on Google Search Bot");
            });
        }
    });
    
    bot.sendMessage(fromId, "Just type \n /search Your Keyword");
  
});

bot.onText(/\/ss (https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9]\.[^\s]{2,})/, function(msg, match) {
    var fromId = msg.from.id;
    var randId = Math.round(Math.random() * 1000000);
    
    db('users').where({
        t_id: msg.from.id
    }).select('id').then(function(rows) {
        if (rows.length == 0) {
            db.insert({name: msg.from.first_name, t_id: msg.from.id, limit: 10, count: 0}).into('users').then(function(rows) {
                console.log("users " + msg.from.first_name + " registered on Google Search Bot");
                
                db('users').where({t_id: msg.from.id}).increment('count', 1).then(function() {});
            });
            
            db.insert('search').insert({keyword: match[1], user_id: rows[0].id}).into('search').then(function(rows) {
                console.log("searched " + match[1] + " search id " + rows[0]);
            });
        } else if (rows.length == 1) {
            db.insert('search').insert({keyword: match[1], user_id: rows[0].id}).into('search').then(function(rows) {
                console.log("searched " + match[1] + " search id " + rows[0]); 
                
                db('users').where({t_id: msg.from.id}).increment('count', 1).then(function() {});
            });
        }
    });
    
    urlToImage(match[1], 'temp'+randId+'.png').then(function() {
        bot.sendChatAction(fromId, "upload_photo");
        
        bot.sendPhoto(fromId, 'temp'+randId+'.png', {caption: "From: " + match[1]}).then(function() {
            fs.unlink('temp' + randId + '.png');
        }); 
    }).catch(function(err) {
        console.error(err);
    });
});

bot.on('inline_query', function(msg) {
    var inlineId = msg.id;
    var fromId = msg.from.id;
    var query = msg.query;
    
    if (query != "") {
        db('users').where({
            t_id: msg.from.id
        }).select('id').then(function(rows) {
            if (rows.length == 0) {
                db.insert({name: msg.from.first_name, t_id: msg.from.id, limit: 10, count: 0}).into('users').then(function(rows) {
                    console.log("users " + msg.from.first_name + " registered on Google Search Bot");
                    
                    db('users').where({t_id: msg.from.id}).increment('count', 1).then(function() {});
                });
                
                db.insert('search').insert({keyword: query, user_id: rows[0].id}).into('search').then(function(rows) {
                    console.log("searched " + query + " from id " + rows[0]);
                });
            } else if (rows.length == 1) {
                db.insert('search').insert({keyword: query, user_id: rows[0].id}).into('search').then(function(rows) {
                    console.log("searched " + query + " from id " + rows[0]); 
                    
                    db('users').where({t_id: msg.from.id}).increment('count', 1).then(function() {});
                });
            }
        });
        
        var users;
        db('users').select().where({t_id: msg.from.id}).then(function(rows) {
            users = rows;
        });
        
        var results = [];
        
      
        request(apiUrl + query, function(error, response, body) {
            if (!error) {
                var jsonres = JSON.parse(body);
                var count, items = [];
                if (users[0].limit > jsonres.length) {
                    count = jsonres.length;
                } else {
                    count = users[0].limit;
                }
                
                for (var i = 0; i < count; i++) {
                    //items = ["article", (i+1).toString(), jsonres[i].title, null, null, jsonres[i].url, fal]
                    
                    results.push({
                        type: 'article',
                        id: (i+1).toString(),
                        title: (jsonres[i].title == "") ? "no title" : jsonres[i].title,
                        url: jsonres[i].url,
                        thumb_url: 'http://s4.uploads.ru/wDms1.jpg',
                        description: (jsonres[i].desc == "") ? "no description" : jsonres[i].desc,
                        message_text: "Search : " + query + "\n\n *" + jsonres[i].title + "*\n[" + jsonres[i].url.substr(0, 50) + "...]("+ jsonres[i].url +")\n" + jsonres[i].desc + "\n\n",
                        parse_mode: 'markdown'
                    });
                }
                
                bot.answerInlineQuery(inlineId, results);
            } 
        });
    }
});