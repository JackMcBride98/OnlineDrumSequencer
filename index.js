//Server Code 
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var siofu = require("socketio-file-upload");
const path = require('path');
const fs = require('fs');

app.use(express.static(__dirname));
app.use(siofu.router)


var steps = 16;
var channels = 7;
var buttonStates = Array(channels).fill().map(() => Array(steps).fill("") );
var bpm = 100;
var swing = 0;
var colours = [];
var channelNames = ["kick", "snare", "hat", "bongo", "george","kick2","clap"];
var fileNames = ["kick.wav","snare.wav","hat.wav","bongo.wav","george.wav","kick2.wav","clap.wav"]
var volValues = Array(channels).fill(80);
var channelStates = Array(channels).fill(true);
channelStates[5] = false;
channelStates[6] = false;


io.on('connection', function(socket){
    var uploader = new siofu();
    uploader.dir = (__dirname + "/samples");
    uploader.listen(socket);
    uploader.on("complete", function(event){
        console.log(event.file.name)
        try{
            if (fs.existsSync(__dirname + "/samples/" + event.file.name)){
                console.log("file exists already")
            }
            else{
                console.log("file does not exist")
            }
        }
        catch (err){
            console.error(err);
        }

    })
    uploader.on("saved", function(event){
        if (!channelNames.includes(event.file.meta.channelName)){
            channels++;
            channelNames.push(event.file.meta.channelName)
            volValues.push(80)
            buttonStates.push(Array(steps).fill(""))
            channelStates.push(true)
            io.emit('add uploaded sample', {fileName: event.file.name, channelName: event.file.meta.channelName});
        }
    })

    console.log('a user connected');
    colours.forEach(function(colour){
        socket.emit('add cursor',colour)
    })
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
    socket.broadcast.emit('add cursor', socket.colour)

    var initObject = {
        channels: channels,
        steps: steps,
        channelNames: channelNames,
        buttonStates: buttonStates,
        colour: socket.colour,
        bpm: bpm,
        swing: swing, 
        volValues: volValues,
        channelStates: channelStates,
        fileNames: fileNames,
        userCount: colours.length
    } 

    socket.emit('initialise', initObject);

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
        // console.log("button row:" + data.row + " column:" + data.column + " is in state " + buttonStates[data.row][data.column])
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

    socket.on('swing', function(data){
        swing = data;
        io.emit('swing', data)
    })

    socket.on('cursor', function(data){
        data.colour = socket.colour;
        socket.broadcast.emit('cursor', data);
    })

    socket.on('volume change', function(data){
        volValues[data.volChannel[7]] = data.vol;
        io.emit('volume change', data)
    })

    socket.on('add sample', function(data){
        if (!channelNames.includes(data)){
            channels++;
            channelNames.push(data)
            volValues.push(80)
            buttonStates.push(Array(steps).fill(""))
            channelStates.push(true)
            io.emit('add new sample', data);
        }
        else{
            channelStates[channelNames.indexOf(data)] = true;
            io.emit('add sample', data)
        }
    })

    socket.on('remove sample',function(data){
        channelStates[data] = false;
        io.emit('remove sample', data)
    })

    socket.on('clear',function(data){
        buttonStates[data].fill("");
        io.emit('clear',data);
    })
});

let port = process.env.PORT || 80;

http.listen(port, () => {
    console.log('listening on *:'+port);
})

function getRandomColour(){
    let x = Math.floor(Math.random()*256)-1;
    let y = Math.floor(Math.random()*256)-1;
    let z = Math.floor(Math.random()*256)-1;
    return ("rgba(" + x + "," + y + "," + z + ",1)");
}
