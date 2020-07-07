//Server Code 
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const path = require('path');

app.use(express.static(__dirname));

var steps = 16;
var channels = 5;
var buttonStates = Array(channels).fill().map(() => Array(steps).fill("") );
var bpm = 100;
var colours = [];

io.on('connection', function(socket){
    console.log('a user connected');
    let newColour = getRandomColour();
    if (colours.length < 1){
        socket.colour = newColour;
        colours.push(newColour)
    }
    else{
        while(!!~colours.indexOf(newColour)){
            newColour = getRandomColour();
        }
        socket.colour = newColour;
        colours.push(newColour)
    }

    var initObject = {
        channels: channels,
        steps: steps,
        channelNames: ["kick", "snare", "hat", "bongo", "george"],
        buttonStates: buttonStates,
        colour: socket.colour,
        bpm: bpm 
    } 

    socket.emit('initialise', initObject);
    socket.broadcast.emit('add cursor', socket.colour)
    colours.forEach(function(colour){
        socket.emit('add cursor',colour)
    })

    socket.on('disconnect', function(){
        colours.splice(colours.indexOf(socket.colour),1)
        socket.broadcast.emit('remove cursor',socket.colour)
        console.log('a user disconnected');
    })
    
    socket.on('button click',function(data){
        if (buttonStates[data.row][data.column] === ""){
            buttonStates[data.row][data.column] = socket.colour;
        }
        else{
            buttonStates[data.row][data.column] = "";
        }
        // buttonStates[data.row][data.column] = !buttonStates[data.row][data.column];
        console.log("button row:" + data.row + " column:" + data.column + " is in state " + buttonStates[data.row][data.column])
        io.emit('button click', {row:data.row, column:data.column, state:buttonStates[data.row][data.column], colour:socket.colour})
    })

    socket.on('play', function(){
        socket.broadcast.emit('play')
    })

    socket.on('stop', function(){
        socket.broadcast.emit('stop')
    })

    socket.on('pause',function(){
        socket.broadcast.emit('pause')
    })

    socket.on('bpm',function(data){
        bpm = data;
        io.emit('bpm', data);
    })

    socket.on('cursor', function(data){
        data.colour = socket.colour;
        socket.broadcast.emit('cursor', data);
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
