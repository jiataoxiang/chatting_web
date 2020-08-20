var mysql = require('mysql');

var db = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "A389157511",
    port: 3306,
    database: "chatroom"
});

module.exports = db;