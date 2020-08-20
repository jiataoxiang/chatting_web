const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const moment = require('moment');


const app = express();
const server = http.createServer(app);
const io = socketio(server);
const chatbot = 'HappyChat Bot';

const users = [];

function formatMessages(username, message) {
    return {
        username,
        message,
        time: moment().format('h:mm a')
    }
};

function findUserById(id) {
    return users.find(user => user.id === id);
}

function userJoin(id, username, room) {
    const user = {
        id, 
        username,
        room
    }
    users.push(user);
    return user;
}

function userLeave(id) {
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

function getRoomUsers(room) {
    return users.filter(user => user.room === room);
}

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

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

server.listen(PORT, () => {console.log(`Server is running on port ${PORT}`)});