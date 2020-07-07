//UserSide Code
$(function(){
    let socket = io();
    var playButton = $('#play');
    var stopButton = $('#stop');
    var pauseButton = $('#pause');

    var steps = 4;
    var channels = 3;
    var buttonStates = Array(channels).fill().map(() => Array(steps).fill("") );
    var channelAudio;
    var channelNames;
    var channelContainer = $('.channel-container');
    channelContainer.html("");

    socket.on('initialise',function(data){
        steps = data.steps;
        channels = data.channels;
        channelNames = data.channelNames;
        channelAudio = new Array(channels);
        buttonStates = data.buttonStates;
        volValues = data.volValues;
        for(let i = 0; i < channels; i++){
            channelAudio[i] = document.getElementById(data.channelNames[i])
            channelContainer.append("<div class = 'channel' id = c"+ i +"><p>"+ data.channelNames[i] +"</p> <input type='range' min='0' max='100' value='80' class='vSlider' id='channel"+ i +"Slider'></div>");

            channel = $('.channel#c'+i);
            for(let j = 0; j < steps; j++){
                channel.append("<button id = b"+ j +"> </button>")
                if(buttonStates[i][j] === ""){
                    $('.channel#c'+i+ " button#b"+j).css('background','white')
                }
                else{
                    $('.channel#c'+i+ " button#b"+j).css('background',buttonStates[i][j])
                }
            }
            channelAudio[i].volume = Math.pow(volValues[i] / 100, 3);
            $('#channel'+i+'Slider').val(volValues[i]);
        }

        $('.channel button').click(function(){
            var parentID = $(this).parent().attr("id");
            var ID = this.id;
            row = parentID.split('c')[1];
            column = ID.split('b')[1];
            socket.emit('button click', {row: row, column: column})
        })

        delay = (60000/data.bpm) / 2;
        bpmValueDisplay.text(data.bpm);
        bpmSlider.val(data.bpm);

        $('.vSlider').on('change', function(){
            let volChannel = this.id;
            let vol = this.value;
            socket.emit('volume change', {volChannel: volChannel, vol: vol});
        })
    })

    var playing = false;
    var timestep = 0;
    var delay = 250;

    playButton.click(function(){
        if (!playing){
            playing = true;
            socket.emit('play');
            play(timestep);
        }
    })

    function play(step){
        for (let i = 0; i < channels; i++){
            if (buttonStates[i][step]){
                channelAudio[i].pause()
                channelAudio[i].currentTime = 0;
                channelAudio[i].play()
            }
        }

        timestep++;
        if(timestep > steps-1){
            timestep = 0;
        }
        setTimeout(function(){
            if(playing){play(timestep)}
        }, delay)
    }

    stopButton.click(function(){
        if (playing){
            playing = false;
            socket.emit('stop');
            timestep = 0;
        }
    })

    pauseButton.click(function(){
        if (playing){
            playing = false;
            socket.emit('pause');
        }
    })

    var bpmSlider = $('#bpmSlider')
    var bpmValueDisplay = $('#bpmValue')

    bpmSlider.on('change', function(){
        bpm = this.value;
        socket.emit('bpm', bpm);
    })

    document.onmousemove = handleMouseMove;
    var cursorContainer = $('.cursor-container');

    function handleMouseMove(event){
        socket.emit('cursor', {x:event.pageX, y:event.pageY});
    }

    socket.on('cursor',function(data){
        //change cursor object location to data.x and data.y
        id = data.colour.replace(/[(),]+/g, "")
        console.log(id + " " + data.x + ", " + data.y)
        cursor = $('#cur'+id);
        cursor.css('left', data.x)
        cursor.css('top', data.y)
    })

    socket.on('add cursor', function(data){
        id = data.replace(/[(),]+/g, "");
        console.log('cursor added with id ' + id)
        cursorContainer.append("<div class = 'cursor' id =cur"+ id +"></div>")
        $('#cur'+id).css('background',data)
    })

    socket.on('remove cursor', function(data){
        id = data.replace(/[(),]+/g, "");
        $('#cur'+id).remove()
    })

    socket.on('bpm',function(data){
        delay = (60000/data) / 2;
        bpmValueDisplay.text(data);
        bpmSlider.val(data);
    })
    
    socket.on('button click', function(data){
        if (data.state){
            $('.channel#c'+data.row+ " button#b"+data.column).css('background',data.colour)
            buttonStates[data.row][data.column] = true;
        }
        else{
            $('.channel#c'+data.row+ " button#b"+data.column).css('background','white')
            buttonStates[data.row][data.column] = false;
        }
    })

    socket.on('play', function(){
        if (!playing){
            playing = true;
            play(timestep);
        }
    })

    socket.on('stop', function(){
        playing = false;
        timestep = 0;
    })

    socket.on('pause',function(){
        if (playing){
            playing = false;
        }
    })

    socket.on('volume change', function(data){
        channelAudio[data.volChannel[7]].volume = Math.pow(data.vol/100, 3);
        $('#' + data.volChannel).val(data.vol);
    })
})
