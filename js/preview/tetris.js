// // --------------------------------------------------
// // TETRIS
// // --------------------------------------------------
// var tetris = (function() {
//   var tetrisCanvas = querySelector('#t');
//   var tetrisContext = tetrisCanvas.getContext('2d');

//   tetrisContext.strokeStyle = '#000';
//   tetrisContext.lineWidth = 0.5;
//   tetrisContext.font = '4px monospace';

//   var BOARD_WIDTH = 10;
//   var BOARD_HEIGHT = 20;
//   var TETRIMINO_WIDTH = 5;
//   var GAME_X = 53;  // game is taller than it is wide
//   var GAME_Y = 10;
//   var GAME_WIDTH = TETRIMINO_WIDTH * BOARD_WIDTH;
//   var GAME_HEIGHT = TETRIMINO_WIDTH * BOARD_HEIGHT;
//   var GAME_X_RIGHT = CANVAS_WIDTH - GAME_X - 1;
//   var BOX_WIDTH = 35;
//   var BOX_HEIGHT = 10;

//   var COLORS = [
//     '',
//     'cyan',    // 1
//     'yellow',  // 2
//     'purple',  // 3
//     'green',   // 4
//     'red',     // 5
//     'blue',    // 6
//     'orange'   // 7
//   ];

//   var boardStart = [
//     0, 0, 4, 0, 0, 0, 0, 7, 0, 2,
//     6, 4, 4, 0, 0, 0, 2, 7, 2, 2,
//     6, 6, 4, 6, 1, 1, 2, 7, 6, 0,
//     6, 4, 3, 0, 1, 1, 5, 5, 5, 5
//   ];
//   var board = [];
//   var positions = [1, 7, 3];
//   var counter = 0;
//   var score, highScore, currentTermino, seconds, positionIndex, boardRow, nextTermino;

//   function reset() {
//     seconds = 11;
//     score = 1950;
//     highScore = 2500;
//     positionIndex = 0;
//     board = Array.from(boardStart);
//     boardRow = 16;

//     currentTermino = sprite({
//       x: GAME_X + 2 + TETRIMINO_WIDTH * 4,
//       y: GAME_Y + 10,
//       color: COLORS[3],
//       counter: 0,
//       rotateCounter: 0,
//       pattern: [
//         1, 0, 0,
//         1, 1, 1,
//         0, 0, 0,
//       ],
//       rowLength: 3,
//       context: tetrisContext,
//       // @see http://stackoverflow.com/questions/15170942/how-to-rotate-a-matrix-in-an-array-in-javascript
//       rotate: function() {
//         var newGrid = [];

//         for (var i = 0; i < this.pattern.length; i++) {
//           // convert to x/y
//           var x = i % this.rowLength;
//           var y = i / this.rowLength | 0;

//           // find new x/y
//           var newX = this.rowLength - y - 1;
//           var newY = x;

//           // convert to index
//           var newPosition = newY * this.rowLength + newX;
//           newGrid[newPosition] = this.pattern[i];
//         }

//         this.pattern = newGrid;
//       },
//       update: function(dt) {
//         this.counter += dt;
//         this.rotateCounter += dt;

//         if (this.rotateCounter > 0.4) {
//           if (positionIndex < positions.length) {
//             this.rotate();
//           }

//           if (this.x > GAME_X + 2 + positions[positionIndex] * TETRIMINO_WIDTH) {
//             this.x -= TETRIMINO_WIDTH;
//           }
//           else if (this.x < GAME_X + 2 + positions[positionIndex] * TETRIMINO_WIDTH) {
//             this.x += TETRIMINO_WIDTH;
//           }
//           else if (positionIndex < positions.length) {
//             positionIndex++;
//           }

//           this.rotateCounter -= 0.4;
//         }

//         // slow down the snake fps
//         if (this.counter > 0.5) {

//           if (this.y < GAME_Y + boardRow * TETRIMINO_WIDTH) {
//             this.y += TETRIMINO_WIDTH;
//           }
//           // clear row
//           else if (board.length > 30) {
//             board[3] = 3;
//             board.splice(10, 10);
//             boardRow++;
//             currentTermino = Object.assign({}, nextTermino);
//             currentTermino.x = GAME_X + 2 + TETRIMINO_WIDTH * 4;
//             currentTermino.y = GAME_Y + TETRIMINO_WIDTH;
//             score += 100;

//             nextTermino.color = COLORS[1];
//             nextTermino.pattern = [
//               1, 1, 0,
//               1, 1, 0
//             ];
//           }

//           this.counter -= 0.5;
//         }
//       },
//       render: function() {
//         this.context.fillStyle = this.color;

