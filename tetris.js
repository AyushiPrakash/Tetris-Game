const cvs = document.getElementById("tetris");
const ctx = cvs.getContext("2d"); // Method Properties
const scoreElement = document.getElementById("score");

const ROW = 20;
const COL = (COLUMN = 10);
const SQ = (squareSize = 20);
const VACANT = "WHITE"; // color of an empty square

// draw a square
function drawSquare(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * SQ, y * SQ, SQ, SQ); // (X, Y, width, height)

  ctx.strokeStyle = "black";
  ctx.strokeRect(x * SQ, y * SQ, SQ, SQ); // (X, Y, width, height)
}

// create the board

let board = [];
for (r = 0; r < ROW; r++) {
  board[r] = [];
  for (c = 0; c < COL; c++) {
    board[r][c] = VACANT; // All squares are vacent for now
  }
}

// draw the board
function drawBoard() {
  for (r = 0; r < ROW; r++) {
    for (c = 0; c < COL; c++) {
      drawSquare(c, r, board[r][c]); // (c=x , r=y ,board[r][c]=color )
    }
  }
}

drawBoard();

// the pieces and their colors

const PIECES = [
  [Z, "#ff0b55"],
  [S, "#056674"],
  [T, "#FFDD00"],
  [O, "#1FAB89"],
  [L, "#9c297f"],
  [I, "#12cad6"],
  [J, "#81b214"],
];

// generate random pieces

function randomPiece() {
  let r = (randomN = Math.floor(Math.random() * PIECES.length)); // to generate nos bw 0 and 6
  return new Piece(PIECES[r][0], PIECES[r][1]); //1 is color
}

let p = randomPiece();

// The Object Piece

function Piece(tetromino, color) {
  this.tetromino = tetromino;
  this.color = color;

  this.tetrominoN = 0; //start from the first pattern(index = 0)
  this.activeTetromino = this.tetromino[this.tetrominoN]; // Current tetromino(index = 0)

  // to control the pieces(default position(above board))
  this.x = 3;
  this.y = -2;
}

// fill function

Piece.prototype.fill = function (color) {
  for (r = 0; r < this.activeTetromino.length; r++) {
    for (c = 0; c < this.activeTetromino.length; c++) {
      // draw only occupied squares
      if (this.activeTetromino[r][c]) {
        drawSquare(this.x + c, this.y + r, color); // X=this.x+c , Y=this.y+r
      }
    }
  }
};

// draw a piece to the board

Piece.prototype.draw = function () {
  this.fill(this.color);
};

// undraw a piece

Piece.prototype.unDraw = function () {
  this.fill(VACANT);
};

// move Down the piece

Piece.prototype.moveDown = function () {
  if (!this.collision(0, 1, this.activeTetromino)) { // 0,1 = coordinates of future piece
    this.unDraw();
    this.y++;
    this.draw();
  } else {
    // lock the piece and generate a new one
    this.lock();
    p = randomPiece();
  }
};

// move Right the piece

Piece.prototype.moveRight = function () {
  if (!this.collision(1, 0, this.activeTetromino)) {
    this.unDraw();
    this.x++;
    this.draw();
  }
};

// move Left the piece

Piece.prototype.moveLeft = function () {
  if (!this.collision(-1, 0, this.activeTetromino)) {
    this.unDraw();
    this.x--;
    this.draw();
  }
};

// rotate the piece

Piece.prototype.rotate = function () {
  let nextPattern = this.tetromino[
    (this.tetrominoN + 1) % this.tetromino.length // (0+1)%4 = 1
  ];
  let kick = 0;

  //to check if there is no collision
  if (this.collision(0, 0, nextPattern)) { //0,0 = coordinates remains same after rotation
    if (this.x > COL / 2) {
      // its the right wall
      kick = -1; // we need to move the piece to the left
    } else {
      // its the left wall
      kick = 1; // we need to move the piece to the right
    }
  }

  if (!this.collision(kick, 0, nextPattern)) {
    this.unDraw();
    this.x += kick;
    this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length; // (0+1)%4 => 1
    this.activeTetromino = this.tetromino[this.tetrominoN];
    this.draw();
  }
};

let score = 0;

Piece.prototype.lock = function () {
  for (r = 0; r < this.activeTetromino.length; r++) {
    for (c = 0; c < this.activeTetromino.length; c++) {
      // skip the vacant squares
      if (!this.activeTetromino[r][c]) {
        continue;
      }
      // pieces to lock on top = game over
      if (this.y + r < 0) { // Y position
        alert("Game Over");
        // stop request animation frame
        gameOver = true;
        break;
      }
      // we lock the piece
      board[this.y + r][this.x + c] = this.color; // square coordinates =  piece's color
    } 
  }

  // remove full rows
  for (r = 0; r < ROW; r++) {  //loop over all the rows on the board
    let isRowFull = true;
    for (c = 0; c < COL; c++) { //loop over column one by one
      isRowFull = isRowFull && board[r][c] != VACANT;
    }
    if (isRowFull) {
      // if the row is full
      // move down all the rows above it, board[5] = board[4]
      for (y = r; y > 1; y--) {
        for (c = 0; c < COL; c++) { //loop over column
          board[y][c] = board[y - 1][c];
        }
      }
      // the top row board[0][..] has no row above it
      for (c = 0; c < COL; c++) {
        board[0][c] = VACANT;
      }
      // increment the score
      score += 10;
    }
  }
  // update the board
  drawBoard();

  // update the score
  scoreElement.innerHTML = score;
};

// collision fucntion

Piece.prototype.collision = function (x, y, piece) { //x,y = future piece coordinates
  for (r = 0; r < piece.length; r++) {
    for (c = 0; c < piece.length; c++) {
      // if the square is empty, skip it
      if (!piece[r][c]) {
        continue;
      } 
      // coordinates of the piece after movement
      let newX = this.x + c + x;
      let newY = this.y + r + y;

      // conditions(if any square is beyond boundary)
      if (newX < 0 || newX >= COL || newY >= ROW) {
        return true;
      }
      // skip newY < 0; board[-1] will crash the game
      if (newY < 0) {
        continue;
      }
      // check if there is a locked piece alrady in place
      if (board[newY][newX] != VACANT) {
        return true;
      }
    }
  }
  return false;
};

// CONTROL the piece

document.addEventListener("keydown", CONTROL);

function CONTROL(event) {
  if (event.keyCode == 37) {
    p.moveLeft();
    dropStart = Date.now();
  } else if (event.keyCode == 38) {
    p.rotate();
    dropStart = Date.now();
  } else if (event.keyCode == 39) {
    p.moveRight();
    dropStart = Date.now();
  } else if (event.keyCode == 40) {
    p.moveDown();
  }
}

// drop the piece every 1sec

let dropStart = Date.now();
let gameOver = false;
function drop() {
  let now = Date.now();
  let delta = now - dropStart;
  if (delta > 1000) {  //delta= difference bw now time and last time when piece was droped
    p.moveDown();
    dropStart = Date.now();
  }
  if (!gameOver) {
    requestAnimationFrame(drop);
  }
}

drop();
