var FPS = 30;

var turns = 0;
var frameCount = 0;
var gameTimer = 0;
var state = INIT;
var turn = true;
var loadedText = drawText(50, 50);
var enemiesLeft = 0;
var newState;
var currentEnemies;

function startClick() {
    state = NEXT_LEVEL;
}

function instructionsClick() {
    state = PRE_INSTRUCTIONS;
}

function mainMenuClick() {
    state = CLEAR;
}

function attackClick() {
    playerDamage = Math.floor(player.attack());
    state = PRE_TARGET;
}

function defendClick() {
    player.defending = true;
    state = AI_PHASE;
}

function skillClick() {
    state = PRE_SKILL_SELECT;
}

var playerDamage;
var enemyDamage;

function loop() {
    if (filesLoaded) {
        switch (state) {
            case INIT:

                if (startButton) {
                    startButton.fire = startClick;
                }

                if (instructionsButton) {
                    instructionsButton.fire = instructionsClick;
                }

                if (mainMenuButton) {
                    mainMenuButton.fire = mainMenuClick;
                }

                if (quitButton) {
                    quitButton.fire = mainMenuClick;
                }

                if (attackButton) {
                    attackButton.fire = attackClick;
                }

                if (defendButton) {
                    defendButton.fire = defendClick;
                }

                player = new Player(587, 215, playerImg);
                player.draw();
                player.image.visible = false;
                player.levelDisplay.visible = false;

                state = PRE_MAIN_MENU;

                break;
            case PRE_MAIN_MENU:
                backgroundMusic.setMusic(mainMusic);
                backgroundMusic.again();
                background.image = titleScreen.image;
                logo.visible = true;

                //startButton.visible = true;
                startButton.showButton();
                instructionsButton.showButton();
                muteButton.showButton();
                mainMenuButton.hideButton();

                var options = [startButton, instructionsButton, muteButton];
                setMenuOptions(options);
                state = MAIN_MENU;
                break;
            case MAIN_MENU:
                break;
            case PRE_RUNNING:
                logo.visible = false;
                backgroundMusic.setMusic(battleMusic);

                var options = [];
                setMenuOptions(options);

                startButton.hideButton();
                instructionsButton.hideButton();
                mainMenuButton.hideButton();
                muteButton.hideButton();

                player.image.visible = true;
                player.healthVisual.visible = true;
                player.levelDisplay.visible = true;

                enemies.forEach(function (enemy) {
                    enemy.healthVisual.visible = true;
                });

                background.image = playScreen.image;
                battleBox.visible = true;
                state = RUNNING;
                break;
            case RUNNING:
                runTurnCount();

                attackButton.showButton();
                defendButton.showButton();
                skillButton.showButton();
                var options = [attackButton];
                setMenuOptions(options);

                if (player.currentHealth <= 0) {
                    state = PRE_GAME_OVER;
                } else if (player.level == 10) {
                    state = PRE_GAME_OVER;
                } else if (enemiesLeft <= 0) {
                    state = NEXT_LEVEL;
                } else {
                    state = SELECTION;
                }
                break;
            case PRE_GAME_OVER:
                backgroundMusic.setMusic(endMusic);
                backgroundMusic.again();
                resetGameTimer();

                enemies.forEach(function (enemy) {
                    enemy.image.visible = false;
                    enemy.healthVisual.visible = false;
                    enemy.levelDisplay.visible = false;
                    enemy.deselectButton();
                });
                player.image.visible = false;
                player.healthVisual.visible = false;
                player.levelDisplay.visible = false;

                gameoverScore.text = 'Final Level Beat\n - Level ' + player.level + '-';
                gameoverScore.visible = true;

                battleBox.visible = false;
                attackButton.hideButton();
                defendButton.hideButton();
                skillButton.hideButton();

                mainMenuButton.showButton();

                var options = [mainMenuButton];
                setMenuOptions(options);

                background.image = gameoverScreen.image;

                state = GAME_OVER;
                break;
            case GAME_OVER:


                break;
            case PRE_INSTRUCTIONS:
                logo.visible = false;
                startButton.hideButton();
                instructionsButton.hideButton();
                mainMenuButton.showButton();

                var options = [mainMenuButton, muteButton];
                setMenuOptions(options);
                state = INSTRUCTIONS;
                break;
            case INSTRUCTIONS:
                background.image = instructionsScreen.image;
                break;
            case NEXT_LEVEL:

                startButton.hideButton();
                instructionsButton.hideButton();
                mainMenuButton.hideButton();
                muteButton.hideButton();
                player.levelUp();

                enemies.forEach(function (enemy) {
                    enemiesLeft++;
                    enemy.image.visible = true;
                    enemy.levelDisplay.visible = true;
                    if (player.level % 5 == 0) {
                        currentLevel++;
                        enemy.setStats(getRandomInt(currentLevel, currentLevel + 3));
                    } else {
                        enemy.setStats(getRandomInt(currentLevel, currentLevel + 1));
                    }
                });

                currentEnemies = enemies;

                currentLevel++;

                resetGameTimer();
                state = PRE_RUNNING;
                break;
            case PRE_PAUSE:
                pauseBox.visible = true;
                quitButton.showButton();
                pauseMuteButton.showButton();

                var options = [quitButton, pauseMuteButton];
                setMenuOptions(options);

                state = PAUSE;
                break;
            case PAUSE:
                break;
            case UNPAUSE:
                pauseBox.visible = false;
                quitButton.hideButton();
                pauseMuteButton.hideButton();
                state = PRE_RUNNING;
                break;
            case SELECTION:
                turn = true;
                break;
            case PRE_TARGET:
                var options = [];
                enemies.forEach(function (enemy) {
                    if (enemy.currentHealth > 0) {
                        options.push(enemy);
                    }
                });
                setMenuOptions(options);
                state = TARGET;
                break;
            case TARGET:
                attackButton.deselectButton();
                defendButton.deselectButton();
                skillButton.deselectButton();
                break;
            case DAMAGE:
                if (turn) {
                    enemiesLeft = 0;
                    enemies.forEach(function (enemy) {
                        if (enemy.underAttack) {
                            enemy.takeDamage(playerDamage);
                            if (playerDamage > 0) {
                                damageDisplay.text = Math.floor(playerDamage);
                            } else {
                                damageDisplay.text = 'Missed'
                            }

                            damageDisplay.x = enemy.image.x + 60;
                            damageDisplay.y = enemy.image.y + 10;

                            createjs.Tween.get(damageDisplay).to({
                                alpha: 1,
                                y: damageDisplay.y - 20
                            }, 200).call(function () {
                                createjs.Tween.get(damageDisplay).wait(100).to({alpha: 0}, 200).call(function () {
                                    damageDisplay.text = '';
                                    damageDisplay.y += 20;
                                    state = AI_PHASE;
                                });
                            });
                        }

                        if (enemy.currentHealth > 0) {
                            enemiesLeft++;
                        } else {
                            enemy.dead = true;
                            currentEnemies = currentEnemies.filter(function (el) {
                                return el !== enemy;
                            });
                        }
                    });
                    state = LIMBO;
                } else {
                    enemyAttack(currentEnemies, 0);

                    state = LIMBO;
                }
                break;
            case AI_PHASE:
                turn = false;
                state = DAMAGE;
                break;
            case PRE_SKILL_SELECT:
                break;
            case SKILL_SELECT:
                break;
            case CLEAR:
                currentLevel = 1;
                player.level = 0;
                paused = false;
                battleBox.visible = false;
                mainMenuButton.hideButton();
                pauseBox.visible = false;
                quitButton.hideButton();
                pauseMuteButton.hideButton();

                attackButton.hideButton();
                defendButton.hideButton();
                skillButton.hideButton();

                gameoverScore.visible = false;

                enemies.forEach(function (enemy) {
                    enemy.level = 0;
                    enemy.image.visible = false;
                    enemy.healthVisual.visible = false;
                    enemy.levelDisplay.visible = false;
                    enemy.deselectButton();
                });
                player.image.visible = false;
                player.healthVisual.visible = false;
                player.levelDisplay.visible = false;
                state = PRE_MAIN_MENU;
                break;
            case PRE_NEW_SKILL:
                state = NEW_SKILL;
                break;
            case NEW_SKILL:
                break;
            case LIMBO:
                if (currentEnemies.length <= 0) {
                    state = RUNNING;
                }
                break;
            case INTERVAL:
                wait(1);
                break;
        }
        //mousePos.text = "X: " + mouseX + ", Y: " + mouseY;
        enemies.forEach(function (enemy) {
            enemy.healthVisual.graphics.clear().beginFill("#0f0").drawRect(enemy.image.x, enemy.image.y - 10, (enemy.currentHealth / enemy.health) * 100, 5);
        });
        player.healthVisual.graphics.clear().beginFill("#0f0").drawRect(player.image.x, player.image.y - 10, (player.currentHealth / player.health) * 100, 5);
        player.levelDisplay.text = "Lvl. " + player.level + " HP: " + Math.floor(player.currentHealth) + '/' + player.health;
        stage.update();
    }
}

