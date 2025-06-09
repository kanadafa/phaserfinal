const Gameplay = (function () {
    let speedMultiplier = 1.0;
    const baseSpeed = 4;
  
    function setSpeedMultiplier(multiplier) {
      speedMultiplier = multiplier;
    }
  
    function getCurrentSpeed() {
      return baseSpeed * speedMultiplier;
    }
  
    return {
      setSpeedMultiplier,
      getCurrentSpeed
    };
  })();
  