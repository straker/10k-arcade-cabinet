window.game = (function(game) {
  kontra.init();

  // --------------------------------------------------
  // VARIABLES
  // --------------------------------------------------

  // constants
  var CANVAS_WIDTH = kontra.canvas.width;
  var CANVAS_HEIGHT = kontra.canvas.height;
  var GAME_PADDING = 5;
  var GAMES_PER_ROW = 3;
  var NUM_ROWS = 3;
  var GAME_WIDTH = (CANVAS_WIDTH - GAME_PADDING * GAMES_PER_ROW * 2) / GAMES_PER_ROW | 0;
  var GAME_HEIGHT = (CANVAS_HEIGHT - GAME_PADDING * NUM_ROWS * 2) / NUM_ROWS | 0;

  // references
  var isPressed = kontra.keys.pressed;
  var joystick = document.querySelector('#j');
  var fireBtn = document.querySelector('#f');
  var escBtn = document.querySelector('#m');
  var gameBtns = document.querySelectorAll('.gb');
  var gameBtnsWrapper = document.querySelector('.gbw');
  var controls = document.querySelector('.c');
  var canvasWrapper = document.querySelector('.cw');

  // variables
  var startX = 0;
  var startY = 0;
  var distY = 0;
  var distX = 0;
  var firePressed = false;
  var escPressed = false;
  var selection = 0;
  var debounce = 1;

  // properties
  game.games = [];
  game.width = GAME_WIDTH;
  game.height = GAME_HEIGHT;





  // --------------------------------------------------
  // EVENTS
  // --------------------------------------------------

  // clicking on buttons changes selection
  for (var i = 0; i < gameBtns.length; i++) {
    // bind i
    (function(i) {
      gameBtns[i].addEventListener('click', function() {
        selection = i;
        gameSelected();
      });

      gameBtns[i].addEventListener('touchstart', function() {
        selection = i;
        gameSelected();
      });
    })(i);
  }

  // prevent scrolling the page
  document.addEventListener('touchstart', function(e) {
    e.preventDefault();
  });
  document.addEventListener('touchmove', function(e) {
    e.preventDefault();
  });
  document.addEventListener('touchend', function(e) {
    e.preventDefault();
  });

  // touch events
  canvasWrapper.addEventListener('touchstart', function(e) {
    e.preventDefault();
    firePressed = true;
    var touchobj = e.changedTouches[0];
    startX = parseInt(touchobj.clientX);
    startY = parseInt(touchobj.clientY);
  });

  canvasWrapper.addEventListener('touchmove', function(e) {
    e.preventDefault();
    firePressed = false;
    var touchobj = e.changedTouches[0];
    distX = parseInt(touchobj.clientX) - startX;
    distY = parseInt(touchobj.clientY) - startY;
  });

  canvasWrapper.addEventListener('touchend', function(e) {
    e.preventDefault();
    firePressed = false;
    distX = 0;
    distY = 0;
    startX = 0;
    startY = 0;
  });

  // fire button touch events
  fireBtn.addEventListener('touchstart', function() {
    firePressed = true;
  });

  fireBtn.addEventListener('touchend', function() {
    firePressed = false;
  });

  // fire button touch events
  escBtn.addEventListener('touchstart', function() {
    escPressed = true;
  });

  escBtn.addEventListener('touchend', function() {
    escPressed = false;
  });

  // throttle resize event
  window.addEventListener('resize', resizeThrottler, false);

  var resizeTimeout;
  function resizeThrottler() {
    // ignore resize events as long as an actualResizeHandler execution is in the queue
    if ( !resizeTimeout ) {
      resizeTimeout = setTimeout(function() {
        resizeTimeout = null;
        actualResizeHandler();

       // The actualResizeHandler will execute at a rate of 15fps
       }, 66);
    }
  }

  // resize elements
  var styles = document.styleSheets[0];
  var ruleIndex = styles.insertRule('.cw:before {}', styles.cssRules.length);
  var rule = styles.cssRules.item(ruleIndex);
  function actualResizeHandler() {
    var width = parseInt(getComputedStyle(kontra.canvas).width);
    var height = parseInt(getComputedStyle(kontra.canvas).height);

    // change the height of the background scan line affect since canvas element
    // cant have any child elements or pseudo elements
    rule.style.height = height + 'px';

    // change the position of the controls
    controls.style.top = kontra.canvas.getBoundingClientRect().top + height + 'px';

    // change game button
    for (var i = 0; i < gameBtns.length; i++) {
      gameBtns[i].style.width = width * .30956 + 'px';
      gameBtns[i].style.height = height * .3029 + 'px';
      gameBtns[i].style.padding = width * .0119 + 'px';
    }
  }
  actualResizeHandler();  // fire the event to initially set everything





  // --------------------------------------------------
  // LOAD GAME
  // --------------------------------------------------

  /**
   * Lazy load the selected game and start it.
   */
  function gameSelected() {
    var selectedGame = gameBtns[selection].getAttribute('data-game');

    if (game[selectedGame]) {
      loadGame(game[selectedGame]);
    }
    else if (!document.querySelector('script[src="js/' + selectedGame + '.js"]')) {
      var script = document.createElement('script');
      script.onload = function() {
        loadGame(game[selectedGame]);
      };
      script.src = 'js/games/' + selectedGame + '.js';
      document.head.appendChild(script);
    }
  }

  /**
   * Load a game.
   */
  function loadGame(selectedGame) {
    gameBtns[selection].blur();
    gameBtns[selection].setAttribute('tabindex', -1);
    gameBtns[selection].removeAttribute('aria-selected');
    gameBtnsWrapper.classList.add('hide');

    game.loop.stop();
    game.selectedGame = selectedGame;
    selectedGame.start();
    kontra.canvas.setAttribute('tabindex', 0);
    kontra.canvas.focus();
  }





  // --------------------------------------------------
  // GAME
  // --------------------------------------------------

  /**
   * Reset all preview loops.
   */
  game.triggerReset = function() {
    for (var i = 0; i < game.games.length; i++) {
      game.games[i].reset();
    }
  };

  /**
   * Go back to the preview menu.
   */
  game.goBack = function() {
    game.loop.start();
    gameBtns[selection].setAttribute('tabindex', 0);
    gameBtns[selection].setAttribute('aria-selected', true);
    gameBtnsWrapper.classList.remove('hide');
    gameBtns[selection].focus();

    kontra.canvas.removeAttribute('tabindex');
    document.querySelector('#at').innerHTML = '';
  };

  /**
   * Update the key state every frame.
   */
  game.updateKeys = function updateKeys() {
    // can use arrow keys, wasd, zqsd, or touch
    // @see http://xem.github.io/articles/#jsgamesinputs
    game.enterPressed = isPressed('space') || isPressed('enter') ||
                        firePressed;

    game.escPressed = isPressed('esc') || escPressed;

    game.upPressed = isPressed('up') || isPressed('w') ||
                     isPressed('z') ||
                     (startY && distY < 0 && Math.abs(distY) > Math.abs(distX));

    game.rightPressed = isPressed('right') || isPressed('d') ||
                        (startX && distX > 0 && Math.abs(distX) > Math.abs(distY));

    game.downPressed = isPressed('down') || isPressed('s') ||
                       (startY && distY > 0 && Math.abs(distY) > Math.abs(distX));

    game.leftPressed = isPressed('left') || isPressed('a') ||
                       isPressed('q') ||
                       (startX && distX < 0 && Math.abs(distX) > Math.abs(distY));

    // joystick
    if (game.upPressed) {
      joystick.classList.remove('d');
      joystick.classList.add('u');
    }
    else if (game.downPressed) {
      joystick.classList.remove('u');
      joystick.classList.add('d');
    }
    else {
      joystick.classList.remove('u', 'd');
    }

    if (game.leftPressed) {
      joystick.classList.remove('r');
      joystick.classList.add('l');
    }
    else if (game.rightPressed) {
      joystick.classList.remove('l');
      joystick.classList.add('r');
    }
    else {
      joystick.classList.remove('l', 'r');
    }

    // fire button
    if (game.enterPressed) {
      fireBtn.click();
      fireBtn.classList.add('active');
    }
    else {
      fireBtn.classList.remove('active');
    }

    if (game.escPressed) {
      escBtn.click();
      escBtn.classList.add('active');
    }
    else {
      escBtn.classList.remove('active');
    }
  };

  /**
   * Game loop
   */
  game.loop = kontra.gameLoop({
    update: function(dt) {
      game.updateKeys();

      debounce += dt;

      // update each preview
      for (var i = 0; i < game.games.length; i++) {
        game.games[i].update(dt);
      }

      // debounce user input
      if (debounce > 0.25) {
        if (game.rightPressed) {
          gameBtns[selection].setAttribute('tabindex', -1);
          gameBtns[selection].removeAttribute('aria-selected');
          selection = (selection == game.games.length - 1 ? 2 : selection + 1);
        }
        else if (game.leftPressed) {
          gameBtns[selection].setAttribute('tabindex', -1);
          gameBtns[selection].removeAttribute('aria-selected');
          selection = (selection == 0 ? 0 : selection - 1);
        }

        if (game.rightPressed || game.leftPressed) {
          gameBtns[selection].focus();
          gameBtns[selection].setAttribute('tabindex', 0);
          gameBtns[selection].setAttribute('aria-selected', true);
          debounce = 0;
        }

        if (game.enterPressed) {
          gameSelected();
          debounce = 0;
        }
      }

      else if (!game.rightPressed && !game.leftPressed) {
        debounce = 1;
      }
    },
    render: function() {
      for (var i = 0; i < game.games.length; i++) {
        kontra.context.save();
        kontra.context.translate(GAME_PADDING + GAME_PADDING * i * 2 + GAME_WIDTH * i, GAME_PADDING);

        game.games[i].render();

        kontra.context.restore();
      }
    },
    fps: 30
  });

  game.loop.start();
  gameBtns[0].focus();

  return game;
})(window.game || {});