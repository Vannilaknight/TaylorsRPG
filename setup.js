//CONSTANTS
//
var INIT = 0,
    PRE_MAIN_MENU = 1,
    MAIN_MENU = 2,
    PRE_RUNNING = 3,
    RUNNING = 4,
    PRE_GAME_OVER = 5,
    GAME_OVER = 6,
    PRE_INSTRUCTIONS = 7,
    INSTRUCTIONS = 8,
    NEXT_LEVEL = 9,
    PRE_PAUSE = 10,
    PAUSE = 11,
    UNPAUSE = 12,
    SELECTION = 13,
    TARGET = 14,
    DAMAGE = 15,
    AI_PHASE = 16,
    CLEAR = 17,
    PRE_SKILL_SELECT = 18,
    SKILL_SELECT = 19,
    PRE_NEW_SKILL = 20,
    NEW_SKILL = 21,
    PRE_TARGET = 22,
    INTERVAL = 23,
    LIMBO = 24;

var KEYCODE_LEFT = 37,
    KEYCODE_UP = 38,
    KEYCODE_RIGHT = 39,
    KEYCODE_DOWN = 40,
    KEYCODE_ENTER = 13,
    KEYCODE_SPACE = 32,
    KEYCODE_ESCAPE = 27,
    KEYCODE_P = 80;

//TOOLS
//
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//x^ + x
function levelModifierSlow(level) {
    return (Math.pow(level, 2) + level)
}

function rollFate(percent) {
    return getRandomInt(1, 100) < percent
}

//log2(x)
function levelModifierFast(level) {
    return Math.log(level) / Math.log(2)
}

function drawText(x, y, size, color, stroke) {
    if (stroke) {
        var myText = new createjs.Text('', size + " 'Press Start 2P'", stroke.color);
        myText.outline = stroke.size;
        myText.x = x; //positions the text
        myText.y = y;

        var myText2 = myText.clone();
        myText2.outline = false;
        myText2.color = color;
        myText2.x = x; //positions the text
        myText2.y = y;

        stage.addChild(myText, myText2);
        return {text: myText2, textStroke: myText};
    } else {
        var myText = new createjs.Text('', size + " 'Press Start 2P'", color || "#000");  //creates text object
        myText.x = x; //positions the text
        myText.y = y;
        stage.addChild(myText);  //adds the text object to the stage

        return myText;
    }
}

function drawRectStroke(x, y, width, height, color) {
    var myRect = new createjs.Shape();
    myRect.graphics.setStrokeStyle(1);
    myRect.graphics.beginStroke(color).drawRect(x, y, width, height);

    stage.addChild(myRect);
    return myRect
}

function drawRect(x, y, width, height, color) {
    var myRect = new createjs.Shape();
    myRect.graphics.beginFill(color).drawRect(x, y, width, height);

    stage.addChild(myRect);
    return myRect
}

function createHitBox(objectToHit) {
    var hit = new createjs.Shape();
    hit.graphics.beginFill("#000").drawRect(0, 0, objectToHit.getMeasuredWidth(), objectToHit.getMeasuredHeight() * 2);

    return hit;
}

function addMenuCursor(objectToAddCursor) {
    var cursor = new createjs.Bitmap();
    cursor.image = menuSelect.image;
    cursor.x = objectToAddCursor.x - 50;
    cursor.y = objectToAddCursor.y - 10;
    cursor.visible = false;

    stage.addChild(cursor);
    return cursor;
}

var filesLoaded = false;
var stage;
var manifest;
var preload;
var progressText;
var progressBar;
var progressBarOutline;
var mousePos;

var mouseX, mouseY;

/*
 ** AUDIO
 */
var backgroundMusic;
var mainMusic;
var battleMusic;
var endMusic;

/*
 ** SCORE
 */
var scoreDisplay;
var finalScoreDisplay;
var score = 'score: ' + 0;

/*
 ** CURSOR ASSETS
 */
var mouseCursor;
var menuSelect;

/*
 ** BUTTON ASSETS
 */
