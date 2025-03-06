import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';

export class Player {
  constructor(camera) {
    this.camera = camera;
    this.position = new THREE.Vector3(1, 0, 1);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.health = 100;
    this.mana = 100;
    this.level = 1;
    this.xp = 0;
    this.spells = {
      iceCannon: { manaCost: 20, damage: 30, color: 0x00ffff },
      fireBall: { manaCost: 15, damage: 25, color: 0xff4500 },
      thunderBolt: { manaCost: 25, damage: 35, color: 0xffff00 }
    };
    this.selectedSpell = 'fireBall';
    this.keys = { w: false, a: false, s: false, d: false, space: false };
    this.onGround = true;
    this.speed = 5;
    this.radius = 0.4; // Player collision radius
    this.handObjects = [];
    this.createHands();
  }

  createHands() {
    const handGeo = new THREE.BoxGeometry(0.1, 0.1, 0.05);
    const handMat = new THREE.MeshBasicMaterial({ color: 0xffcc99, depthTest: false, transparent: true });
    
    const leftHand = new THREE.Mesh(handGeo, handMat);
    leftHand.position.set(-0.15, -0.15, -0.3);
    leftHand.renderOrder = 999;
    
    const rightHand = new THREE.Mesh(handGeo, handMat);
    rightHand.position.set(0.15, -0.15, -0.3);
    rightHand.renderOrder = 999;
    
    this.camera.add(leftHand);
    this.camera.add(rightHand);
    this.handObjects.push(leftHand, rightHand);
  }

  update(delta, walls) {
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
    const moveStep = new THREE.Vector3();

    if (this.keys.w) moveStep.add(forward.clone().multiplyScalar(this.speed * delta));
    if (this.keys.s) moveStep.add(forward.clone().multiplyScalar(-this.speed * delta));
    if (this.keys.a) moveStep.add(right.clone().multiplyScalar(-this.speed * delta));
    if (this.keys.d) moveStep.add(right.clone().multiplyScalar(this.speed * delta));

    // Collision detection with multiple rays
    const directions = [
      forward, // Forward
      forward.clone().negate(), // Backward
      right, // Right
      right.clone().negate() // Left
    ];
    const nextPosition = this.position.clone().add(moveStep);
    let canMove = true;

    for (const dir of directions) {
      const raycaster = new THREE.Raycaster(this.position, dir, 0, this.radius + moveStep.length());
      const intersects = raycaster.intersectObjects(walls);
      console.log("Intersects", intersects);
      if (intersects.length > 0 && intersects[0].distance < this.radius) {
        canMove = false;
        break;
      }
    }

    if (canMove) {
      this.position.copy(nextPosition);
    }

    // Vertical movement / gravity
    if (!this.onGround) {
      this.velocity.y += -9.8 * delta;
    }
    this.position.y += this.velocity.y * delta;
    if (this.position.y <= 0) {
      this.position.y = 0;
      this.onGround = true;
      this.velocity.y = 0;
    }
    if (this.keys.space && this.onGround) {
      this.velocity.y = 5;
      this.onGround = false;
      this.keys.space = false;
    }

    // Update camera position
    this.camera.position.set(this.position.x, this.position.y + 1.6, this.position.z);
  }

  castSpell(scene) {
    const spell = this.spells[this.selectedSpell];
    if (this.mana < spell.manaCost) return;
    this.mana -= spell.manaCost;
    const projGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const projMat = new THREE.MeshBasicMaterial({ color: spell.color });
    const projectile = new THREE.Mesh(projGeo, projMat);
    projectile.position.copy(this.camera.position);
    scene.add(projectile);
    const velocity = new THREE.Vector3();
    this.camera.getWorldDirection(velocity);
    velocity.normalize().multiplyScalar(10);
    projectile.userData = { velocity: velocity, life: 2 };
    if (!window.spellProjectiles) window.spellProjectiles = [];
    window.spellProjectiles.push(projectile);
  }
}