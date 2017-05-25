/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

// GLOBAL Variables
var PLAYGROUND_HEIGHT = 500; 
var PLAYGROUND_WIDTH = 700;
var REFRESH_RATE = 15;
var GAME_TIME = 30; // Expressed in seconds
var MAX_DUCKS = 10; // Maximum amount of ducks that can be on the screen at a given time                
var minSpawnTime = 500;
var maxSpawnTime = 1000;
var minSpeed = 3;
var maxSpeed = 8;
var SHOOT_RATE = 100; // Time in milliseconds the user has to wait to shoot again

var currentDucks = 0; // Keeps the count of how many ducks are currently on the screen
var duckCount = 0; // Keeps the count on how many ducks have been spawned in total
var hitDucks = 0; // Keeps the count on how many ducks the user has hit

//***************** Animations *****************
var duckAnimations = new Array();
var playerAnimations = new Array();
var stageAnimations = new Array();


function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function Player() {
    // The player class, handles the movement, following the mouse pointer
    this.PLAYER_HEIGHT = 267;
    this.PLAYER_WIDTH = 219;
    
    this.updatePosition = function(mouseX, mouseY){
        var minX = 0;
        var maxX = PLAYGROUND_WIDTH - this.PLAYER_WIDTH / 2;
        var minY = PLAYGROUND_HEIGHT - this.PLAYER_HEIGHT / 2;
        var maxY = PLAYGROUND_HEIGHT - this.PLAYER_HEIGHT;
        
        $("#playerShootSprite").x(Math.max(minX, Math.min(mouseX - 40, maxX)));
        $("#playerShootSprite").y(Math.max(maxY, mouseY + 80));         
        $("#playerSprite").x(Math.max(minX, Math.min(mouseX - 40, maxX)));
        $("#playerSprite").y(Math.max(maxY, mouseY + 80));     
    };
    
    return true;
};

function Duck(node) {
    this.speedX = 10; // Default
    this.speedY = 0; // Default
    this.node = $(node); // Keeps a reference to the duck sprite
    this.alive = true;
    
    this.updatePosition = function() {
        if (this.node.x() > PLAYGROUND_WIDTH || this.node.y() > PLAYGROUND_HEIGHT) {
            // The duck is out of the screen, therefore it shoud be removed from the game
            currentDucks--;
            this.node.remove();
        } else {
            // The duck is still in the screen, so it should keep moving
            this.node.x(this.speedX, true);
            this.node.y(this.speedY, true);
        }
    };
    
    this.dead = function() {
        // This function is called when the duck has been hit. It changes the sprite and makes the duck fall
        node.setAnimation(duckAnimations["dead"]);
        this.alive = false;  
        this.speedX = this.speedX / 2;
        this.speedY = 20;
        node.rotate(70);
    };
    
    return true;
};

