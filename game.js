/* - Version 2.0 - 2-Feb-2019
 * Game.js
 * Adapted from http://jlongster.com/Making-Sprite-based-Games-with-Canvas
 */

/* 1. Global Variable Declaration*/
var gameCanvas = new myCanvas('game_canvas');
var lastTime = 0; //used for gameLoop clock
var gameSpeed = 5;
var playerWalkSpeed = 1;
var playerRunSpeed = 2;
var center = { x: gameCanvas.width / 2, y: gameCanvas.height / 2 };
/*User global variables*/


/* 2. Load images into a resources array */
resources.load([
    
]);
resources.onReady(init);

/* 3. Game Objects */
/* 3a. Singleton objects */
var player = {
    speed: 2,
    pos: center,
    sprite: new Sprite('', [0, 0], [64, 95],
        /*These last are only required if the object has an animation*/
        15, [0, 1, 2, 1], 'horizontal', false, 0, [1, 1], 1)
};

var background = {
    speed: 0,
    pos: { x: 0, y: 0 },
    sprite: new Sprite('', [0, 0], [1024, 768])
};

/* 3b. Multiples objects */
var bullets = []; //this is for tracking them AFTER they are fired
var enemies = []; //this is for tracking them AFTER they are generated
for (var i = 0; i < 4; i++) {
    enemies.push({
        pos: { x: center.x - 10, y: center.y - 10 },
        vel: { h: 2, v: 0 },
        sprite: new Sprite("", [0, 0], [5, 5],
            15, [0, 1], 'horizontal', false, 0, [1, 1], 1)
    });
}

/* 4. Settings for game logic
 *      Place vars here for global tracking or setup
 *      Eg: speeds, score etc
 */
var gameOver = false;

//score and lives status
var score = 0;
var lives = 3;

/* 5.  Getting ready to load the game
 *   This function prepares the game screen ready to start
 */
function init() {
    //set up background if not an object

    /*attach event listeners to html objects (outside the canvas)
      document.getElementById('reset').addEventListener('click', function(event){
          init(); 
          //add custom code here
      });
    */

    //Call reset function to setup all objects at start
    reset();

    //reset the clock counter
    lastTime = Date.now();

    //now, let's get the game going
    gameLoop();
}

function reset() {
    /*Manage HTML elements outside canvas*/
    // document.getElementById('game-over').style.display = 'none';
    // document.getElementById('game-over-overlay').style.display = 'none';

    /*set game vars*/
    gameOver = false;
    lives = 3;
    score = 0;

    /*Empty or reload object arrays*/
    //bullets = [];

    /*You can create custom functions to simplify code
      Eg:
      playerReset(); //all logic for resetting sprite, position etc...

    */

    /* Start Game background sounds
    -Probably best to comment out once you are sure it works - it gets annoying
    */
    //playSound("highway");
};


function gameLoop() {
    /*
     * Main game function - all the magic happens here...
     * No need to alter this function
     */
    var now = Date.now();
    //delta-time: time since last loop
    var dt = (now - lastTime) / 1000.0;
    if (dt > 0.15) {
        dt = 0.15;
    } //ensure not too much lag if browser freezes b/w refreshes

    //Here is where all the work is done
    //Re-calc pos of everything (according to change in time)
    update(dt);
    //Clear and re-draw canvas and objects
    render();

    //Update time for next loop
    lastTime = now;
    if (!gameOver) {
        requestAnimationFrame(gameLoop); //call itself each time - this is called recursion
    }
};

function update(dt) {
    /*
     * This is the main game LOGIC function
     * -Here is where YOU do the work
     * -This function is called once every "tick"
     */

    /*
    Step 1 - handle keyboard inputs in the gameLoop
     - mouse moves and clicks handled asynchronously
     - see handleMouse* functions
    */
    handleInput(dt); //keyboard logic in this function

    /*
    Step 2 - update any animations (not movement, animations, like moving legs)
    - need to call it for EVERY object that requires animation
      Eg:
      player.sprite.update(dt);

    - if they are in an array - loop the array and call for each one
      Eg:
      for(var i=0;i<array_name.length;i++){
        array_name[i].sprite.update(dt);
      }
    */
    player.sprite.update(dt);

    /*
    Step 3 - Calculate all new locations
    - check if off screen
    */

    //if off screen top, come back in bottom - like pacman
    if (player.pos.y + getScaledSize(player).h < 0) {
        player.pos.y = gameCanvas.height;
    }
    //if get to left or right, cant go off
    if (player.pos.x < 0) {
        player.pos.x = 0;
    } else if (player.pos.x + getScaledSize(player).w > gameCanvas.width) {
        player.pos.x = gameCanvas.width - getScaledSize(player).w;
    }


    /*
      Step 4 - Check collisions
       - in here you would then fire up explosions etc...just other objects!
       - you would also remove old objects here

     */

    /*
    Step 5 - Create new objects [eg bad guys, cars, rocks, whatever]
    */

}

