var Player = function (x, y, image) {
    this.level = 0;
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
    this.accuracy = 85;
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
        console.log(this.currentHealth + '<- current Health of player\n' + damage + ' <- damage dealt\n' + this.health + '<- total player health')
    };

    this.draw = function draw() {
        stage.addChild(this.healthVisual);
        stage.addChild(this.image);
    };

    this.levelUp = function () {
        this.level++;
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