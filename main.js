//UserSide Code
$(function(){
    let socket = io();
    var playButton = $('#play');
    var buttons = [$('#1'), $('#2'), $('#3'), $('#4')];
    // var myMusic = $('#music');
    var myMusic = document.getElementById("music");
    let playing = false;    // Variable to track play button press

    playButton.click(function(){
        playing = !playing;
        while(playing){
            setTimeout(function () {
                for(let i = 0; i < 4; i++){
                    console.log('Hello world!!!!!');
                }
            }, 1000);
        }
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
        }
        else{
            buttons[data.buttonNumber-1].css('background', 'white');
        }
    })
})

//Not sure if we need to use JQuery