//Server Code 
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const path = require('path');

app.use(express.static(__dirname));

var buttons = [false, false, false, false];

io.on('connection', function(socket){
    console.log('a user connected');

    for (let i = 0; i < buttons.length; i++){
        socket.emit('button click', {buttonNumber: i + 1, buttonState: buttons[i]})
    }

    socket.on('disconnect', function(){
        console.log('a user disconnected');
    })
    
    socket.on('button click',function(buttonNumber){
        buttons[buttonNumber-1] = !buttons[buttonNumber-1];
        console.log('button number ' + buttonNumber + ' is in state ' + buttons[buttonNumber-1]);
        io.emit('button click', {buttonNumber: buttonNumber, buttonState: buttons[buttonNumber-1]})
    })
});

http.listen(3000, () => {
    console.log('listening on *:3000');
})

// To run this
// 1: Get npm
// 2: Make sure you have the package.json files (if not can create with npm init)
// 3: npm install express, npm install socket.io
// 4: node index.js 