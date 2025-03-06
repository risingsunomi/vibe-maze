import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';
import { PointerLockControls } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/PointerLockControls.js';
import { Dungeon } from './dungeon.js';
import { Player } from './player.js';
import { Enemy, createBoss } from './enemy.js';

const cellSize = 2; // Define cellSize here

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.position = 'absolute';
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

// Controls
const controls = new PointerLockControls(camera, document.body);
scene.add(controls.getObject());

// Dungeon
const dungeon = new Dungeon(30, 30, cellSize);
const walls = dungeon.createWalls(scene);

// Floor
const floorGeo = new THREE.PlaneGeometry(cellSize * 20, cellSize * 20);
const floorMat = new THREE.MeshPhongMaterial({ color: 0x555555 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Player
const playerInstance = new Player(camera);

// Input handlers
document.addEventListener('keydown', (e) => {
  switch (e.code) {
    case 'KeyW': playerInstance.keys.w = true; break;
    case 'KeyA': playerInstance.keys.a = true; break;
    case 'KeyS': playerInstance.keys.s = true; break;
    case 'KeyD': playerInstance.keys.d = true; break;
    case 'Space': playerInstance.keys.space = true; break;
    case 'Digit1': playerInstance.selectedSpell = 'iceCannon'; break;
    case 'Digit2': playerInstance.selectedSpell = 'fireBall'; break;
    case 'Digit3': playerInstance.selectedSpell = 'thunderBolt'; break;
  }
});
document.addEventListener('keyup', (e) => {
  switch (e.code) {
    case 'KeyW': playerInstance.keys.w = false; break;
    case 'KeyA': playerInstance.keys.a = false; break;
    case 'KeyS': playerInstance.keys.s = false; break;
    case 'KeyD': playerInstance.keys.d = false; break;
    case 'Space': playerInstance.keys.space = false; break;
  }
});
document.addEventListener('mousedown', (e) => {
  if (e.button === 0) playerInstance.castSpell(scene);
});

// Spell projectiles
window.spellProjectiles = [];
function updateProjectiles(delta) {
  for (let i = window.spellProjectiles.length - 1; i >= 0; i--) {
    const proj = window.spellProjectiles[i];
    proj.position.add(proj.userData.velocity.clone().multiplyScalar(delta));
    proj.userData.life -= delta;
    if (proj.userData.life <= 0) {
      scene.remove(proj);
      window.spellProjectiles.splice(i, 1);
    }
  }
}

// Enemies
const enemies = [];
const enemyTypes = ["skeleton", "rat", "gnome", "snake", "spider", "caterpillar", "bear"];
for (let i = 0; i < 10; i++) {
  const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
  const pos = new THREE.Vector3(Math.random() * (cellSize * 20), 0, Math.random() * (cellSize * 20));
  const enemy = new Enemy(type, playerInstance.level, pos);
  enemies.push(enemy);
  scene.add(enemy.mesh);
}
const boss = createBoss(new THREE.Vector3(20, 0, 20));
enemies.push(boss);
scene.add(boss.mesh);

// HUD update
function updateHUD() {
  document.getElementById('health').textContent = `Health: ${playerInstance.health}`;
  document.getElementById('mana').textContent = `Mana: ${playerInstance.mana}`;
  document.getElementById('level').textContent = `Level: ${playerInstance.level}`;
}

// Game loop
let gameOver = false;
const clock = new THREE.Clock();
function animate() {
  if (!gameOver) {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    playerInstance.update(delta, walls);
    // Update pointer lock object position
    if (camera.parent) {
      camera.parent.position.set(playerInstance.position.x, playerInstance.position.y + 1.6, playerInstance.position.z);
    }
    updateProjectiles(delta);
    enemies.forEach(enemy => enemy.update(delta, playerInstance));
    updateHUD();
    renderer.render(scene, camera);
  }
}

// UI handlers
document.getElementById('startButton').addEventListener('click', () => {
  document.getElementById('startScreen').style.display = 'none';
  controls.lock();
  animate();
});
document.getElementById('continueButton').addEventListener('click', () => {
  document.getElementById('gameOver').style.display = 'none';
  playerInstance.health = 100;
  playerInstance.mana = 100;
  playerInstance.position.set(cellSize / 2, 0, cellSize / 2);
  if (camera.parent) {
    camera.parent.position.set(playerInstance.position.x, playerInstance.position.y + 1.6, playerInstance.position.z);
  }
  gameOver = false;
  animate();
});
document.getElementById('exitButton').addEventListener('click', () => {
  window.location.href = 'https://chat.com';
});
