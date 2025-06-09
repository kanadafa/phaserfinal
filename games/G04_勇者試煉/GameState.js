const GameState = (function () {
    let maxHealth = 5;
    let health = maxHealth;
    let selectedItem = null;

    // ✅ 新增：紀錄目前關卡名稱
    let currentLevelName = "Level1";

    function setCurrentLevel(name) {
        currentLevelName = name;
    }

    function getCurrentLevel() {
        return currentLevelName;
    }

    function getHealth() {
        return health;
    }

    function takeDamage() {
        if (health > 0) health--;
    }

    function resetHealth() {
        health = maxHealth;
    }

    function changeLevel(nextLevel) {
        console.log("GameState: Attempting to change level to", nextLevel);
        setCurrentLevel(nextLevel); // ✅ 每次切換時紀錄當前關卡名稱

        const existingButtons = document.querySelectorAll('button');
        console.log("GameState: Found", existingButtons.length, "buttons to remove");
        existingButtons.forEach(button => {
            console.log("GameState: Removing button:", button);
            button.remove();
        });

        switch (nextLevel) {
            case "Level1":
                console.log("GameState: Switching to Level 1");
                if (typeof Level1 !== 'undefined' && Level1.startLevel1) {
                    Level1.startLevel1();
                } else {
                    console.error("Level1.js 的 startLevel1() 尚未定義或未加載");
                }
                break;
            case "Level2":
                console.log("GameState: Switching to Level 2");
                if (typeof Level2 !== 'undefined' && Level2.startLevel2) {
                    Level2.startLevel2();
                } else {
                    console.error("Level2.js 的 startLevel2() 尚未定義或未加載");
                }
                break;
            case "Level3":
                console.log("GameState: Switching to Level 3");
                if (typeof Level3 !== 'undefined' && Level3.startLevel3) {
                    Level3.startLevel3();
                } else {
                    console.error("Level3.js 的 startLevel3() 尚未定義或未加載");
                }
                break;
            case "Level4":
                console.log("GameState: Switching to Level 4");
                if (typeof Level4 !== 'undefined' && Level4.startLevel4) {
                    Level4.startLevel4();
                } else {
                    console.error("Level4.js 的 startLevel4() 尚未定義或未加載");
                }
                break;
            case "Level5":
                console.log("GameState: Switching to Level 5");
                if (typeof Level5 !== 'undefined' && Level5.startLevel5) {
                    Level5.startLevel5();
                } else {
                    console.error("Level5.js 的 startLevel5() 尚未定義或未加載");
                }
                break;
            default:
                console.error("未知的關卡名稱:", nextLevel);
        }
    }

    return {
        getHealth,
        takeDamage,
        resetHealth,
        changeLevel,
        selectedItem,

        // ✅ 匯出這兩個方法供 DialogueManager.js 判斷使用
        setCurrentLevel,
        getCurrentLevel
    };
})();