function render() {
    /*
    This is the function where all the objects are deleted and redrawn
    */

    /*Delete it all*/
    gameCanvas.clear();

    /*redraw background if required (ie it is an object)*/
    // renderEntity(background);

    /*
    update objects
      Singletons: renderEntity(name);
      Multiples (ie arrays): renderEntities(array_name);
    */
    renderEntity(player);
    // renderEntities(explosions);

    /*
    Other things to do
     - Update HTML elements, such as score, lives etc...
     document.getElementById('score').innerHTML = score;
    */
}

/*Variables specific to keyboard interaction*/
var curKey = null;
var moveSize = 0.05;

function handleInput(dt) {
    /*
      Arrow keys are labelled
      'DOWN' 'UP' 'LEFT' 'RIGHT'
      'SPACE' is also defined

      All other keys are their character code
      If you want to define other special keys see jsLib\input.js
      Eg:

      if(input.isDown('D')){
        //Your logic here - ie what to do when D is pressed
        curKey = 'D';
      }
    */

    /*
     * This code prevents multiple moves per press
     * It does mess with pressing a second key before a first is released
     * Uncomment if required
     */

    // if(curKey){
    // 	if(input.isDown(curKey)){
    // 		return;
    // 	}else{
    // 		curKey = null;
    // 	}
    // }

    var moving = true;
    if (input.isDown('DOWN')) {
        /*custom logic here*/

        /*Examples
            if(dog.radius > 100){
            dog.radius -= 10;
            }

            player.pos.y += 5;

        */

        // if(input.isSpecialDown('CTRL')){
        //   if(input.isSpecialDown('ALT')){
        //     console.log('ctrl+alt+down');
        //   }else{
        //     console.log('ctrl+down');
        //   }
        // }else if(input.isSpecialDown('ALT')){
        //   console.log('alt+down');
        // }else if(input.isSpecialDown('SHIFT')){
        //   console.log('shift+down');
        // }else if(input.isSpecialDown('META')){
        //   console.log('meta+down');
        // }else{
        //   console.log('down');
        // }

        player.pos.y += player.speed;
        player.sprite.facing = Math.PI;
        /*end custom logic*/

        curKey = 'DOWN';
    } else
    if (input.isDown('UP')) {
        /*custom logic here*/
        player.pos.y -= player.speed;
        player.sprite.facing = 0;
        /*end custom logic*/

        curKey = 'UP';
    } else
    if (input.isDown('LEFT')) {
        /*custom logic here*/
        player.pos.x -= player.speed;
        player.sprite.facing = deg2rad(270);
        /*end custom logic*/

        curKey = 'LEFT';
    } else
    if (input.isDown('RIGHT')) {
        /*custom logic here*/
        player.pos.x += player.speed;
        player.sprite.facing = deg2rad(90);
        /*end custom logic*/

        curKey = 'RIGHT';
    } else {
        moving = false;
    }

    if (moving) {
        if (input.isDown('R')) {
            /*custom logic here*/
            player.sprite.speed = 15;
            player.speed = playerRunSpeed;
            /*end custom logic*/

            curKey = 'RIGHT';
        } else {
            player.sprite.speed = 10;
            player.speed = playerWalkSpeed;
        }
    } else {
        player.sprite.speed = 0;
    }

}

/*
  Mouse Functions - Add functionality to events here

    pos is object {x,y} in canvas-relative pixels
    button is 0=left, 1=centre, 2=right
    event allows you to detect many other things
    -Eg event.ctrlKey is true if the ctrl key was pressed while mouse click happened
    -see https://developer.mozilla.org/en-US/docs/Web/Events/click
*/
function handleMouseMove(pos, event) {}

function handleMouseScroll(pos, event) {}

function handleMouseClick(pos, button, event) {}

function handleMouseDblClick(pos, button, event) {}

function handleMouseDown(pos, button, event) {}

function handleMouseUp(pos, button, event) {}

/*
  Create custom functions here to simplify game logic in the loop
*/
function loseLife() {

    lives--;

    if (lives == 0) {
        gameOver = true;
        //stopSound("highway");

    } else {
        playerReset();
    }

}
