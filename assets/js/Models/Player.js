var Player = function (x, y, image) {
    this.level = 0;
    this.levelDisplay = drawText(x, y-25, '8px');
    this.damageLow;
    this.damageHigh;
    this.damageModifier = 0;
    this.health = 10 + levelModifierSlow(this.level);
    this.currentHealth;
    this.healthVisual = drawRect(x, y - 10, 0, 25, '#0F0');
    this.defending = false;
    this.defense = 0;
    this.image = image || new createjs.Bitmap();
    this.image.x = x;
    this.image.y = y;
    this.accuracy = 90;
    this.turnSkills = [];
    this.evasion;


    this.attack = function attack() {
        if(rollFate(this.accuracy)){
            return getRandomInt(this.damageLow, this.damageHigh);
        } else {
            return 0;
        }
    };

    this.takeDamage = function (damage) {
        if (this.defending) {
            damage /= (this.level / 2);
        }
        damage -= this.defense;
        this.currentHealth -= damage;
        if(this.currentHealth <= 0){
            this.image.visible = false;
            this.healthVisual.visible = false;
            this.levelDisplay.visible = false;
        }
    };

    this.draw = function draw() {
        stage.addChild(this.healthVisual);
        stage.addChild(this.image);
    };

    this.levelUp = function () {
        this.level++;
        this.levelDisplay.text = "Lvl. " + this.level + " HP: " + this.currentHealth + '/' + this.health;
        this.damageLow = (10 * levelModifierFast(this.level + 1)) + this.damageModifier;
        this.damageHigh = (12 * levelModifierFast(this.level + 1)) + this.damageModifier;
        this.health += levelModifierSlow(this.level);
        this.currentHealth = this.health;
    };

    this.draw = function draw() {
        stage.addChild(this.image);
    };

    this.remove = function remove() {
        stage.removeChild(this.image);
    };

    this.hideAll = function () {
        this.healthVisual.visible = false;
        this.image.visible = false;
        this.hand.visible = false;
    };

    this.showTheGoods = function () {
        this.healthVisual.visible = true;
        this.image.visible = true;
    };
};