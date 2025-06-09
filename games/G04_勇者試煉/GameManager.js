const GameManager = {
    currentLevel: null,

    startLevel1: function () {
        console.log("開啟 Level1");
        if (this.currentLevel) this.currentLevel = null;
        this.currentLevel = Level1;
        this.currentLevel.startLevel1();
    },

    startLevel2: function () {
        console.log("開啟 Level2");
        if (this.currentLevel) this.currentLevel = null;
        this.currentLevel = Level2;
        this.currentLevel.startLevel2();
    },

    startLevel3: function () {
        console.log("開啟 Level3");
        if (this.currentLevel) this.currentLevel = null;
        this.currentLevel = Level3;
        this.currentLevel.startLevel3();
    },

    startLevel4: function () {
        console.log("開啟 Level4");
        if (this.currentLevel) this.currentLevel = null;
        this.currentLevel = Level4;
        this.currentLevel.startLevel4();
    },

    startLevel5: function () {
        console.log("開啟 Level5");
        if (this.currentLevel) this.currentLevel = null;
        this.currentLevel = Level5;
        this.currentLevel.startLevel5();
    }
};
