var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var online_users = [];
var user_ids = []

//serves the home index.html page when a user accesses the home page
app.get('/', (req,res)=>{
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket)=>{
  //make the user object a global - important for everyone to stay unique
  var user = {};

  //annouces the connection of the new user to the server
  socket.on('user join', (userName)=>{
    //create user obj for reference
    user = generateUser(userName);
    //add it's info to arrays
    online_users.push(user.name);
    user_ids.push(user.id);
    //pass the message of who has joined and the list of connected users
    //to the client
    io.emit('user join', user.name + ' has joined the server', online_users);
  });

  //this pushes chat messages submitted by clients, to the rest of the clients
  //that are connected, and says who sent the message by referencing user.name
  socket.on('chat message', (msg)=>{
    io.emit('chat message', user.name + ": " + msg);
  });


  //annouces when the user disconnects from server
  socket.on('disconnect', (user)=>{
    //get the name and ID of the user
    var indexOfUser = online_users.indexOf(user.name);
    var indexOfId = user_ids.indexOf(user.id);
    //remove the user and their id from the arrays and store them for recall
    var leaving_user = online_users.splice(indexOfUser);
    var leaving_userID = user_ids.splice(indexOfId);
    //pass the message of who has left and the list of the remaining
    //connected users to the client
    socket.broadcast.emit('user leave',  leaving_user + ' has disconnected', online_users);
  });
});

//extra functions to make the user objects unique and recallable
//extra functions to make the user objects unique and recallable
function generateUser(userName){
  const generated_user = {
    //give them the name they picked
    name: userName,
    //give them a unique ID - check that it is unique, if it is not,
    //then it will generate a new one until it is unique
    id: user_id = generateID()
  };
  return generated_user;
}

function generateID(){
  var x = Math.floor((Math.random() * 10) + 1);
  //if the number choosen is already in the list, get a new number
  if(user_ids.includes(x)){
    return generateID();
  }else{
    //return the random and unique number
    return x;
  }
}

http.listen(3000, ()=>{
  console.log('listening on port 3000');
});
