var TelegramBot = require('node-telegram-bot-api');
var request = require("request");
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
var bot = new TelegramBot(token, {polling: true});


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
  
    request('https://nyanmailer-ryanaunur.c9users.io:8081/' + match[1], function(error, response, body) {
        if (!error) {
            var jsonres = JSON.parse(body);
            var count;
            if (users[0].limit > jsonres.length) {
                count = jsonres.length;
            } else {
                count = users[0].limit;
            }
            
            for (var i = 0; i < count; i++) {
                message += jsonres[i].title + "\n" + jsonres[i].url + "\n" + jsonres[i].desc + "\n\n";
            }
             
            bot.sendMessage(fromId, message);
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
    var message = "Status : \n\n";
  
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
        
        bot.sendMessage(fromId, message);
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