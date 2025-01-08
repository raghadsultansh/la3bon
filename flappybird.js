//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdWidth = 34; //width/height ratio = 408/228 = 17/12
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImgs = [];
let birdImgsIndex = 0;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
}

//pipes
let pipeArray = [];
let pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -2; //pipes moving left speed
let velocityY = 0; //bird jump speed
let gravity = 0.4;

let gameOver = false;
let score = 0;

// sounds
let wingSound = new Audio('sounds/sfx_wing.wav');
let hitSound = new Audio('sounds/sfx_hit.wav');
let bgm = new Audio('sounds/bgm_mario.mp3');
bgm.volume = 0.65;
bgm.loop = true;

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

    // load  images
    for (let i = 0; i < 4; i++) {
        let birdImg = new Image();
        birdImg.src = `images/flappybird${i}.png`;
        birdImgs.push(birdImg);
    }

    topPipeImg = new Image();
    topPipeImg.src = "images/toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "images/bottompipe.png";

    requestAnimationFrame(update);
    setInterval(placePipes, 1500); //every 1.5 seconds

    document.addEventListener("keydown", moveBird);
    document.addEventListener("touchstart", function (e) {
        e.preventDefault(); // Prevent zooming and scrolling on fast touches
        moveBirdTouch(e);   // Call the touch handler
    }, {passive: false}); // Passive: false is required to allow e.preventDefault()

}

let lastTime = 0; // Last timestamp
const fps = 60; // Target frames per second
const frameDuration = 1000 / fps; // Milliseconds per frame

function update(timestamp) {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }

    // Calculate elapsed time
    const elapsedTime = timestamp - lastTime;

    // Only update the game state if enough time has passed
    if (elapsedTime >= frameDuration) {
        lastTime = timestamp;

        context.clearRect(0, 0, board.width, board.height);

        // bird
        velocityY += gravity;
        bird.y = Math.max(bird.y + velocityY, 0); // Apply gravity, limit bird.y to canvas top
        context.drawImage(birdImgs[birdImgsIndex], bird.x, bird.y, bird.width, bird.height);
        birdImgsIndex++; // increment to next frame
        birdImgsIndex %= birdImgs.length; // circle back with modulus, max frames is 4

        if (bird.y > board.height) {
            gameOver = true;
        }

        // pipes
        for (let i = 0; i < pipeArray.length; i++) {
            let pipe = pipeArray[i];
            pipe.x += velocityX;
            context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

            if (!pipe.passed && bird.x > pipe.x + pipe.width) {
                score += 0.5; // Increment score for each pipe passed
                pipe.passed = true;
            }

            if (detectCollision(bird, pipe)) {
                hitSound.play();
                gameOver = true;
            }
        }

        // Clear pipes
        while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
            pipeArray.shift(); // Remove pipes that have gone off-screen
        }

        // score
        context.fillStyle = "white";
        context.font = "45px sans-serif";
        context.fillText(score, 5, 45);

        if (gameOver) {
            drawCenteredTextBox("!انتهت اللعبة", "اضغط لإعادة المحاولة");
            bgm.pause();
            bgm.currentTime = 0;
        }
    }
}

function drawCenteredTextBox(mainText, secondaryText) {
    context.save();  // Save canvas state

    context.font = "30px sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";

    // Calculate the box size based on the largest text width
    let textWidth = Math.max(context.measureText(mainText).width, context.measureText(secondaryText).width);
    let boxPadding = 20;
    let boxWidth = textWidth + boxPadding;
    let boxHeight = 100;  // Increased height for two lines of text

    // Center the box on the canvas
    let boxX = boardWidth / 2 - boxWidth / 2;
    let boxY = boardHeight / 2 - boxHeight / 2;

    // Draw the box background
    context.fillStyle = "rgba(0, 0, 0, 0.7)";  // Alpha = 0.7 for semi-transparency
    context.fillRect(boxX, boxY, boxWidth, boxHeight);

    // Draw the main text inside the box
    context.fillStyle = "white";
    context.fillText(mainText, boardWidth / 2, boardHeight / 2 - 15);

    // Draw the secondary text inside the box (below the main text)
    context.font = "20px Arial";
    context.fillText(secondaryText, boardWidth / 2, boardHeight / 2 + 25);

    context.restore();  // Restore canvas state
}


function placePipes() {
    if (gameOver) {
        return;
    }

    //(0-1) * pipeHeight/2.
    // 0 -> -128 (pipeHeight/4)
    // 1 -> -128 - 256 (pipeHeight/4 - pipeHeight/2) = -3/4 pipeHeight
    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4;

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyX") {
        velocityY = -6;
        wingSound.play();
        if (bgm.paused) bgm.play();

        // If the game is over, restart it on key press
        if (gameOver) {
            restartGame();
        }
    }
}

// Touch control version of moveBird function
function moveBirdTouch(e) {
    velocityY = -6;
    wingSound.play();
    if (bgm.paused) bgm.play();

    // If the game is over, restart it on screen touch
    if (gameOver) {
        restartGame();
    }
}

// Restart game function to handle both touch and key events
function restartGame() {
    bird.y = birdY;
    pipeArray = [];
    score = 0;
    gameOver = false;
    bgm.currentTime = 0;
    bgm.play();
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
        a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
        a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
        a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}