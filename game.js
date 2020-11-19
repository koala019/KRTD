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
var enemyStartPos = { x: -50, y: 300}
var _newTower;
var towerPrice = 50;
var points = towerPrice + 0;
var health = 100;
var enemyHealth = 2;
/*User global variables*/


/* 2. Load images into a resources array */
resources.load([
    'images/soldier.png',
    'images/field_map.gif',
    'images/zombie.png',
    'images/tower.png',
    'images/bullet.png',
    'images/tower2.png',
    'images/rioter.png'
]);
resources.onReady(init);

/* 3. Game Objects */
/* 3a. Singleton objects */

// var rioter = {
//     speed: 2,
//     pos: { x: center.x + 20, y: center.y + 200},
//     sprite: new Sprite("images/rioter.png", [0,0], [100,100], 3, [0,2,1,2], "horizontal", false, 100, [0.5, 0.5])
// };

// var player = {
//     speed: 2,
//     pos: center,
//     sprite: new Sprite('images/soldier.png', [0, 0], [64, 95],
//         /*These last are only required if the object has an animation*/
//         15, [0, 1, 2, 1], 'horizontal', false, 0, [1, 1], 1)
// };

var background = { // DOESNT ACTUALLY AFFECT IMAGE - BACKGROUND DEFINED IN CSS
    speed: 0,
    pos: { x: 0, y: 0 },
    sprite: new Sprite('images/map.png', [0, 0], [1024, 768])
};

/* 3b. Multiples objects */
var bullets = []; //this is for tracking them AFTER they are fired
var enemies = []; //this is for tracking them AFTER they are generated
var towers = [];
var enemiesPathPoints = [{x: 385, y: 334}, {x: 386, y: 625}, {x: 1100, y: 620}, {x: 1105, y: 180}, {x: 0, y: 0}];

// towers.push({
//     speed: 0,
//     pos: { x: center.x + 250, y: center.y },
//     sprite: new Sprite(
//         "images/tower2.png",
//         [0,0],
//         [100,100],
//         null,
//         null,
//         null,
//         null,
//         null,
//         [1,1]
//     ),
//     shootTime: 0,
//     shootDelay: 0.5
//     }
// );

/* 4. Settings for game logic
 *      Place vars here for global tracking or setup
 *      Eg: speeds, score etc
 */
var gameOver = false;

var mouseX;
var mouseY;

//score and lives status
var score = 0;
var lives = 3;

// FUNCTIONS

window.addEventListener('mousemove', function (e) {
    mouseX = e.pageX;
    mouseY = e.pageY;
})

document.getElementById("towerBtn").onclick = function() {
    if (_newTower == null && points >= towerPrice) {
        _newTower = ({
            speed: 0,
            pos: { x: mouseX, y: mouseY },
            sprite: new Sprite(
                "images/tower2.png",
                [0,0],
                [100,100],
                null,
                null,
                null,
                null,
                null,
                [1,1],
                [1] // OPACITY
            ),
            shootTime: 0,
            shootDelay: 0.5
        })
    }

}

window.addEventListener("mousedown", function() {
    if (_newTower != null) {
        placeTower();
    }
})

function placeTower() {
    var tower;
    towers.push(tower = {
        speed: _newTower.speed,
        pos: { x: mouseX - 130, y: mouseY - 50},
        sprite: _newTower.sprite,
        type: "rifle",
        shootTime: _newTower.shootTime,
        shootDelay: _newTower.shootDelay
    })
    _newTower = null;
    removePoints(towerPrice);
}

var waveCooldown = 5;
var waveTimer = 0;
var enemyAmount = 10;
function wave() {
    for (var i = 0; i < enemyAmount; i++) {
        enemies.push({
            pos: {x: (enemyStartPos.x)-(i*60), y: enemyStartPos.y},
            speed: 200,
            dir: 0,
            health: 5,
            sprite: new Sprite("images/rioter.png", [0,0], [100,100], 6, [0,2,1,2], "horizontal", false, deg2rad(90), [0.5, 0.5]),
            health: enemyHealth + 0,
            pathPoint: 0
        });
    }
}

function addPoints(_points) {
    points += _points;
    document.getElementById("cheeseTxt").innerHTML = "Cheese: " + points;
}

function removePoints(_points) {
    points -= _points;
    document.getElementById("cheeseTxt").innerHTML = "Cheese: " + points;
}

