# chat_app_extendedfrom_socket.io-example
Small Chat app I've extended off of the socket.io example

There's only two files at work here, the index.js code and the index.html internal script at the bottom.
Because the script for the client interactions are served to each client individually in the index.html
page, everything is contextual to the user as it is submitted to index.js

You choose a picture or avitar (feature not fully functional yet) and a name, and it is passed to the server to process the data.
Upon entering the chat room, the chat log says "_____ has entered the room/chat" and when you leave, it says the user leaves.

There's also a 'online users' area in the left, that is just a list of the connected client's names. 

When the users sends a message, and then another, it will not list their name/avitar again, but just append the new message under their last.
