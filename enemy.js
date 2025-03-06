import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';

export class Enemy {
  constructor(type, level, position) {
    this.type = type;
    this.level = level;
    this.health = 50 * level;
    this.position = position.clone();
    // Set a basic movement speed; you can adjust as needed.
    this.speed = 1 + 0.1 * level; 

    const colorMap = {
      skeleton: 0xffffff,
      rat: 0x888888,
      gnome: 0xffc0cb,
      snake: 0x00ff00,
      spider: 0x000000,
      caterpillar: 0xffff00,
      bear: 0x8b4513
    };
    const enemyColor = colorMap[type] || 0xff0000;
    // Use sphere geometry for standard enemies.
    // For special types like a dragon, you might still use a box.
    const geometry = (type === 'dragon')
      ? new THREE.BoxGeometry(1 * level, 1 * level, 1 * level)
      : new THREE.SphereGeometry(0.5 * level, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color: enemyColor });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.position);
  }

  update(delta, player) {
    // Compute direction vector from enemy to player.
    const direction = new THREE.Vector3();
    direction.subVectors(player.position, this.position);
    direction.y = 0; // Keep movement on the horizontal plane.
    
    if (direction.lengthSq() > 0.1) { // Only move if not extremely close.
      direction.normalize();
      // Move enemy by speed scaled by delta.
      this.position.add(direction.multiplyScalar(this.speed * delta));
    }
    
    // Update enemy mesh position.
    this.mesh.position.copy(this.position);
  }
}

export function createBoss(position) {
  const names = ["Smolder", "Fang", "Ember", "Drako", "Inferno"];
  const randomName = names[Math.floor(Math.random() * names.length)];
  const bossLevel = 10;
  const boss = new Enemy("dragon", bossLevel, position);
  boss.name = randomName;
  boss.health = 200;
  // Set boss speed slower if desired.
  boss.speed = 0.5;
  // Change boss appearance:
  boss.mesh.material.color.setHex(0xff0000);
  // Dispose of the original geometry and use a sphere instead.
  boss.mesh.geometry.dispose();
  boss.mesh.geometry = new THREE.SphereGeometry(1.5, 16, 16);
  boss.mesh.scale.set(3, 3, 3);
  
  return boss;
}
