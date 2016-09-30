// constants
var CANVAS_WIDTH = kontra.canvas.width;
var CANVAS_HEIGHT = kontra.canvas.height;
var GAME_PADDING = 5;
var GAMES_PER_ROW = 3;
var NUM_ROWS = 3;
var GAME_WIDTH = (CANVAS_WIDTH - GAME_PADDING * GAMES_PER_ROW * 2) / GAMES_PER_ROW | 0;
var GAME_HEIGHT = (CANVAS_HEIGHT - GAME_PADDING * NUM_ROWS * 2) / NUM_ROWS | 0;

// references
var sprite = kontra.sprite;

// variables
var selection = 0;
var debounce = 1;
var games = [];
var gameBtns = document.querySelectorAll('.gb');

for (var i = 0; i < gameBtns.length; i++) {
  // bind i
  (function(i) {
    gameBtns[i].addEventListener('click', function() {
      selection = i;
    });
  })(i);
}

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

function actualResizeHandler() {
  var width = parseInt(getComputedStyle(kontra.canvas).width);
  var height = parseInt(getComputedStyle(kontra.canvas).height);

  for (var i = 0; i < gameBtns.length; i++) {
    gameBtns[i].style.width = width * .30956 + 'px';
    gameBtns[i].style.height = height * .3029 + 'px';
    gameBtns[i].style.padding = width * .0119 + 'px';
  }
}

/**
 * Reset all previews.
 */
function triggerReset() {
  for (var i = 0; i < games.length; i++) {
    games[i].reset();
  }
}

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
    script.src = 'js/' + selectedGame + '.js';
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

  game.loop.stop();
  game.selectedGame = selectedGame;
  selectedGame.start();
  kontra.canvas.setAttribute('tabindex', 0);
  kontra.canvas.focus();
}

/**
 * Go back to the preview menu.
 */
game.goBack = function() {
  game.loop.start();
  gameBtns[selection].focus();
  document.querySelector('#at').innerHTML = '';
};

// --------------------------------------------------
// GAME_LOOP
// --------------------------------------------------
game.loop = kontra.gameLoop({
  update: function(dt) {
    game.updateKeys();

    debounce += dt;

    // update each preview
    for (var i = 0; i < games.length; i++) {
      games[i].update(dt);
    }

    // debounce user input
    if (debounce > 0.25) {
      if (game.rightPressed) {
        gameBtns[selection].setAttribute('tabindex', -1);
        gameBtns[selection].removeAttribute('aria-selected');
        selection = (selection == games.length - 1 ? 2 : selection + 1);
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
    for (var i = 0; i < games.length; i++) {
      kontra.context.save();
      kontra.context.translate(GAME_PADDING + GAME_PADDING * i * 2 + GAME_WIDTH * i, GAME_PADDING);

      games[i].render();

      kontra.context.restore();
    }
  },
  fps: 30
});

game.loop.start();
gameBtns[0].focus();