var startButtonText;
var startButton;
var instructionsButtonText;
var instructionsButton;
var mainMenuButtonText;
var mainMenuButton;
var muteButtonText;
var muteButton;

/*
 ** IMAGE ASSETS
 */
var background;
var titleScreen;
var instructionsScreen;
var playScreen;
var gameoverScreen;
var playerImg;
var logo;
var logoText;
var logoTextStroke;

/*
 ** menu
 */
var allButtons = [];
var selectableChoices = [];
var amountOfSelections;
var menuPosition;
var paused = false;
var gameoverScore;

/*
 ** pause menu
 */
var pauseBox;
var quitButtonText;
var quitButton;
var pauseMuteButtonText;
var pauseMuteButton;


/*
 ** battle menu
 */
var battleBox;
var attackButtonText;
var attackButton;
var defendButtonText;
var defendButton;
var skillButtonText;
var skillButton;
var damageDisplay;
var playerDamageDisplay;

function setMenuOptions(options) {
    if (options.length > 0) {
        selectableChoices = options;
        amountOfSelections = selectableChoices.length - 1;
        selectableChoices[0].selectButton();
        menuPosition = 0;
    } else {
        selectableChoices = null;
        amountOfSelections = null;
        menuPosition = null;
    }
}

function selectUp() {
    if (selectableChoices) {
        selectableChoices[menuPosition].deselectButton();
        menuPosition--;
        if (menuPosition < 0) {
            menuPosition = amountOfSelections;
            selectableChoices[menuPosition].selectButton();
        } else {
            selectableChoices[menuPosition].selectButton();
        }
    }
}

function selectDown() {
    if (selectableChoices) {
        selectableChoices[menuPosition].deselectButton();
        menuPosition++;
        if (menuPosition > amountOfSelections) {
            menuPosition = 0;
            selectableChoices[menuPosition].selectButton();
        } else {
            selectableChoices[menuPosition].selectButton();
        }
    }
}

function fireButton() {
    selectableChoices.forEach(function (button) {
        if (button.isSelected) {
            button.fire();
        }
    });
}

function pause() {
    if (state != RUNNING || state != GAME_OVER || state != INSTRUCTIONS) {
        if (paused) {
            paused = !paused;
            state = UNPAUSE;
        } else {
            paused = !paused;
            state = PRE_PAUSE;
        }
    }
}

function mouseInit() {
    stage.enableMouseOver();
    stage.cursor = 'none';
    stage.on("stagemousemove", function (evt) {
        mouseX = Math.floor(evt.stageX);
        mouseY = Math.floor(evt.stageY);
    });
    mousePos = drawText(0, 0, '12px');

    stage.addChild(mousePos);
}

function keyboardInit() {
    function handleKeyDown(evt) {
        if (!evt) {
            var evt = window.event;
        }  //browser compatibility
        switch (evt.keyCode) {
            case KEYCODE_LEFT:
                return false;
            case KEYCODE_RIGHT:
                return false;
            case KEYCODE_UP:
                selectUp();
                return false;
            case KEYCODE_DOWN:
                selectDown();
                return false;
            case KEYCODE_P:
                pause();
                return false;
            case KEYCODE_ESCAPE:
                pause();
                break;
            case KEYCODE_SPACE:
                fireButton();
                break;
            case KEYCODE_ENTER:
                fireButton();
                break;
        }
    }

    function handleKeyUp(evt) {
        if (!evt) {
            var evt = window.event;
        }  //browser compatibility
        switch (evt.keyCode) {
            case KEYCODE_LEFT:
                break;
            case KEYCODE_RIGHT:
                break;
            case KEYCODE_UP:
                break;
            case KEYCODE_DOWN:
                break;
            case KEYCODE_SPACE:
                break;
            case KEYCODE_ENTER:
                break;
        }
    }

    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
}

function setupCanvas() {
    var canvas = document.getElementById("game"); //get canvas with id='game'
    canvas.width = 800;
    canvas.height = 600;
    stage = new createjs.Stage(canvas); //makes stage object from the canvas
    background = new createjs.Bitmap();
    stage.addChild(background);

}


