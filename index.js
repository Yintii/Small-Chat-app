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
  console.log('user connected');
  //annouces the connection of the new user to the server
  var user = {};
  socket.on('user join', (userName)=>{
    //create the user object
     user = generateUser(userName);

    //create the user object
    online_users.push(user.name);
    user_ids.push(user.id);

    console.log(online_users);
    console.log(user_ids);
    io.emit('chat message', user.name + ' has joined the server.');
  });

  //this pushes chat messages submitted by clients, to the rest of the clients
  //that are connected
  socket.on('chat message', (msg)=>{
    io.emit('chat message', user.name + ": " + msg);
  });

  //annouces when the user disconnects from server
  socket.on('disconnect', (user)=>{
    console.log('user disconnected');

    var indexOfUser = online_users.indexOf(user.name);
    var indexOfId = user_ids.indexOf(user.id);
    console.log(indexOfUser);
    socket.broadcast.emit('chat message',  online_users[indexOfUser]+ ' has disconnected');
    //remove the user from the user array, and their id from the id array
    online_users.splice(indexOfUser);
    user_ids.splice(indexOfId);
    //log who is left on the lists
    console.log(online_users);
    console.log(user_ids);

  });
});

//extra functions to make the user objects unique and recallable
//extra functions to make the user objects unique and recallable
function generateUser(userName){
  const generated_user = {
    //give them a name
    name: userName,
    //give them a unique ID - check that it is unique, if it is not,
    //then it will generate a new one until it is unique
    id: user_id = generateID()
  };
  return generated_user;
}

function generateID(){
  var x = Math.floor((Math.random() * 10) + 1);
  if(user_ids.includes(x) && user_ids.length < 10){
     return generateID();
  }else if(user_ids.length == 10){
    io.on('too many', ()=>{

    });
  }else{
    return x;
  }
}

http.listen(3000, ()=>{
  console.log('listening on port 3000');
});
