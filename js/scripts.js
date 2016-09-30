window.game = (function(game) {
  kontra.init();

  // references
  var isPressed = kontra.keys.pressed;
  var joystick = document.querySelector('#j');
  var fireBtn = document.querySelector('#f');
  var escBtn = document.querySelector('#m');

  // variables
  var startX = 0;
  var startY = 0;
  var distY = 0;
  var distX = 0;
  var firePressed = false;

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

  // joystick touch events
  joystick.addEventListener('touchstart', function(e) {
    e.preventDefault();
    var touchobj = e.changedTouches[0];
    startX = parseInt(touchobj.clientX);
    startY = parseInt(touchobj.clientY);
  });

  joystick.addEventListener('touchmove', function(e) {
    e.preventDefault();
    var touchobj = e.changedTouches[0];
    distX = parseInt(touchobj.clientX) - startX;
    distY = parseInt(touchobj.clientY) - startY;
  });

  joystick.addEventListener('touchend', function(e) {
    e.preventDefault();
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

  /**
   * Update the key state every frame.
   */
  game.updateKeys = function updateKeys() {
    // can use arrow keys, wasd, zqsd, or touch
    // @see http://xem.github.io/articles/#jsgamesinputs
    game.enterPressed = isPressed('space') || isPressed('enter') ||
                        firePressed;

    game.escPressed = isPressed('esc');

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

  return game;
})(window.game || {});