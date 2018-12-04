var app = require('express')();
var http = require('http').createServer(app)
var io = require('socket.io')(http);
var port = 8081
var connected_users = []
var online_list = []
var lastMessenger = ''

http.listen(port, "127.0.0.1")

io.listen(http)


//serves the home index.html page when a user accesses the home page
app.get('/chatapp', (req,res)=>{
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket)=>{
var clientUser = {};
  //when user first joins, initialize them in an object and store it
  socket.on('user join', (userName, userAvi)=>{

    //make the object representative to the user
    clientUser = generateUser(userName, userAvi);
    console.log('Client user: ' + clientUser.name + ' - ' + clientUser.avi + ' - ' + clientUser.id);
    
    //add user to the active user array
    connected_users.push(clientUser);

    var msg = clientUser.name + ' has joined the server';
    io.emit('user join', msg, connected_users);
  });


  //handles the chat messages sent to the server by the clients
  socket.on('chat message', (msg)=>{
    //If you just hit enter, it won't send a message.
    if (msg == ""){
      return;
    }

    var change;
    sameMessenger = lastMessenger == clientUser.name;
    differentMessager = lastMessenger != clientUser.name;

    //if a new user is typing, make sure to add their name
    if(differentMessager){
      change = true;
      io.emit('chat message', clientUser.name + ": " + msg,
                              clientUser.name,
                              clientUser.avi,
                              change);

      lastMessenger = clientUser.name;
    //but if the user was the last to send a message, just append to last message
    }else if(sameMessenger){
      change = false;
      io.emit('chat message', msg, 
                              clientUser.name, 
                              clientUser.avi,
                              change);
    }
    console.log(clientUser.name + " just sent a message: " + msg);
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
    avi: userAvi = '/avatar_default.jpg',
    id: user_id = generateID()
  };
  return generated_user;
}

function generateID(){
  var x = Math.floor((Math.random() * 100) + 1);
  //if the number choosen is already in the list, get a new number
  if(connected_users.hasOwnProperty(x)){
    return generateID();
  }else{
    //return the random and unique number
    return x;
  }
}

