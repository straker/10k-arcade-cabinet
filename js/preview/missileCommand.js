// // --------------------------------------------------
// // MISSILE COMMAND
// // --------------------------------------------------
// var missleCommand = (function() {
//   var missileCommandCanvas = querySelector('#m');
//   var missileCommandContext = missileCommandCanvas.getContext('2d');

//   var MISSILE_START_Y = 8;

//   missileCommandContext.font = '8px monospace';

//   var ground = [
//     // left missile base
//     {x: 0, y: 110},
//     {x: 8, y: 103},
//     {x: 10, y: 105},
//     {x: 16, y: 105},
//     {x: 18, y: 103},
//     {x: 26, y: 110},

//     // left bump
//     {x: 35, y: 110},
//     {x: 36, y: 108},
//     {x: 38, y: 108},
//     {x: 39, y: 110},

//     // center missile base
//     {x: 70, y: 110},
//     {x: 75, y: 103},
//     {x: 77, y: 105},
//     {x: 83, y: 105},
//     {x: 85, y: 103},
//     {x: 90, y: 110},

//     // right bump
//     {x: 106, y: 110},
//     {x: 107, y: 108},
//     {x: 117, y: 108},
//     {x: 118, y: 110},

//     // right missile base
//     {x: 134, y: 110},
//     {x: 142, y: 103},
//     {x: 144, y: 105},
//     {x: 150, y: 105},
//     {x: 152, y: 103},
//     {x: 160, y: 110}
//   ];

//   var cities = [
//     {x: 26, y: 106},
//     {x: 42, y: 107},
//     {x: 55, y: 108},
//     {x: 92, y: 107},
//     {x: 108, y: 104},
//     {x: 123, y: 106}
//   ];

//   var missileColor = '#f00';
//   var counterMissileColor = '#00f';

//   // missiles
//   // 0 is up, 90 is right
//   var missiles = [];
//   var firstWave = [
//     {startX: 0, x: 0, y: MISSILE_START_Y, angle: 130, color: missileColor},
//     {startX: 10, x: 10, y: MISSILE_START_Y, angle: 162, color: missileColor},
//     {startX: 115, x: 115, y: MISSILE_START_Y, angle: 195, color: missileColor},
//     {startX: 150, x: 150, y: MISSILE_START_Y, angle: 195, color: missileColor}
//   ];
//   var secondWave = [
//     {startX: 70, x: 70, y: MISSILE_START_Y, angle: 210, color: missileColor},
//     {startX: 80, x: 80, y: MISSILE_START_Y, angle: 155, color: missileColor},
//     {startX: 106, x: 106, y: MISSILE_START_Y, angle: 180, color: missileColor},
//     {startX: 118, x: 118, y: MISSILE_START_Y, angle: 180, color: missileColor}
//   ];

//   var highScore = '7500';
//   var counter, added, counterMissiles, leftCounterMissles, centerCounterMissles, rightCounterMissles, explotions, score;

//   function reset() {
//     counter = 0;
//     timer = 0;
//     added = false;
//     explotions = [];
//     score = ' 0';

//     // counter missiles
//     counterMissiles = [
//       {pos: 'left', startX: 13, x: 13, startY: 105, y: 105, angle: 16, color: counterMissileColor, t: 3, e: 5.4},
//       {pos: 'left', startX: 13, x: 13, startY: 105, y: 105, angle: 12, color: counterMissileColor, t: 4, e: 5.8}
//     ];

//     // missiles
//     missiles.length = 0;
//     for (var i = 0; i < firstWave.length; i++) {
//       missiles.push(JSON.parse(JSON.stringify(firstWave[i])));
//     }

//     leftCounterMissles = centerCounterMissles = rightCounterMissles = 10;
//   }

//   reset();

//   // loop
//   return {
//     update: function(dt) {
//       counter += dt;

//       // slow down the game fps
//       if (counter > 1 / 25) {
//         timer += dt;

//         if (!added && timer >= 2) {
//           added = true;

//           for (var i = 0; i < secondWave.length; i++) {
//             missiles.push(JSON.parse(JSON.stringify(secondWave[i])));
//           }
//         }

