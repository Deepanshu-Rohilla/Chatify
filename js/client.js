
const socket = io('http://localhost:8000');
const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const messageContainer = document.querySelector('.container');
 const name  = prompt('Enter your name to join');

const append = (message,position)=>{
    const messageElement= document.createElement('div');
    messageElement.innerText = message;
    messageElement.classList.add('message');
    messageElement.classList.add(position);
    messageContainer.append(messageElement);
    if(position=='left'){

        audio.play();
    }
}
form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const message = messageInput.value;
    if(messageInput.value ==''){
        audio.play();
    }
    else{
    append(`${message}`, 'right');
    socket.emit('send', message);
    messageInput.value = '';
    }
})
var audio = new Audio('notif.mp3');
socket.emit('new-user-joined', name);
socket.on('user-joined', name=>{
append(`${name} joined the chat`, 'notif')
})
socket.on('recieve', data=>{
append(`${data.name}`, 'name');
append(`${data.message}`, 'left')
})
socket.on('leave', name=>{
append(`${name} left the chat`, 'notif')
})