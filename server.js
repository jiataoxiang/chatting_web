const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const formatMessages = require('./utils/message');
const {
    findUserById,
    userLeave,
    getRoomUsers,
    userJoin
} = require("./utils/users");
const db = require("./db");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const chatbot = 'HappyChat Bot';

// data base connection
db.connect(function (err) {
    if (err) {
        console.log('Error');
    } else {
        console.log("connected to database!");
    }
});

app.get('/createdb', (req, res) => {
    let sql = "create database chatroom";
    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.send("Database created!");
    });
});

app.get('/createuserstable', (req, res) => {
    let sql = "create table users (id int auto_increment primary key, \
        socket_id int, name varchar(255), room varchar(255))";
    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.send("table created!");
    });
});

app.get('/adddefaultuser', (req, res) => {
    let sql = "insert into users set ?"
    let defaultuser = { socket_id: 1, name: "Jiatao", room: "Monday" };
    db.query(sql, defaultuser, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.send("user added!");
    })
});

app.get('/getallusers', (req, res) => {
    let sql = "select name from users";
    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.send(result);
    })
});

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));
// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });


// Run when client connects
io.on('connection', socket => {
    // Run when client join the room
    socket.on('JoinRoom', ({ username, room }) => {

        userJoin(socket.id, username, room);
        socket.join(room);

        socket.emit('message', formatMessages(chatbot, 'Welcome to Happy Chat'));

        // broadcast when user connects...everyone except the user
        socket.broadcast.to(room).emit('message', formatMessages(chatbot, `Welcome ${username} joined the room: ${room}`));

        // send room users
        io.to(room).emit('roomUsers', {
            room,
            users: getRoomUsers(room)
        });
    });


    // Listen for chat Messeage
    socket.on('chatMessage', msg => {
        const user = findUserById(socket.id);
        if (user) {
            io.to(user.room).emit('message', formatMessages(user.username, msg));
        }
    });


    // Run when client disconnect
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        // console.log(user);  // there is a problem here...
        // to all the client in general
        if (user) {
            io.to(user.room).emit('message', formatMessages(chatbot, `${user.username} has left the room, say goodbye to him...`));

            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });
});



const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => { console.log(`Server is running on port ${PORT}`) });