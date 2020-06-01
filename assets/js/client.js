const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const messageContainer = document.querySelector('.container');

var first_time = true;
var socket;
var name;

var firebaseConfig = {
    apiKey: "AIzaSyAazHBNppcZGj5QTOAI98PV6e6XW-cxgnc",
    authDomain: "chatify-7c6c1.firebaseapp.com",
    databaseURL: "https://chatify-7c6c1.firebaseio.com",
    projectId: "chatify-7c6c1",
    storageBucket: "chatify-7c6c1.appspot.com",
    messagingSenderId: "1053784866816",
    appId: "1:1053784866816:web:9c1e0992a8e254ed6658e5",
    measurementId: "G-N0ER4R3PPM"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
var database = firebase.database();
var provider = new firebase.auth.GoogleAuthProvider();
var audio = new Audio('/sounds/notif.mp3');


const append = (message, position) => {
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messageElement.classList.add('message');
    messageElement.classList.add(position);
    messageContainer.append(messageElement);
    if (position == 'left') {

        audio.play();
    }
}
firebase.auth().onAuthStateChanged(function(user) {
    console.log('auth changed ');
    if (user && first_time) {
      // User is signed in.
      first_time=false;
      connect(user);
    } else if(first_time){
      // No user is signed in.
      firebase.auth().signInWithPopup(provider).then(function (result) {
        first_time=false;
        var token = result.credential.accessToken;
        var user = result.user;
        connect(user);
    
    }).catch(function (error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        var email = error.email;
        var credential = error.credential;
    
        console.log(error)
    });

}

async function connect(user) {
    socket = io.connect('http://localhost:8000');
    console.log(user.uid)
    ref = database.ref('users').child(user.uid).child('name');
    console.log(ref)
    name = await readSync();

    console.log(name);

    if(!name || name == 'null'){
        name = prompt('Enter your name to join');
        if(!name || name == 'null'){
            name = firebase.auth().currentUser.displayName.split(' ')[0];
        }
        console.log(name);
        ref.set(name);
    }
    console.log(name,'now');
    document.getElementById('name').innerHTML = name;
    document.getElementById('send-msg').disabled = false;

    socket.emit('new-user-joined', name);
    socket.on('user-joined', name => {
        append(`${name} joined the chat`, 'notif')
    })
    socket.on('recieve', data => {
        append(`${data.name}`, 'name');
        append(`${data.message}`, 'left')
    })
    socket.on('leave', name => {
        append(`${name} left the chat`, 'notif');
    });
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = messageInput.value;
        if (messageInput.value == '') {
            audio.play();
        } else {
            append(`${message}`, 'right');
            socket.emit('send', message);
            messageInput.value = '';
        }
    });
    }
});

function logout(){
    firebase.auth().signOut().then(function () {
        console.log('logged out');
        document.getElementById('name').innerHTML = '';
        socket.disconnect();
    }).catch(function (error) {
        console.log(error);
    });
}



function readSync() {
    return new Promise((resolve, reject)=>{
        ref
        .once('value',(snapshot)=>{
            console.log('got snapshot')
            resolve(snapshot.val());
        })
        .catch((err)=>{
            reject(err);
        })
    })
}