function setupManifest() {

    manifest = [{
        src: "assets/js/Models/Music.js",
        id: "musicjs"
    }, {
        src: "assets/js/Models/Player.js",
        id: "playerjs"
    }, {
        src: "assets/js/Models/Enemy.js",
        id: "enemyjs"
    }, {
        src: "assets/js/Models/Button.js",
        id: "buttonjs"
    }, {
        src: "assets/images/menuBackground.png",
        id: "title"
    }, {
        src: "assets/images/logo.png",
        id: "logo"
    }, {
        src: "assets/images/instructions.jpg",
        id: "instructions"
    }, {
        src: "assets/images/battleBackground.png",
        id: "play"
    }, {
        src: "assets/images/gameover.jpg",
        id: "gameover"
    }, {
        src: "assets/images/handPointer.png",
        id: "mouseCursor"
    }, {
        src: "assets/images/sideMenuCursor.png",
        id: "menuSelect"
    }, {
        src: "assets/images/player.png",
        id: "player"
    }, {
        src: "assets/images/slime.png",
        id: "slime"
    }, {
        src: "assets/images/pauseMenu.png",
        id: "pauseMenu"
    }, {
        src: "assets/images/battleMenu.png",
        id: "battleMenu"
    }, {
        src: "assets/audio/main.ogg",
        id: "mainMusic"
    }, {
        src: "assets/audio/battle.ogg",
        id: "battleMusic"
    }, {
        src: "assets/audio/end.ogg",
        id: "endMusic"
    }, {
        src: "assets/js/gameVariables.js",
        id: "gameVariablesjs"
    }, {
        src: "assets/js/main.js",
        id: "mainJs"
    }];
}

function startPreload() {
    progressBar = drawRect(50, 275, 0, 50, "#8BFFAC");
    progressText = drawText(325, 285, '24px');
    progressBarOutline = drawRectStroke(50, 275, 700, 50, "#000");
    preload = new createjs.LoadQueue(true);
    preload.installPlugin(createjs.Sound);
    preload.on("fileload", handleFileLoad);
    preload.on("progress", handleFileProgress);
    preload.on("complete", loadComplete);
    preload.on("error", loadError);
    preload.loadManifest(manifest);
}

function handleFileLoad(event) {
    //console.log("A file has loaded of type: " + event.item.type);
}


function loadError(evt) {
    console.log("Error!", evt.text);
}


function handleFileProgress(event) {
    progressBar.graphics.clear().beginFill("#8BFFAC").drawRect(50, 275, preload.progress * 700, 50);
    progressText.text = (preload.progress * 100 | 0) + " % Loaded";
    stage.update();
}


