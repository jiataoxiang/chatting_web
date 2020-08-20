const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

const { username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

const socket = io();

//Join room
socket.emit('JoinRoom', { username, room });

socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

//Message submit
chatForm.addEventListener('submit', e => {
    // prevent default behavior
    e.preventDefault();

    const msg = e.target.elements.msg.value;

    // Emit a message to server
    socket.emit('chatMessage', msg);

    //clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

// get Room and user info
socket.on('roomUsers', ({room, users}) => {
    //display room
    roomName.innerText = room;
    //display users
    userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join("")}
    `

});

// Output Message to DOM
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `
        <p class="meta">${message.username}<span> ${message.time}</span></p>
        <p class="text">${message.message}</p>`;
    chatMessages.appendChild(div);
}