//         for (var i = 0, r = 0; i < this.pattern.length; i++) {
//           if (this.pattern[i]) {
//             var x = this.x + (i % this.rowLength) * TETRIMINO_WIDTH;
//             var y = this.y + r * TETRIMINO_WIDTH;

//             tetrisContext.fillRect(x, y, TETRIMINO_WIDTH, TETRIMINO_WIDTH);
//             tetrisContext.strokeRect(x + 0.5, y + 0.5, TETRIMINO_WIDTH + 1, TETRIMINO_WIDTH + 1);
//           }

//           if (i % this.rowLength == this.rowLength - 1) {
//             r++;
//           }
//         }
//       }
//     });

//     nextTermino = Object.assign({}, currentTermino, {
//       color: COLORS[5],
//       pattern: [
//         1, 1, 0,
//         0, 1, 1
//       ],
//       x: 119,
//       y: 15
//     });
//   }

//   reset();

//   // loop
//   return {
//     update: function(dt) {
//       counter += dt;

//       if (counter > 1) {
//         seconds++;
//         counter -= 1;
//       }

//       currentTermino.update(dt);
//     },
//     render: function() {
//       tetrisContext.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

//       currentTermino.render();
//       nextTermino.render();

//       for (var i = 0, r = boardRow; i < board.length; i++) {
//         if (board[i]) {
//           tetrisContext.fillStyle = COLORS[ board[i] ];

//           var x = GAME_X + 2 + (i % 10) * TETRIMINO_WIDTH;
//           var y = GAME_Y + r * TETRIMINO_WIDTH;

//           tetrisContext.fillRect(x, y, TETRIMINO_WIDTH, TETRIMINO_WIDTH);
//           tetrisContext.strokeRect(x + 0.5, y + 0.5, TETRIMINO_WIDTH + 1, TETRIMINO_WIDTH + 1);
//         }

//         if (i % 10 == 9) {
//           r++;
//         }
//       }

//       // box order: top, right, bottom, left

//       // walls
//       tetrisContext.fillStyle = '#fff';
//       tetrisContext.fillRect(GAME_X, GAME_Y, GAME_WIDTH + 4, 2);
//       tetrisContext.fillRect(GAME_X_RIGHT, GAME_Y, 2, GAME_HEIGHT + 2);
//       tetrisContext.fillRect(GAME_X, GAME_Y + GAME_HEIGHT, GAME_WIDTH + 4, 2);
//       tetrisContext.fillRect(GAME_X, GAME_Y, 2, GAME_HEIGHT);

//       // time box
//       tetrisContext.fillRect(10, 12, 4, 1);
//       tetrisContext.fillRect(26, 12, 20, 1);
//       tetrisContext.fillRect(10 + BOX_WIDTH, 12, 1, BOX_HEIGHT + 1);
//       tetrisContext.fillRect(10, 12 + BOX_HEIGHT, BOX_WIDTH, 1);
//       tetrisContext.fillRect(10, 12, 1, BOX_HEIGHT);
//       tetrisContext.fillText('2 : ' + seconds, 15, 19);
//       tetrisContext.fillText('Time', 15, 13);

//       // next box
//       tetrisContext.fillRect(114, 12, 4, 1);
//       tetrisContext.fillRect(130, 12, 20, 1);
//       tetrisContext.fillRect(114 + BOX_WIDTH, 12, 1, 16 + 1);
//       tetrisContext.fillRect(114, 12 + 16, BOX_WIDTH, 1);
//       tetrisContext.fillRect(114, 12, 1, 16);
//       tetrisContext.fillText('Next', 119, 13);

//       // score
//       tetrisContext.fillRect(114, 40, 4, 1);
//       tetrisContext.fillRect(133, 40, 17, 1);
//       tetrisContext.fillRect(114 + BOX_WIDTH, 40, 1, BOX_HEIGHT + 1);
//       tetrisContext.fillRect(114, 40 + BOX_HEIGHT, BOX_WIDTH, 1);
//       tetrisContext.fillRect(114, 40, 1, BOX_HEIGHT);
//       tetrisContext.fillText(score, 119, 48);
//       tetrisContext.fillText('Score', 119, 42);

//       // high score
//       tetrisContext.fillRect(114, 57, 4, 1);
//       tetrisContext.fillRect(145, 57, 5, 1);
//       tetrisContext.fillRect(114 + BOX_WIDTH, 57, 1, BOX_HEIGHT + 1);
//       tetrisContext.fillRect(114, 57 + BOX_HEIGHT, BOX_WIDTH, 1);
//       tetrisContext.fillRect(114, 57, 1, BOX_HEIGHT);
//       tetrisContext.fillText(highScore, 119, 64);
//       tetrisContext.fillText('High Score', 119, 58);
//     },
//     reset: reset
//   };
// })();