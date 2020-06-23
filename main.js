//UserSide Code
$(function(){
    let socket = io();
    var playButton = $('#play');
    var stopButton = $('#stop');

    var steps = 4;
    var channels = 3;
    var buttonStates = Array(channels).fill().map(() => Array(steps).fill(false) );
    var channelAudio;
    var channelNames;
    var channelContainer = $('.channel-container');
    channelContainer.html("");

    socket.on('initialise',function(data){
        steps = data.steps;
        channels = data.channels;
        channelNames = data.channelNames;
        channelAudio = new Array(channels);
        var buttonStates = Array(channels).fill().map( () => Array(steps).fill(false) );
        for(let i = 0; i < channels; i++){
            channelAudio[i] = document.getElementById(data.channelNames[i])
            channelContainer.append("<div class = 'channel' id = c"+ i +"><p>"+ data.channelNames[i] +"</p> </div>");

            for(let j = 0; j < steps; j++){
                $('.channel#c'+i).append("<button id = b"+ j +">"+ j +"</button>")
            }
        }

        $('.channel button').click(function(){
            var parentID = $(this).parent().attr("id");
            var ID = this.id;
            row = parentID.split('c')[1];
            column = ID.split('b')[1];
            socket.emit('button click', {row: row, column: column})
        })
    })

    var playing = false;
    var timestep = 0;

    playButton.click(function(){
        if (!playing){
            playing = true;
            play(timestep);
        }
    })

    function play(timestep){
        for (let i = 0; i < channels; i++){
            if (buttonStates[i][timestep]){
                channelAudio[i].pause()
                channelAudio[i].currentTime = 0;
                channelAudio[i].play()
                console.log((timestep+1) + channelNames[i] )
            }
        }

        timestep++;
        if(timestep > steps-1){
            timestep = 0;
        }
        setTimeout(function(){
            if(playing){play(timestep)}
        }, 500)
    }

    stopButton.click(function(){
        playing = false;
        console.log('STAHP!') 
    })
    
    socket.on('button click', function(data){
        if (data.state){
            $('.channel#c'+data.row+ " button#b"+data.column).css('background','red')
            buttonStates[data.row][data.column] = true;
        }
        else{
            $('.channel#c'+data.row+ " button#b"+data.column).css('background','white')
            buttonStates[data.row][data.column] = false;
        }
    })
})
