const cvs = document.getElementById('tetris');
ctx = cvs.getContext('2d');
const scoreElement = document.getElementById('score'); 

const ROW = 20;
const COL = COLUMN = 10;
const SQ = squareSize = 20;
const VACANT = "white"; // empty square color

//drawing a square!!
function drawSquare(x,y,color) {
    ctx.fillStyle = color;
    ctx.fillRect(x*SQ, y*SQ, SQ, SQ);
    ctx.strokeStyle = "black";
    ctx.strokeRect(x*SQ, y*SQ, SQ, SQ);

};

// create the game board!!
let board = [];
for (let r = 0; r < ROW; r++){
    board[r] = [];
    for(let c = 0; c < COL; c++){
        board[r][c] = VACANT;
    }
};

//drawing the board function!!
function drawBoard(){
    for (let r = 0; r < ROW; r++){
        for (let c = 0; c < COL; c++){
            drawSquare(c, r, board[r][c])
        }
    }
};
drawBoard();

//assigning pieces colors!
const PIECES = [
    [Z,'green'],
    [S,'blue'],
    [T,'yellow'],
    [O,'purple'],
    [L,'orange'],
    [I,'red'],
    [J,'pink']
];

// generate random pieces 
function randomPiece(){
    let r = randomN = Math.floor(Math.random() * PIECES.length) // generate a number between 0 and 6
    return new Piece(PIECES[r][0], PIECES[r][1]);
};

//initiate a piece!!!
let p = randomPiece();

// the tetris piece creation function!!
function Piece(tetromino, color){
  this.tetromino = tetromino;
    this.color = color;
    
    this.tetrominoN = 0; // we start from the first pattern
    this.activeTetromino = this.tetromino[this.tetrominoN];
    //controlling the pieces!!
    this.x = 3;
    this.y = -2;
};

// filling the board with pieces function
Piece.prototype.fill = function(color) {
    for (let r =0; r < this.activeTetromino.length; r++) {
        for (let c = 0; c < this.activeTetromino.length; c++) {
            // drawing only occupied squares
            if(this.activeTetromino[r][c]){
                drawSquare(this.x + c, this.y + r, color);
            }
        }
    }
};

//drawing piece function!!
Piece.prototype.draw = function() {
   this.fill(this.color)
};

//undraw the previous piece function
Piece.prototype.unDraw = function() {
  this.fill(VACANT)
};

// move the piece down
Piece.prototype.moveDown = function (){
    if (!this.collision(0, 1, this.activeTetromino)){
        this.unDraw();
        this.y++;
        this.draw();
    }else {
        // we lock the piece and generate a new piece
        this.lock();
        p = randomPiece();
    }
    
};

// move the piece to the right
Piece.prototype.moveRight = function (){
    if (!this.collision(1, 0, this.activeTetromino)){
        this.unDraw();
        this.x++;
        this.draw();
    }
};

// move the piece to the left
Piece.prototype.moveLeft = function (){
    if (!this.collision(-1, 0, this.activeTetromino)){
        this.unDraw();
        this.x--;
        this.draw();
    }
};

// rotate the piece
Piece.prototype.rotate = function (){
    let nextPattern = this.tetromino[(this.tetrominoN + 1) % this.tetromino.length]
    let kick = 0;

    if (this.collision(0, 0, nextPattern)){
        if (this.x > COL/2){
            // it's right wall
            kick = -1 // move the piece to the left
        } else {
            //it's the left wall
            kick = 1 // move the piece to the right
        }
    }

    if (!this.collision(0, 0, nextPattern)){
        this.unDraw();
        this.x += kick;
        this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length;
        this.activeTetromino = this.tetromino[this.tetrominoN];
        this.draw();
    }
};

let score = 0;
// locking the piece function 
Piece.prototype.lock = function() {
    for (let r =0; r < this.activeTetromino.length; r++) {
        for (let c = 0; c < this.activeTetromino.length; c++) {
            // skip vacant squares
            if(!this.activeTetromino[r][c]){
                continue;
            }
            // pieces to lock on top of the board = game over
            if(this.y + r < 0){
                alert('GAME OVER');
                //stop the animation frame
                gameOver = true;
                break;
            }
            // locking the piece
            board[this.y +r][this.x + c] = this.color;
        }
    }
    // remove a row
    for (let r = 0; r < ROW; r++){
        let isRowFull = true;
        for (let c = 0; c < COL; c++){
            isRowFull = isRowFull && (board[r][c] != VACANT)
        }
        if (isRowFull){
            // move down all the rows 
            for (let y = r; y > 1; y--){
                for (let c = 0; c < COL; c++){
                    board[y][c] = board[y - 1][c]
                }
            }
            //the top row of the board will have no row above it
            for (let c = 0; c < COL; c++){
                    board[0][c] = VACANT;
            }
            //increment the score
            score += 10;
        }
    }
    drawBoard();
    
    // updating the score 
    scoreElement.innerHTML = score;
};


// collision function   
Piece.prototype.collision = function (x,y,piece) {
    for (let r = 0; r< piece.length; r++){
        for (let c = 0; c< piece.length; c++){
            // checking of the square is empty
            if (!piece[r][c]){
                continue;
            }
            //check the pieces's coordinates after moving
            let newX = this.x + c + x;
            let newY = this.y + r + y;

            if(newX < 0 || newX >= COL || newY >= ROW){
                return true;
            }
            if (newY < 0){
                continue;
            }
            // check if there is a locked piece
            if (board[newY][newX] != VACANT){
                return true;
            }
        }
    }
    return false;
};

// control the piece movement
document.addEventListener('keydown',CONTROL);

function CONTROL(event){
    if (event.keyCode === 37){
        p.moveLeft();
        dropStart = Date.now();
    } else if (event.keyCode === 38){
        p.rotate();
        dropStart = Date.now();
    }else if (event.keyCode === 39){
        p.moveRight();
        dropStart = Date.now();
    }else if (event.keyCode === 40){
        p.moveDown();
    }
};

// drop down function every 1 second
let dropStart = Date.now();
let gameOver = false;
function drop(){
    let now = Date.now(); 
    let delta = now - dropStart;
    if (delta > 1000){
        p.moveDown();
        dropStart = Date.now();

    }
    if (!gameOver){
        requestAnimationFrame(drop);
    }
    
}

drop();