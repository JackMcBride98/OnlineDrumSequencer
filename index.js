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
var bpm = 100;

io.on('connection', function(socket){
    console.log('a user connected');
    socket.colour = getRandomColour();

    var initObject = {
        channels: channels,
        steps: steps,
        channelNames: ["kick", "snare", "hat", "bongo", "george"],
        buttonStates: buttonStates,
        colour: socket.colour,
        bpm: bpm 
    }

    socket.emit('initialise', initObject);

    socket.on('disconnect', function(){
        console.log('a user disconnected');
    })
    
    socket.on('button click',function(data){
        
        buttonStates[data.row][data.column] = !buttonStates[data.row][data.column];
        console.log("button row:" + data.row + " column:" + data.column + " is in state " + buttonStates[data.row][data.column])
        io.emit('button click', {row:data.row, column:data.column, state:buttonStates[data.row][data.column], colour:socket.colour})
    })

    socket.on('play', function(){
        socket.broadcast.emit('play')
    })

    socket.on('stop', function(){
        socket.broadcast.emit('stop')
    })

    socket.on('bpm',function(data){
        bpm = data;
        io.emit('bpm', data);
    })
});

http.listen(3000, () => {
    console.log('listening on *:3000');
})

function getRandomColour(){
    let x = Math.floor(Math.random()*256)-1;
    let y = Math.floor(Math.random()*256)-1;
    let z = Math.floor(Math.random()*256)-1;
    return ("rgba(" + x + "," + y + "," + z + ",1)");
}