$(function(){  
    // Animations
    duckAnimations["flying"] = new $.gQ.Animation({imageURL: "img/flyingDuck.png", numberOfFrame: 6, delta: 114, rate: 30, type: $.gQ.ANIMATION_VERTICAL | $.gQ.ANIMATION_PINGPONG});
    duckAnimations["dead"] = new $.gameQuery.Animation({imageURL: "img/deadDuck.png"});
    playerAnimations["shooting"] = new $.gameQuery.Animation({imageURL: "img/shootAnim.png", numberOfFrame: 4, delta: 219, rate: 30, type: $.gQ.ANIMATION_HORIZONTAL | $.gQ.ANIMATION_ONCE | $.gQ.CALLBACK});
    playerAnimations["idle"] = new $.gameQuery.Animation({imageURL: "img/player.png"});    
    stageAnimations["grass"] = new $.gameQuery.Animation({imageURL: "img/grass.png"});
    stageAnimations["sky"] = new $.gameQuery.Animation({imageURL: "img/sky.png"});    
    stageAnimations["cloud"] = new $.gameQuery.Animation({imageURL: "img/cloud.png"});    
    stageAnimations["hitText"] = new $.gameQuery.Animation({imageURL: "img/hitText.png", numberOfFrame: 6, delta: 55, rate: 50, type: $.gQ.ANIMATION_HORIZONTAL | $.gQ.ANIMATION_ONCE | $.gQ.ANIMATION_CALLBACK});    
    
    
    var remainingTime = GAME_TIME;
    var gameOver = false;
    var player = new Player();

    var timeToNextDuck = 1000;
 
    var playerShot = false;
    var timeToShotgunReady = 0;
    var shotgunReady = true;
    
    // Setting the playground
    $("#playground").playground({height: PLAYGROUND_HEIGHT, width: PLAYGROUND_WIDTH, keyTracker: true, mouseTracker: true});
    $.playground().addGroup("backgroundLayer", {height: PLAYGROUND_HEIGHT, width: PLAYGROUND_WIDTH})
                        .addSprite("skySprite", {animation: stageAnimations["sky"], width: 700, height: 500, posx: 0, posy: 0})
                    .end()
                    .addGroup("duckLayer", {height: PLAYGROUND_HEIGHT, width: PLAYGROUND_WIDTH})
                    .end()    
                    .addGroup("grassLayer", {height: PLAYGROUND_HEIGHT, width: PLAYGROUND_WIDTH})
                        .addSprite("grassSprite", {animation: stageAnimations["grass"], width: 700, height: 183, posx: 0, posy: PLAYGROUND_HEIGHT - 183})
                    .addGroup("playerLayer", {height: PLAYGROUND_HEIGHT, width: PLAYGROUND_WIDTH})
                        .addSprite("playerSprite", {animation: playerAnimations["idle"], width: 219, height: 267})
                        .addSprite("playerShootSprite", {animation: playerAnimations["idle"], width: 219, height: 267})
                        .addSprite("cloudLeft", {animation: stageAnimations["cloud"], width: 167, height: 97, posx: -5})
                        .addSprite("cloudRight", {animation: stageAnimations["cloud"], width: 167, height: 97, posx: PLAYGROUND_WIDTH - 160, posy: 0})
                    .end()
                    .addGroup("overlay",{width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT});

    // Setting the HUD
    $("#overlay").append("<div id='hitDucksHUD' style='font-size: 1.1em; color: #b01515; width: 200px; position: absolute; top: 25px; left: 25px; font-family: 'bigBottom'';></div><div id='timerHUD' style='font-size: 1.7em; color: #0997b6; width: 100px; position: absolute; right: -5px; top: 20px; font-family: 'bigBottom'';></div>");    
    $("#hitDucksHUD").html("Ducks: " + hitDucks); 
    $("#timerHUD").html(remainingTime); 

 
 
    // Game difficulty parameters
    $("#easyStart").click(function(){
            $.playground().startGame(function(){
                    $("#welcomeScreen").fadeTo(1000,0,function(){$(this).remove(); startGame = true;});
                    remainingTime = GAME_TIME;
                    
                    MAX_DUCKS = 10;                    
                    minSpawnTime = 500;
                    maxSpawnTime = 1000;
                    minSpeed = 3;
                    maxSpeed = 8;
            });
    });
    $("#mediumStart").click(function(){
            $.playground().startGame(function(){
                    $("#welcomeScreen").fadeTo(1000,0,function(){$(this).remove(); startGame = true;});
                    remainingTime = GAME_TIME;
                    
                    MAX_DUCKS = 10;                    
                    minSpawnTime = 20;
                    maxSpawnTime = 500;
                    minSpeed = 8;
                    maxSpeed = 15;                                        
            });
    });

    $("#hardStart").click(function(){
            $.playground().startGame(function(){
                    $("#welcomeScreen").fadeTo(1000,0,function(){$(this).remove(); startGame = true;});
                    remainingTime = GAME_TIME;
                    
                    MAX_DUCKS = 20;                    
                    minSpawnTime = 10;
                    maxSpawnTime = 300;
                    minSpeed = 10;
                    maxSpeed = 20;                    
            });
    });
            

    
    // Timer callBack
    $.playground().registerCallback(function(){
        remainingTime--;
        $("#timerHUD").html(remainingTime);  
        if (remainingTime === 0) {
            gameOver = true;
        }
    }, 1000);
    
// *************************************************************************
// ***************************** MAIN LOOP *********************************
// *************************************************************************
    $.playground().registerCallback(function(){
         if (!gameOver) {
             // Shooting and player movement
            player.updatePosition($.gQ.mouseTracker.x, $.gQ.mouseTracker.y);
            if (!shotgunReady) {
                if (timeToShotgunReady <= 0) {
                    if(!$.gQ.mouseTracker[1]) {
                        shotgunReady = true;
                    }
                } else {
                    timeToShotgunReady -= REFRESH_RATE; 
                }
            } else {
                if($.gQ.mouseTracker[1]) {
                    timeToShotgunReady = SHOOT_RATE;
                    shotgunReady = false;
                    playerShot = true;
                    shot_x = $.gQ.mouseTracker.x;
                    shot_y = $.gQ.mouseTracker.y;
                    $("#playerShootSprite").setAnimation(playerAnimations["shooting"], function(){$("#playerShootSprite").setAnimation(); });
                }
            }

            
            // Duck Spawning
            if (currentDucks < MAX_DUCKS) {
                if (timeToNextDuck <= 0) {
                    // Starting position
                    var startingX = -140;                    
                    var startingY = getRandomInt(0, PLAYGROUND_HEIGHT - (114 + 183));
                    
                    // Creation of the duck sprite
                    var name = "duck" + duckCount;
                    $("#duckLayer").addSprite(name, {animation: duckAnimations["flying"], posx: startingX, posy: startingY, width: 140, height: 114});
                    
                    $("#" + name).addClass("duck");
                    $("#" + name)[0].duck = new Duck($("#" + name));
                    // The size of the duck is calculated
                    $("#" + name).scale(getRandomInt(5, 10) / 10);

                    $("#" + name)[0].duck.speedX = getRandomInt(minSpeed, maxSpeed);
                    $("#" + name)[0].duck.speedY = getRandomInt(-2, 2);

                    currentDucks++;
                    duckCount++;
                    timeToNextDuck = getRandomInt(minSpawnTime, maxSpawnTime);                    
                } else {
                    timeToNextDuck -= REFRESH_RATE;
                }
            }

            // Accessing every duck that is currently on the screen
            $(".duck").each(function(){
                // Check for hit
                var boxWidth = 72;
                var boxHeight = 28;
                var x_offset = 28;
                var y_offset = 48;

                if (this.duck.alive) 
                { // Check if the user has hit the duck by detecting if the mouse is inside a bonding box
                    if(playerShot && shot_x >= $(this).x() + x_offset && shot_x <= $(this).x() + boxWidth + x_offset
                        && shot_y >= $(this).y() + y_offset && shot_y <= $(this).y() + boxHeight + y_offset) {
                        hitDucks += 1;
                        $("#hitDucksHUD").html("Ducks: " + hitDucks); 
                        this.duck.dead();    
                        // Show the "hit" animation on top of the duck
                        $("#playerLayer").addSprite("hit", {animation: stageAnimations["hitText"], posx: shot_x - 40, posy: shot_y - 100, width: 55, height: 100, callback: function(node){$(node).remove(); }});                        
                    }
                }
               
                this.duck.updatePosition();
            });
            
            playerShot = false;
         } else {
             // The timer is over, game has ended
             $.playground().pauseGame();
             $.playground().clearScenegraph();
             duckCount -= currentDucks;
             var result = (hitDucks / duckCount) * 100;
             var rounded = Math.round(result * 10) / 10;
             //if (rounded === 1) rounded = 100;
             $("#playground").append("<div id='welcomeScreen'><h1> Game Over </h1><p> You have hit the " + rounded + " % of the ducks! </p><button id='restartButton' class='menuButton' type='submit'> Play again </button></div>");
            $("#restartButton").click(function(){
                 window.location.reload();
             });                 
         }
    }, REFRESH_RATE);   
    
});