game.pong = (function() {
  document.querySelector('#at').innerHTML = 'Instructions: Use the up and down arrow keys to move your paddle and bounce the ball to the computer paddle. As the ball moves back and forth across the screen, a sound will play to indicate how far away the ball is from your paddle. The more frequent the sound plays, the closer the ball is to your paddle. The less frequent the sound plays, the farther away it is. The sound also tells you if the ball is above or below your paddle. A higher pitch sound means the ball is above your paddle. A lower pitch sound means it\'s below your paddle. If the sound stops it means either you or the computer missed the ball. When this happens, press the enter or space key to restart the game. Finally, at the start of each game, the sound will play 4 times before launching the ball. The sound is at the exact pitch that indicates the ball is centered to your paddle, so use this to judge higher and lower pitches. To start, press space or enter. To return to the menu, press escape. To repeat these instructions, press r.';

  // states
  var blindMode = true;
  var canPlaySound = true;

  // constants
  var GAME_WIDTH = kontra.canvas.width;
  var GAME_HEIGHT = kontra.canvas.height;
  var PADDLE_WIDTH = 5;
  var PADDLE_HEIGHT = (blindMode ? 80 : 50);
  var START_POSITION_Y = (GAME_HEIGHT / 2) - (PADDLE_HEIGHT / 2);

  // references
  var sprite = kontra.sprite;
  var context = kontra.context;

  // sound
  function playSound(buffer, pitch) {
    if (!canPlaySound) return;

    var source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = pitch || 1;
    source.connect(audioCtx.destination);
    source.start(0);
  }

  // sound support
  try {
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var buffers = {};

    function getSound(url, audioBuffer) {
      var request = new XMLHttpRequest();
      request.open('GET', url, true);
      request.responseType = 'arraybuffer';

      // Decode asynchronously
      request.onload = function() {
        audioCtx.decodeAudioData(request.response, function(buffer) {
          buffers[audioBuffer] = buffer;
        }, function(e) {
          console.error(e);
        });
      };
      request.send();
    }

    getSound('/sounds/blip.mp3', 'blip');
    getSound('/sounds/bounce.mp3', 'bounce');
    getSound('/sounds/wallbounce.mp3', 'wallbounce');
  }
  catch (e) {
    canPlaySound = false;
    if (blindMode) {
      alert('Your browser does not support the Web Audio API and thus cannot play the sounds needed to support blind play. Please use a different browser to play this game.');
    }
    return;
  }

  // variables
  var player = sprite({
    x: PADDLE_WIDTH,
    y: START_POSITION_Y,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    color: '#fff',
    score: 0,
    dy: 4,
    update: function() {
      if (game.upPressed) {
        this.y -= this.dy;
      }
      else if (game.downPressed) {
        this.y += this.dy;
      }
    }
  });
  player.position.clamp(0, 0, GAME_WIDTH, GAME_HEIGHT - PADDLE_HEIGHT);

  var computer = sprite({
    x: GAME_WIDTH - (PADDLE_WIDTH * 2),
    y: (GAME_HEIGHT / 2) - 25,
    width: PADDLE_WIDTH,
    height: 50,
    color: '#fff',
    score: 0,
    dy: 4,
    update: function() {
      var targetBall = (invisibleBall.alive ? invisibleBall : ball);

      if (targetBall.alive) {
        if (targetBall.y < this.y) {
          this.y -= this.dy;
        }
        else if (targetBall.y > this.y ) {
          this.y += this.dy;
        }
      }
    }
  });
  computer.position.clamp(0, 0, GAME_WIDTH, GAME_HEIGHT - PADDLE_HEIGHT);

  var blipCounter = 0;
  var ball = sprite({
    width: 10,
    height: 10,
    color: '#fff',
    startMinSpeed: (blindMode ? 1 : 3),
    startMaxSpeed: (blindMode ? 3 : 6.25),
    reset: function() {
      this.x = GAME_WIDTH / 2 - 5;
      this.y = GAME_HEIGHT / 2 - 5;
      this.minSpeed = this.startMinSpeed;
      this.maxSpeed = this.startMaxSpeed;
      this.dx = 3;
      this.dy = (blindMode ? 0 : Math.random() > 0.5 ? -3 : 3);
      this.alive = true;
    },
    update: function(dt) {
      this.advance();

      // play the radar blips
      if (blindMode) {
        blipCounter += dt;

        // the farther away the ball is to the player, the longer delay between blips
        var frequency = 0.1 + (ball.x - player.x) / GAME_WIDTH;
        var pitch = 0;

        // higher pitch = above, lower pitch = below
        if (this.y + this.height < player.y) {
          pitch = (player.y - (this.y + this.height)) / GAME_HEIGHT;
        }
        else if (this.y > player.y + player.height) {
          pitch = ((player.y + player.height) - ball.y) / GAME_HEIGHT;
        }

        if (blipCounter > frequency) {
          playSound(buffers.blip, 1 + pitch);
          blipCounter = 0;
        }
      }

      // bounce off wall
      if (this.y < 0) {
        this.y = 0;
        this.dy = -this.dy;
        playSound(buffers.wallbounce);
      }
      else if (this.y > GAME_HEIGHT - this.height) {
        this.y = GAME_HEIGHT - this.height;
        this.dy = -this.dy;
        playSound(buffers.wallbounce);
      }

      // score
      if (this.x < 0) {
        computer.score++;
        this.alive = false;
      }
      else if (this.x > GAME_WIDTH) {
        player.score++;
        this.alive = false;
      }

      // bounce off paddle
      var collides = false;
      if (this.x > player.x && this.collidesWith(player)) {
        collides = player;
        this.x = player.x + player.width;
      }
      else if (this.x < computer.x + computer.width && this.collidesWith(computer)) {
        collides = computer;
        this.x = computer.x - this.width;
      }

      // change ball direction based on where it hit the paddle
      if (collides) {
        playSound(buffers.bounce);

        // increase speed of the ball every hit
        this.minSpeed += 0.2;
        this.maxSpeed += 0.2;

        var maxPercent = (blindMode ? 0.5 : 0.8);
        var height = (player.height / 2);
        var percent = ( (this.y + this.height / 2) - (collides.y + collides.height / 2)) / height;
        percent = Math.max(Math.min(percent, maxPercent), -maxPercent);

        // make the ball go faster near the edges
        var magnitude = Math.max(Math.min(Math.abs(percent) * this.maxSpeed, this.maxSpeed), this.minSpeed);

        // change the velocity based on the new percent
        this.dx = Math.abs(magnitude * Math.sin(90 * (1 - percent) * Math.PI / 180));
        this.dy = magnitude * Math.cos((90 - 90 * percent) * Math.PI / 180);

        if (collides === computer) {
          this.dx = -this.dx;
        }
        // spawn the invisible ball at the players location
        else {
          invisibleBall.x = this.x;
          invisibleBall.y = this.y;
          invisibleBall.dy = this.dy * 1.5;
          invisibleBall.dx = this.dx * 1.5;
          invisibleBall.alive = true;
        }
      }
    }
  });

  // use an invisible ball for the computer to chase
  // @see http://gamedev.stackexchange.com/questions/57352/imperfect-pong-ai
  var invisibleBall = sprite({
    width: ball.width,
    height: ball.height,
    dx: 4,
    alive: false,
    update: function() {
      this.advance();

      if (this.y < 0 || this.y > GAME_HEIGHT) {
        this.dy = -this.dy;
      }
    }
  });

  var counter = 0;
  var timer = 0;
  var intro = false;

  function reset() {
    counter = 0;
    timer = 4;
    intro = true;
    ball.reset();
  }

  var loop = kontra.gameLoop({
    update: function(dt) {
      counter += dt;

      if (kontra.keys.pressed('esc')) {
        counter = 0;
        intro = false;
        ball.alive = false;
        invisibleBall.alive = false;
        loop.stop();
        game.goBack();
      }

      if (kontra.keys.pressed('r')) {
        kontra.canvas.blur();

        window.setTimeout(function() {
          kontra.canvas.focus();
        }, 100);
      }

      // play 4 blips to let the player hear the sound they need to follow
      if (intro) {
        if (counter > 1) {
          playSound(buffers.blip);
          timer--;
          counter = 0;
        }

        if (timer === 0) {
          intro = false;
        }
      }
      else {
        game.updateKeys();

        // set counter so pressing enter to load the game doesn't start the game
        if (game.enterPressed && !ball.alive && counter > 0.5) {
          reset();
        }

        player.update();
        computer.update();

        if (ball.alive) {
          ball.update(dt);
        }

        if (invisibleBall.alive) {
          invisibleBall.update();

          if (invisibleBall.x > computer.x) {
            invisibleBall.alive = false;
          }
        }
      }
    },
    render: function() {
      context.fillStyle = '#fff';
      context.font = '60px monospace';

      // middle divider
      for(var i = 5; i < GAME_HEIGHT; i += 20) {
        context.fillRect(GAME_WIDTH / 2 - 2, i, 4, 10);
      }

      // score
      context.fillText(player.score + ' ' + computer.score, 156, 60);

      player.render();
      computer.render();

      if (ball.alive) {
        ball.render();
      }
    }
  });

  return loop;
})();