//         // counter missiles
//         for (var i = 0, counterMissile; (counterMissile = counterMissiles[i]); ) {
//           if (timer >= counterMissile.t) {
//             missiles.push(counterMissile);
//             counterMissiles.splice(i, 1);

//             if (counterMissile.pos == 'left') {
//               leftCounterMissles--;
//             }
//             else if (counterMissile.pos == 'right') {
//               rightCounterMissles--;
//             }
//           }
//           else {
//             i++;
//           }
//         }

//         // missiles
//         for (var i = 0, missile; (missile = missiles[i]); i++) {
//           var dx =  Math.sin( degToRad(missile.angle) );
//           var dy = -Math.cos( degToRad(missile.angle) );

//           // missiles move slower
//           if (missile.color === missileColor) {
//             dx *= 1/4;
//             dy *= 1/4;
//           }

//           missile.x += dx;
//           missile.y += dy;

//           if (missile.e && timer >= missile.e) {
//             missile.explode = true;
//             score = parseInt(score) + 25;
//           }
//         }

//         // explotions
//         for (var i = 0, explotion; (explotion = explotions[i]); i++) {
//           explotion.r += 0.2;
//         }

//         counter -= 1 / 25;
//       }
//     },
//     render: function() {
//       missileCommandContext.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

//       // ground
//       missileCommandContext.fillStyle = '#ff0';
//       missileCommandContext.beginPath();
//       missileCommandContext.moveTo(0, CANVAS_HEIGHT);

//       for (var i = 0; i < ground.length; i++) {
//         missileCommandContext.lineTo(ground[i].x, ground[i].y);
//       }

//       missileCommandContext.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
//       missileCommandContext.fill();

//       // counter missile bays
//       missileCommandContext.fillStyle = '#000';
//       for (var i = 0, x = 0, y = 0; i < 10; i++) {

//         if (i == 1 || i == 3 || i == 6) {
//           x = -1 * (i == 3 ? 2 : i == 6 ? 3 : 1);
//           y += 1;
//         }

//         if (i < leftCounterMissles) {
//           missileCommandContext.fillRect(13 + x, 107 + y, 1, 1);
//         }

//         if (i < centerCounterMissles) {
//           missileCommandContext.fillRect(80 + x, 107 + y, 1, 1);
//         }

//         if (i < rightCounterMissles) {
//           missileCommandContext.fillRect(147 + x, 107 + y, 1, 1);
//         }

//         x += 2;
//       }

//       // cities
//       for (var i = 0, city; (city = cities[i]); i++) {
//         missileCommandContext.fillStyle = '#00f';
//         missileCommandContext.fillRect(city.x, city.y, 3, 4);
//         missileCommandContext.fillRect(city.x + 5, city.y, 3, 4);

//         missileCommandContext.fillStyle = '#0ff';
//         missileCommandContext.fillRect(city.x + 1, city.y + 2, 6, 2);
//       }

//       // missiles
//       for (var i = 0, missile; (missile = missiles[i]); ) {
//         // tail
//         missileCommandContext.strokeStyle = missile.color;
//         missileCommandContext.beginPath();
//         missileCommandContext.moveTo(missile.x, missile.y);
//         missileCommandContext.lineTo(missile.startX, missile.startY || MISSILE_START_Y);
//         missileCommandContext.stroke();

//         // head
//         missileCommandContext.fillStyle = '#fff';
//         missileCommandContext.fillRect(missile.x - 0.5, missile.y, 1, 1);

//         if (missile.explode) {
//           missiles.splice(i, 1);
//           missiles.splice(0, 1);

//           missile.r = 1;
//           explotions.push(missile);

//           i--;
//         }
//         else {
//           i++;
//         }
//       }

//       // explotions
//       for (var i = 0, explotion; (explotion = explotions[i]); i++) {
//         missileCommandContext.fillStyle = '#00f';
//         missileCommandContext.beginPath();
//         missileCommandContext.arc(explotion.x, explotion.y, explotion.r, 0, 2 * Math.PI);
//         missileCommandContext.fill();
//       }

//       missileCommandContext.fillStyle = '#f00';
//       missileCommandContext.fillText(score + '      ' + highScore, 30, 7);
//     },
//     reset: reset
//   };
// })();