//

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

    // TOWERS

    for (var i = 0; i < towers.length; i++) {
        if (enemies[0] != null) {
            towers[i].dir = Math.atan2((enemies[0].pos.y - towers[i].pos.y), (enemies[0].pos.x - towers[i].pos.x));
            towers[i].sprite.facing = towers[i].dir + Math.PI / 2;
        }
    };

    if (_newTower != null) {
        if (mouseX > 0 && mouseY > 0) {
            _newTower.pos = { x: mouseX - 130, y: mouseY - 50 };
        }
    }

    for (var i = 0; i < towers.length; i++) {
        if (towers[i].shootTime > towers[i].shootDelay && enemies[0] != null) {
            towers[i].shootTime = 0;

            playSound("shoot");

            if (towers[i].type == "rifle") {
                bullets.push({
                    speed: 5000,
                    pos: { x: towers[i].pos.x + (towers[i].sprite.size.w / 4), y: towers[i].pos.y + (towers[i].sprite.size.h / 4) },
                    sprite: new Sprite("images/bullet.png", [0,0], [86,207], null, null, null, null, towers[i].sprite.facing, [0.25,0.25], null),
                    dir: towers[i].dir
                });
            }
        } else {
            towers[i].shootTime += dt;
        }
    }

    for (var i = 0; i < bullets.length; i++) {

        // var dist = Math.hypot(bullets[i].pos.x - mouseX, bullets[i].pos.y - mouseY);

        // bullets[i].dir = Math.atan2((mouseY - bullets[i].pos.y), (mouseX - bullets[i].pos.x));
        bullets[i].sprite.facing = bullets[i].dir + Math.PI / 2;

        bullets[i].pos.x += bullets[i].speed * dt * Math.cos(bullets[i].dir);
        bullets[i].pos.y += bullets[i].speed * dt * Math.sin(bullets[i].dir);

        for (var j = 0; j < enemies.length; j++) {
            if (objectCollides(bullets[i], enemies[j])) {
                bullets.splice(i, 1);
                i++;

                if (enemies[j].health <= 1) {
                    enemies.splice(j, 1);
                    j++;
                    addPoints(5);
                    playSound("die");
                } else {
                    enemies[j].health--;
                }
            }
        }
    }

    // ENEMIES

        // WAVES

    if (enemies.length < 1) {
        if (waveTimer > waveCooldown) {
            waveTimer = 0;
            wave();
            enemyAmount++;
            enemyHealth += 0.5;
        } else {
            waveTimer += dt;
        }
    }

        // MOVE FORWARD

    for (var i = 0; i < enemies.length; i++) {
        enemies[i].pos.x += enemies[i].speed * dt * Math.cos(enemies[i].dir);
        enemies[i].pos.y += enemies[i].speed * dt * Math.sin(enemies[i].dir);

        enemies[i].sprite.update(dt);
    }
        // PATHFINDING

    for (var i = 0; i < enemies.length; i++){
        var xDiff = enemies[i].pos.x - enemiesPathPoints[enemies[i].pathPoint].x;
        var yDiff = enemies[i].pos.y - enemiesPathPoints[enemies[i].pathPoint].y;
        var dist = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
        if(dist <= 50){
            enemies[i].pathPoint++;
            // enemies[i].dir = (Math.atan2((enemiesPathPoints[enemies[i].pathPoint].y - pos.y, enemiesPathPoints[enemies[i].pathPoint].x - pos.x)));
            switch (enemies[i].pathPoint) {
                case 1: enemies[i].dir = deg2rad(90);
                        break;
                case 2: enemies[i].dir = deg2rad(0);
                        break;
                case 3: enemies[i].dir = deg2rad(-90);
                        break;
                case 4: enemies[i].dir = deg2rad(0);
                        break;
        }
            enemies[i].sprite.facing = enemies[i].dir + Math.PI / 2;
    }

    if (enemies[i].pos.x > 1350) {
        enemies.splice(i, 1);
        health -= 5;
        document.getElementById("healthTxt").innerHTML = "Health: " + health;

        if (health <= 0) {
            location.reload();
        }
    }
}

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

    /*
    Step 3 - Calculate all new locations
    - check if off screen
    */

    //if off screen top, come back in bottom - like pacman
    // if (player.pos.y + getScaledSize(player).h < 0) {
    //     player.pos.y = gameCanvas.height;
    // }
    // //if get to left or right, cant go off
    // if (player.pos.x < 0) {
    //     player.pos.x = 0;
    // } else if (player.pos.x + getScaledSize(player).w > gameCanvas.width) {
    //     player.pos.x = gameCanvas.width - getScaledSize(player).w;
    // }


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
    // renderEntity(player);
    if (_newTower != null) {
        renderEntity(_newTower);
    }

    for (var i = 0; i < bullets.length; i++) {
        renderEntity(bullets[i]);
    }

    for (var i = 0; i < towers.length; i++) {
        renderEntity(towers[i]);
    }

    for (var i = 0; i < enemies.length; i++) {
        renderEntity(enemies[i]);
    }

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

        // player.pos.y += player.speed;
        // player.sprite.facing = Math.PI;
        /*end custom logic*/

        curKey = 'DOWN';
    } else
    if (input.isDown('UP')) {
        /*custom logic here*/
        // player.pos.y -= player.speed;
        // player.sprite.facing = 0;
        /*end custom logic*/

        curKey = 'UP';
    } else
    if (input.isDown('LEFT')) {
        // /*custom logic here*/
        // player.pos.x -= player.speed;
        // player.sprite.facing = deg2rad(270);
        /*end custom logic*/

        curKey = 'LEFT';
    } else
    if (input.isDown('RIGHT')) {
        /*custom logic here*/
        // player.pos.x += player.speed;
        // player.sprite.facing = deg2rad(90);
        /*end custom logic*/

        curKey = 'RIGHT';
    } else {
        moving = false;
    }

    if (moving) {
        if (input.isDown('R')) {
            /*custom logic here*/
            // player.sprite.speed = 15;
            // player.speed = playerRunSpeed;
            /*end custom logic*/

            curKey = 'RIGHT';
        } else {
            // player.sprite.speed = 10;
            // player.speed = playerWalkSpeed;
        }
    } else {
        // player.sprite.speed = 0;
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
        // playerReset();
    }

}
