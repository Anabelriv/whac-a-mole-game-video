//game hiding moles
const holes = document.querySelectorAll('.hole');
const scoreBoard = document.querySelector('.score');
//const moles = document.querySelectorAll('.mole'); // this is needed for the game 
let moles = {}; // this is needed for the motion recognition
let lastHole;
let timeUp = false;
let score = 0;


//Webcam

const webcamElement = document.getElementById('webcam');
const webcam = new Webcam(webcamElement, 'user');
//motion detection

let timeOut, lastImageData;
let canvasSource = $("#canvas-source")[0];
let canvasBlended = $("#canvas-blended")[0];
let contextSource = canvasSource.getContext('2d');
let contextBlended = canvasBlended.getContext('2d');
//let moles = {};
//const audioPath = "sound"

contextSource.translate(canvasSource.width, 0);
contextSource.scale(-1, 1);

// // swtich to turn on camera
$("#webcam-switch").change(function () {
    if (this.checked) {
        $('.md-modal').addClass('md-show');
        webcam.start()
            .then(result => {
                cameraStarted();
                startMotionDetection();
                hideAppearMole();
            })
            .catch(err => {
                console.log(err);
            });
    }
    else {
        $("#errorMsg").addClass("d-none");
        webcam.stop();
        cameraStopped();
        setAllMoleReadyStatus(false);
    }
});

function setMoleReady(mole) {
    //mole.ready = true;
}

function setAllMoleReadyStatus(isReady) {
    // //for (var moleName in moles) {
    //     moles[moleName].ready = isReady;
    // }
}

// getting the measures of the screen and the small black screen and the sizes of the moles
$('.mole').on('load', function (event) {
    var viewWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    var ratioWidth = canvasBlended.width / viewWidth;
    var ratioHeight = canvasBlended.height / viewHeight;
    moles[this.attributes['vm-id'].value] = {
        id: this.attributes['vm-id'].value,
        name: this.attributes['name'].value,
        ready: this.attributes['ready'].value,
        width: this.width * ratioWidth,
        height: this.height * ratioHeight,
        x: this.x * ratioWidth,
        y: this.y * ratioHeight
    }
}).each(function () {
    if (this.complete) $(this).trigger('load');
});

function startMotionDetection() {
    setAllMoleReadyStatus(false);
    update();
    setTimeout(setAllMoleReadyStatus, 1000, true);
}

function playHover(mole) {
    if (!mole.ready) return;
    mole.ready = false;
    updateScore();
    // throttle the note
    setTimeout(setMoleReady, 500, mole);

}

const scoreElement = document.getElementById('scoreEl')

function updateScore() {
    score++;
    scoreElement.textContent = score;
};

function setMoleReady(mole) {
    mole.ready = true;
}

function hideAppearMole() {
    function randomTime(min, max) {
        return Math.round(Math.random() * (max - min) + min);
    }
    function randomHole(holes) {
        const idx = Math.floor(Math.random() * holes.length);
        const hole = holes[idx];
        if (hole === lastHole) {
            return randomHole(holes);
        }
        lastHole = hole;
        return hole;
    }
    function peep() {
        const time = randomTime(200, 1000);
        const hole = randomHole(holes);
        hole.classList.add('up');
        setTimeout(() => {
            hole.classList.remove('up');
            if (!timeUp) peep();
        }, time);
    };
    function startPlay() {
        //scoreBoard.textContent = 0;
        timeUp = false;
        peep();
        setTimeout(() => timeUp = true, 20000)
    };
    startPlay();
}
// browser response - understood
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

// drawing constantly
function update() {
    drawVideo();
    blend();
    checkAreas();
    requestAnimFrame(update);
}
// painting the canvas
function drawVideo() {
    contextSource.drawImage(webcamElement, 0, 0, webcamElement.width, webcamElement.height);
}
// this is the update of the previous image and the new image difference
function blend() {
    var width = canvasSource.width;
    var height = canvasSource.height;
    // get webcam image data
    var sourceData = contextSource.getImageData(0, 0, width, height);
    // create an image if the previous image doesn’t exist
    if (!lastImageData) lastImageData = contextSource.getImageData(0, 0, width, height);
    // create a ImageData instance to receive the blended result
    var blendedData = contextSource.createImageData(width, height);
    // blend the 2 images
    differenceAccuracy(blendedData.data, sourceData.data, lastImageData.data);
    // draw the result in a canvas
    contextBlended.putImageData(blendedData, 0, 0);
    // store the current webcam image
    lastImageData = sourceData;
}

//keeping it positive
function fastAbs(value) {
    //equal Math.abs
    return (value ^ (value >> 31)) - (value >> 31);
}
// 0x it means in hexadecimal/base16
function threshold(value) {
    return (value > 0x15) ? 0xFF : 0;
}

// this more or less
function differenceAccuracy(target, data1, data2) {
    if (data1.length != data2.length) return null;
    var i = 0;
    while (i < (data1.length * 0.25)) {
        var average1 = (data1[4 * i] + data1[4 * i + 1] + data1[4 * i + 2]) / 3;
        var average2 = (data2[4 * i] + data2[4 * i + 1] + data2[4 * i + 2]) / 3;
        var diff = threshold(fastAbs(average1 - average2));
        target[4 * i] = diff;
        target[4 * i + 1] = diff;
        target[4 * i + 2] = diff;
        target[4 * i + 3] = 0xFF;
        ++i;
    }
}

function checkAreas() {
    // loop over the drum areas
    for (var moleName in moles) {
        var mole = moles[moleName];
        if (mole.x > 0 || mole.y > 0) {
            var blendedData = contextBlended.getImageData(mole.x, mole.y, mole.width, mole.height);
            var i = 0;
            var average = 0;
            // loop over the pixels
            while (i < (blendedData.data.length * 0.25)) {
                // make an average between the color channel
                average += (blendedData.data[i * 4] + blendedData.data[i * 4 + 1] + blendedData.data[i * 4 + 2]) / 3;
                ++i;
            }
            // calculate an average between of the color values of the drum area
            average = Math.round(average / (blendedData.data.length * 0.25));
            if (average > 20) {
                // over a small limit, consider that a movement is detected
                // play a note and show a visual feedback to the user
                //console.log(drum.name + '-' + average)
                console.log("hi")
                playHover(mole); // I need to change this to whack function??
            }
        }
    }
}

function cameraStarted() {
    $("#errorMsg").addClass("d-none");
    $("#webcam-caption").html("on");
    $("#webcam-control").removeClass("webcam-off");
    $("#webcam-control").addClass("webcam-on");
    $(".webcam-container").removeClass("d-none");
    $(canvasBlended).delay(600).fadeIn();
    $(".motion-cam").delay(600).fadeIn();
    $("#wpfront-scroll-top-container").addClass("d-none");
}

function cameraStopped() {
    $("#errorMsg").addClass("d-none");
    $("#webcam-control").removeClass("webcam-on");
    $("#webcam-control").addClass("webcam-off");
    $(".webcam-container").addClass("d-none");
    $("#webcam-caption").html("Click to Start Webcam");
    $('.md-modal').removeClass('md-show');
}
// end of camera
