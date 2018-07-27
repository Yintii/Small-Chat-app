var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var connected_users = [];
var online_list = [];
var lastMessenger = '';

//serves the home index.html page when a user accesses the home page
app.get('/', (req,res)=>{
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket)=>{
var clientUser = {};

  socket.on('user join', (userName, userAvi)=>{
    clientUser = generateUser(userName, userAvi);
    console.log('Client user: ' + clientUser.name);
    connected_users.push(clientUser);
    var msg = clientUser.name + ' has joined the server';
    io.emit('user join', msg, connected_users);
  });

  //this pushes chat messages submitted by clients, to the rest of the clients
  //that are connected, and says who sent the message by referencing user.name
  socket.on('chat message', (msg)=>{
    console.log(clientUser.name + " just sent a message")
    if(lastMessenger != clientUser.name){
      io.emit('chat message', clientUser.name + ": " + msg);
      lastMessenger = clientUser.name;
    }else if(lastMessenger == clientUser.name){
      io.emit('chat message', msg);
    }
  });

  //annouces when the user disconnects from server
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
    avi: userAvi,
    id: user_id = generateID()
  };
  return generated_user;
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
