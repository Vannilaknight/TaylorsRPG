var Enemy = function (x, y, image, tag) {
    this.tag = tag || '';
    this.isSelected;
    this.level;
    this.levelDisplay = drawText(x, y - 25, '8px');
    this.damageLow;
    this.damageHigh;
    this.health;
    this.currentHealth;
    this.underAttack = false;
    this.attacking = false;
    this.image = image;
    this.image.x = x;
    this.image.y = y;
    this.healthVisual = drawRect(x, y - 10, 0, 25, '#0F0');
    this.accuracy = 50;
    this.evasion;
    this.hand = addMenuCursor(image);
    this.dead = false;

    this.selectButton = function () {
        this.isSelected = true;
        this.hand.visible = true;
    };

    this.deselectButton = function () {
        this.isSelected = false;
        this.hand.visible = false;
    };

    this.attack = function attack() {
        if (rollFate(this.accuracy)) {
            return getRandomInt(this.damageLow, this.damageHigh);
        } else {
            return 0;
        }
    };

    this.takeDamage = function (damage) {
        this.currentHealth -= damage;
        this.underAttack = false;
        this.deselectButton();
        if (this.currentHealth <= 0) {
            this.image.visible = false;
            this.healthVisual.visible = false;
            this.levelDisplay.visible = false;
        }
    };

    this.draw = function draw() {
        stage.addChild(this.healthVisual);
        stage.addChild(this.image);
    };

    this.remove = function remove() {
        stage.removeChild(this.image);

    };

    this.fire = function () {
        if (this.isSelected) {
            this.underAttack = true;
            state = DAMAGE;
        }
    };

    this.setStats = function (level) {
        this.level = level;
        this.dead = false;
        this.image.alpha = 1;
        this.accuracy += .5;
        this.levelDisplay.text = 'Lvl. ' + this.level;
        this.damageLow = 1.5 * levelModifierFast(this.level);
        this.damageHigh = 2 * levelModifierFast(this.level);
        this.health = 10 + levelModifierSlow(this.level);
        this.currentHealth = this.health;
    };
};