window.game = (function(game) {
  kontra.init();

  var fireBtn = document.querySelector('#fire');
  var joystick = document.querySelector('#joystick');
  var gameContainer = document.querySelector('.c');

  game.updateKeys = function updateKeys() {
    // can use arrow keys, wasd, or zqsd
    // @see http://xem.github.io/articles/#jsgamesinputs
    game.enterPressed = kontra.keys.pressed('space') || kontra.keys.pressed('enter');
    game.upPressed = kontra.keys.pressed('up') || kontra.keys.pressed('w') ||
                    kontra.keys.pressed('z');
    game.rightPressed = kontra.keys.pressed('right') || kontra.keys.pressed('d');
    game.downPressed = kontra.keys.pressed('down') || kontra.keys.pressed('s');
    game.leftPressed = kontra.keys.pressed('left') || kontra.keys.pressed('a') ||
                      kontra.keys.pressed('q');

    // fire button
    if (game.enterPressed) {
      fireBtn.click();
      fireBtn.classList.add('active');
    }
    else {
      fireBtn.classList.remove('active');
    }

    // joystick
    if (game.upPressed) {
      joystick.classList.remove('down');
      joystick.classList.add('up');
    }
    else if (game.downPressed) {
      joystick.classList.remove('up');
      joystick.classList.add('down');
    }
    else {
      joystick.classList.remove('up', 'down');
    }

    if (game.leftPressed) {
      joystick.classList.remove('right');
      joystick.classList.add('left');
    }
    else if (game.rightPressed) {
      joystick.classList.remove('left');
      joystick.classList.add('right');
    }
    else {
      joystick.classList.remove('left', 'right');
    }
  };

  return game;
})(window.game || {});