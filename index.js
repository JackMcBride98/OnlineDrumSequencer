//Server Code 
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const path = require('path');

app.use(express.static(__dirname));

var steps = 16;
var channels = 5;
var buttonStates = Array(channels).fill().map(() => Array(steps).fill(false) );

io.on('connection', function(socket){
    console.log('a user connected');

    var initObject = {
        channels: channels,
        steps: steps,
        channelNames: ["kick", "snare", "hat", "bongo", "george"],
        buttonStates: buttonStates 
    }

    socket.emit('initialise', initObject);

    socket.on('disconnect', function(){
        console.log('a user disconnected');
    })
    
    socket.on('button click',function(data){
        
        buttonStates[data.row][data.column] = !buttonStates[data.row][data.column];
        console.log("button row:" + data.row + " column:" + data.column + " is in state " + buttonStates[data.row][data.column])
        io.emit('button click', {row:data.row, column:data.column, state:buttonStates[data.row][data.column]})
    })

    socket.on('play', function(){
        socket.broadcast.emit('play')
    })

    socket.on('stop', function(){
        socket.broadcast.emit('stop')
    })
});

http.listen(3000, () => {
    console.log('listening on *:3000');
})