function loadComplete(event) {
    filesLoaded = true;
    //console.log("Finished Loading Assets");

    //audio
    backgroundMusic = new Music();
    mainMusic = createjs.Sound.play("mainMusic", {loop: -1});
    mainMusic.volume = 0;
    battleMusic = createjs.Sound.play("battleMusic", {loop: -1});
    battleMusic.volume = 0;
    endMusic = createjs.Sound.play("endMusic", {loop: -1});
    endMusic.volume = 0;

    //backgrounds
    titleScreen = new createjs.Bitmap(preload.getResult("title"));
    instructionsScreen = new createjs.Bitmap(preload.getResult("instructions"));
    playScreen = new createjs.Bitmap(preload.getResult("play"));
    gameoverScreen = new createjs.Bitmap(preload.getResult("gameover"));

    //menuAssets (i.e. Cursor, hover effects, etc)

    menuSelect = new createjs.Bitmap(preload.getResult("menuSelect"));

    logo = new createjs.Bitmap(preload.getResult("logo"));
    logo.x = 30;
    logo.y = 30;
    stage.addChild(logo);


    //buttons


    startButtonText = drawText(500, 450, '24px', '#757475');
    startButton = new Button(startButtonText);
    startButton.text.text = "START";
    startButton.hideButton();



    instructionsButtonText = drawText(500, 500, '24px', '#757475');
    instructionsButton = new Button(instructionsButtonText);
    instructionsButton.text.text = 'INSTRUCTIONS';
    instructionsButton.hideButton();

    muteButtonText = drawText(500, 550, '24px', '#757475');
    muteButton = new Button(muteButtonText);
    muteButton.text.text = "MUTE";
    muteButton.fire = function () {
        backgroundMusic.muted ? backgroundMusic.unMute() : backgroundMusic.mute();
    };
    muteButton.hideButton();

    mainMenuButtonText = drawText(500, 500, '24px', '#757475');
    mainMenuButton = new Button(mainMenuButtonText);
    mainMenuButton.text.text = 'MAIN MENU';
    mainMenuButton.hideButton();


    //characters
    playerImg = new createjs.Bitmap(preload.getResult("player"));
    enemies.push(new Enemy(104, 189, new createjs.Bitmap(preload.getResult("slime")), 'slime 1'));
    enemies.push(new Enemy(204, 283, new createjs.Bitmap(preload.getResult("slime")), 'slime 2'));
    enemies.push(new Enemy(102, 365, new createjs.Bitmap(preload.getResult("slime")), 'slime 3'));
    enemies.forEach(function (enemy) {
        enemy.draw();
        enemy.image.visible = false;
        enemy.levelDisplay.visible = false;
    });

    /*
     *  mouse
     */
    //mouseCursor = new createjs.Bitmap(preload.getResult("mouseCursor"));
    //mouseCursor.scaleX = .05;
    //mouseCursor.scaleY = .05;
    //mouseCursor.visible = false;
    //stage.addChild(mouseCursor);

    /*
     * battle menu
     */
    battleBox = new createjs.Bitmap(preload.getResult("battleMenu"));
    battleBox.x = 0;
    battleBox.y = 440;
    stage.addChild(battleBox);
    battleBox.visible = false;

    attackButtonText = drawText(60, 470, '24px', '#fff');
    attackButton = new Button(attackButtonText);
    attackButton.text.text = "ATTACK";
    attackButton.hideButton();

    defendButtonText = drawText(60, 510, '24px', '#b3b3b3');
    defendButton = new Button(defendButtonText);
    defendButton.text.text = "DEFEND";
    defendButton.hideButton();

    skillButtonText = drawText(60, 550, '24px', '#b3b3b3');
    skillButton = new Button(skillButtonText);
    skillButton.text.text = "SKILL";
    skillButton.hideButton();

    damageDisplay = drawText(380, 200, '24px', '#f22');
    damageDisplay.alpha = 0;

    playerDamageDisplay = drawText(380, 200, '24px', '#f22');
    playerDamageDisplay.alpha = 0;

    gameoverScore = drawText(250,230, '24px');
    gameoverScore.visible = false;
    /*
     * pause menu
     */
    pauseBox = new createjs.Bitmap(preload.getResult("pauseMenu"));
    pauseBox.x = 267;
    pauseBox.y = 35;
    stage.addChild(pauseBox);
    pauseBox.visible = false;

    quitButtonText = drawText(300, 470, '32px', '#fff');
    quitButton = new Button(quitButtonText);
    quitButton.text.text = "QUIT";
    quitButton.hideButton();

    pauseMuteButtonText = drawText(300, 420, '32px', '#fff');
    pauseMuteButton = new Button(pauseMuteButtonText);
    pauseMuteButton.text.text = "MUTE";
    pauseMuteButton.fire = function () {
        backgroundMusic.muted ? backgroundMusic.unMute() : backgroundMusic.mute();
    };
    pauseMuteButton.hideButton();

    //remove progress bar
    progressBar.visible = false;
    progressText.visible = false;
    progressBarOutline.visible = false;
}

function main() {
    setupCanvas(); //sets up the canvas
    //mouseInit();
    keyboardInit();
    setupManifest();
    startPreload();
}

main();
