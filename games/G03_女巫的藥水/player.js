function shootPlayerBullet() {
  //const b = playerBullets.create(player.x, player.y - 20);

  const totalBullets = playerUpgrades.spread; // 發射的子彈數
  const spacing = 20; // 子彈間的水平間距

  // 子彈總寬度 = (totalBullets - 1) * spacing，從中心向左右平均展開
  const startX = player.x - ((totalBullets - 1) * spacing) / 2;

  for (let i = 0; i < totalBullets; i++) {
    const bulletX = startX + i * spacing;
    const bulletY = player.y - 20;

    fireBullet(this, bulletX, bulletY, 0, -800); // 向上發射（y軸負方向）
  }

  // 導彈發射，每個支援器（tool）可依 missileCount 發射數枚導彈
  const baseAngle = 270;        // 中間角度（正上方）
  const spreadAngle = 8;       // 每顆導彈的角度偏移量
  const missilePairs = playerUpgrades.missileCount;

  // 每邊一顆主導彈 + (missileCount - 1) 對額外偏移導彈
  for (let i = 0; i < missilePairs; i++) {
    const angleOffset = i * spreadAngle;

    // 中心導彈：i = 0 → offset = 0（就是原來的 270 度）
    // 之後的：i = 1 → ±10 度，i = 2 → ±20 度，以此類推

    fireMissile(this, toolLeft.x, toolLeft.y - 10, baseAngle - angleOffset);  // 左偏
    fireMissile(this, toolRight.x, toolRight.y - 10, baseAngle + angleOffset); // 右偏
  }



  if (playerUpgrades.missileCount != 0) {
    toolLeft.setVisible(true);
    toolRight.setVisible(true);
  }

  /*if (b) {
    b.setActive(true);
    b.setVisible(true);
    b.setVelocityY(-400);
    b.setScale(1);
  }*/
}
function fireBullet(scene, x, y, offsetX = 0, offsetY = -400) {
  const bullet = playerBullets.create(x, y).setScale(0.5);
  if (bullet) {
    bullet.setActive(true).setVisible(true); // 啟用並顯示子彈
    bullet.body.allowGravity = false; // 取消重力影響
    bullet.body.velocity.x = offsetX; // 設定水平速度
    bullet.body.velocity.y = offsetY; // 設定垂直速度（預設向上）
  }
} function fireMissile(scene, x, y, angleDeg = 270) {
  const missile = playerBullets.create(x, y);
  if (missile) {
    missile.setActive(true).setVisible(true);
    missile.body.allowGravity = false;
    missile.setScale(0.3);

    const speed = 700;
    const angleRad = Phaser.Math.DegToRad(angleDeg);
    missile.body.setVelocity(
      Math.cos(angleRad) * speed,
      Math.sin(angleRad) * speed
    );

    // 如需旋轉貼圖：

    scene.physics.add.overlap(missile, scene.monster, (missileObj, monsterObj) => {
      missileObj.destroy();
      monsterObj.setTint(0xff0000);
      scene.time.delayedCall(100, () => monsterObj.clearTint());
    });
  }
}
