//UserSide Code
$(function(){
    let socket = io();
    var playButton = $('#play');
    var stopButton = $('#stop');
    var buttons = [$('#1'), $('#2'), $('#3'), $('#4')];
    var buttonStates = [false,false,false,false];
    var playing = false;
    var timestep = 0;
    // var myMusic = $('#music');
    var myMusic = document.getElementById("music");

    playButton.click(function(){
        playing = true;
        play(timestep);
    })

    function play(timestep){
        if (buttonStates[timestep]){
            myMusic.pause()
            myMusic.currentTime = 0;
            myMusic.play()
            console.log((timestep+1) + ' kick' )
        }
        timestep++;
        if(timestep > 3){
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
    
    buttons.forEach(function(button){
        button.click(function(){
            buttonNumber = buttons.indexOf(button) + 1;
            console.log('button ' + buttonNumber + ' clicked!');
            socket.emit('button click', buttonNumber);
        })
    })

    // button1.click(function(){
    //     console.log('button 1 clicked');
    //     socket.emit('button click', 1);
    // })

    socket.on('button click', function(data){
        if (data.buttonState){
            buttons[data.buttonNumber-1].css('background', 'red');
            buttonStates[data.buttonNumber-1] = true;
        }
        else{
            buttons[data.buttonNumber-1].css('background', 'white');
            buttonStates[data.buttonNumber-1] = false;
        }
    })
})

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds){
        break;
      }
    }
  }

//Not sure if we need to use JQuery