var Button = function (text) {

    this.text = text;
    this.hand = addMenuCursor(text);
    this.isSelected = false;

    this.fire = null;

    this.selectButton = function () {
        this.isSelected = true;
        this.hand.visible = true;
    };

    this.deselectButton = function () {
        this.isSelected = false;
        this.hand.visible = false;
    };

    this.showButton = function(){
        this.text.visible = true;
    };

    this.hideButton = function(){
        this.text.visible = false;
        this.isSelected = false;
        this.hand.visible = false;
    };
};
