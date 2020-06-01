const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const users = {}

io.on('connection', socket=>{
    socket.on('new-user-joined', name=>{
        // console.log("New User", name);
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', name);
    });
    socket.on('send', message=>{
        socket.broadcast.emit('recieve', {message: message, name: users[socket.id]})
    });
    socket.on('disconnect', message=>{
        socket.broadcast.emit('leave', users[socket.id]);
        delete users[socket.id];
    });
});

app.use(express.static(__dirname + '/assets'));

app.get('/chat',(req,res)=>{
    res.sendFile(__dirname + '/pages/index.html');
});

server.listen(process.env.PORT || 8000);