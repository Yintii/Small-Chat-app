var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mysql = require('mysql');
var exports = require('./exports')
var connected_users = [];
var online_list = [];
var lastMessenger = '';

var con = mysql.createConnection({
  host: exports.host,
  user: exports.user,
  password: exports.password
});

con.connect(function(err){
  if (err) throw err;
  console.log("Connected!");
});


//serves the home index.html page when a user accesses the home page
app.get('/', (req,res)=>{
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket)=>{
var clientUser = {};
  //when user first joins, initialize them in an object and store it
  socket.on('user join', (userName, userAvi)=>{
    clientUser = generateUser(userName, userAvi);
    console.log('Client user: ' + clientUser.name, clientUser.avi);
    connected_users.push(clientUser);
    var msg = clientUser.name + ' has joined the server';
    io.emit('user join', msg, connected_users);
  });

  //handles the chat messages sent to the server by the clients
  socket.on('chat message', (msg)=>{
    console.log(clientUser.name + " just sent a message")
    //if a new user is typing, make sure to add their name
    if(lastMessenger != clientUser.name){
      io.emit('chat message', clientUser.name + ": " + msg);
      lastMessenger = clientUser.name;
    //but if the user was the last to send a message, just append to last message
    }else if(lastMessenger == clientUser.name){
      io.emit('chat message', msg, clientUser.name, clientUser.avi);
    }
  });

  //adjusts the connected_users list to not have the person who left,
  //makes a msg depicted who has left
  socket.on('disconnect', ()=>{
    for(var i =0; i< connected_users.length; i++){
      if(clientUser.name === connected_users[i].name){
        connected_users.splice(i);
        console.log('Remaining users: ');
        for(var i = 0; i<connected_users.length; i++){
          console.log(connected_users[i].name);
        }
      }
    }
    var msg = clientUser.name + " has disconnected";
    socket.broadcast.emit('user leave', msg, connected_users);
  });

});

//constructor method for users
function generateUser(userName, userAvi){
  const generated_user = {
    //give them the name they picked
    name: userName,
    avi: userAvi = getAvi(userAvi),
    id: user_id = generateID()
  };
  return generated_user;
}

function getAvi(a){
  if(a == null){
    avatar = './avatar_default.jpg';
  }else{
    avatar = a;
    return avatar;
  }
}

function generateID(){
  var x = Math.floor((Math.random() * 10) + 1);
  //if the number choosen is already in the list, get a new number
  if(connected_users.hasOwnProperty(x)){
    return generateID();
  }else{
    //return the random and unique number
    return x;
  }
}

http.listen(3000, ()=>{
  console.log('listening on port 3000');
});