function resetGameTimer() {
    gameTimer = 0;
    frameCount = 0;
}

function runGameTimer() {
    frameCount += .5;
    if (frameCount % (FPS / 60) === 0) {
        gameTimer = frameCount / (FPS);
    }
    return gameTimer;
}

function wait(time) {
    var second = runGameTimer();
    if (second >= time) {
        state = newState;
        resetGameTimer();
    }
}

function runTurnCount() {
    turns++;
}

function enemyAttack(enemies, enemyNum) {

    if (enemyNum <= 2) {
        var enemy = enemies[enemyNum];
        if (enemy) {
            if (!enemy.dead) {
                enemyDamage = Math.floor(enemy.attack());

                playerDamageDisplay.x = player.image.x - 20;
                playerDamageDisplay.y = player.image.y - 30;

                if (enemyDamage > 0) {
                    playerDamageDisplay.text = Math.floor(enemyDamage);
                } else {
                    playerDamageDisplay.text = 'Missed'
                }

                createjs.Tween.get(playerDamageDisplay).to({
                    alpha: 1,
                    y: playerDamageDisplay.y - 20
                }, 200).call(function () {
                    createjs.Tween.get(playerDamageDisplay).wait(100).to({alpha: 0}, 200).call(function () {
                        playerDamageDisplay.text = '';
                        playerDamageDisplay.y += 20;
                        dealDamage();
                        if (enemyNum == enemies.length - 1) {
                            state = RUNNING;
                        }
                        return enemyAttack(enemies, enemyNum + 1)
                    });
                });
            }
        }
    }
    return null;
}

function dealDamage() {
    player.takeDamage(enemyDamage);
}

createjs.Ticker.addEventListener("tick", loop);
createjs.Ticker.setFPS(FPS);
