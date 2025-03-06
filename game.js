// game.js

// Import three.js and PointerLockControls from a remote CDN
import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';
import { PointerLockControls } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/PointerLockControls.js';
import { generateDungeon } from './dungeon.js'; // Local dungeon.js file

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 0.5); // Soft ambient light
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); // Sun-like light
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

// Player controls
const controls = new PointerLockControls(camera, document.body);
scene.add(controls.getObject());

// Clock for delta time
const clock = new THREE.Clock();

// Dungeon generation
const cellSize = 2;
const maze = generateDungeon(20, 20); // 20x20 maze
const walls = [];
let gameOver = false;

// Player object
const eyeHeight = 1.6; // Player eye height above feet
const player = {
    position: new THREE.Vector3(cellSize / 2, 0, cellSize / 2), // Feet at y=0
    velocity: new THREE.Vector3(0, 0, 0),
    speed: 5, // Movement speed
    onGround: true,
    health: 100,
    keys: { w: false, a: false, s: false, d: false, space: false }
};
camera.position.set(player.position.x, player.position.y + eyeHeight, player.position.z);

// Simple physics (gravity and jumping)
const gravity = -9.8;
const terminalVelocity = -20;
function updatePhysics(delta) {
    if (!player.onGround) {
        player.velocity.y += gravity * delta;
        if (player.velocity.y < terminalVelocity) {
            player.velocity.y = terminalVelocity;
        }
    }
    player.position.y += player.velocity.y * delta;
    if (player.position.y <= 0) {
        player.position.y = 0;
        player.onGround = true;
        player.velocity.y = 0;
    }
    if (player.keys.space && player.onGround) {
        player.velocity.y = 5; // Jump velocity
        player.onGround = false;
        player.keys.space = false; // Prevent holding space
    }
}

// Keyboard controls
document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'KeyW': player.keys.w = true; break;
        case 'KeyA': player.keys.a = true; break;
        case 'KeyS': player.keys.s = true; break;
        case 'KeyD': player.keys.d = true; break;
        case 'Space': player.keys.space = true; break;
    }
});
document.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'KeyW': player.keys.w = false; break;
        case 'KeyA': player.keys.a = false; break;
        case 'KeyS': player.keys.s = false; break;
        case 'KeyD': player.keys.d = false; break;
        case 'Space': player.keys.space = false; break;
    }
});

// Create dungeon walls and torches
function createWalls(maze) {
    const wallGeometry = new THREE.BoxGeometry(cellSize, 3, cellSize);
    const wallMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
    maze.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell === 1) {
                const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                wall.position.set(x * cellSize, 1.5, y * cellSize);
                scene.add(wall);
                walls.push(wall);
            }
            // Add torches for better lighting
            if (x % 5 === 0 && y % 5 === 0 && cell !== 1) {
                const torchLight = new THREE.PointLight(0xffaa00, 1, 10); // Orange torch light
                torchLight.position.set(x * cellSize, 1.5, y * cellSize);
                scene.add(torchLight);
            }
        });
    });
}

// Create floor
const floorGeometry = new THREE.PlaneGeometry(cellSize * 20, cellSize * 20);
const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Player movement
function updatePlayer(delta) {
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    dir.y = 0;
    dir.normalize();
    const side = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0));

    const moveSpeed = player.speed;
    const moveStep = new THREE.Vector3();

    if (player.keys.w) moveStep.add(dir.multiplyScalar(moveSpeed * delta));
    if (player.keys.s) moveStep.add(dir.multiplyScalar(-moveSpeed * delta));
    if (player.keys.a) moveStep.add(side.multiplyScalar(-moveSpeed * delta));
    if (player.keys.d) moveStep.add(side.multiplyScalar(moveSpeed * delta));

    // Basic collision detection with walls
    const raycaster = new THREE.Raycaster(player.position, moveStep.clone().normalize(), 0, moveStep.length());
    const intersects = raycaster.intersectObjects(walls);
    if (intersects.length === 0 || intersects[0].distance > moveStep.length()) {
        player.position.add(moveStep);
    }

    // Apply physics
    updatePhysics(delta);

    // Update camera to follow player
    camera.position.set(player.position.x, player.position.y + eyeHeight, player.position.z);
}

// Game over handling
function showGameOver() {
    gameOver = true;
    document.getElementById('gameOver').style.display = 'block';
}

// Animation loop
function animate() {
    if (!gameOver) {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();
        updatePlayer(delta);
        renderer.render(scene, camera);
    }
}

// Initialize the scene
createWalls(maze);

// Start screen and game over handlers
document.getElementById('startButton').addEventListener('click', () => {
    document.getElementById('startScreen').style.display = 'none';
    controls.lock();
    animate();
});

document.getElementById('continueButton').addEventListener('click', () => {
    document.getElementById('gameOver').style.display = 'none';
    player.health = 100;
    player.position.set(cellSize / 2, 0, cellSize / 2);
    camera.position.set(player.position.x, player.position.y + eyeHeight, player.position.z);
    gameOver = false;
    animate();
});

document.getElementById('exitButton').addEventListener('click', () => {
    window.location.href = 'https://chat.com'; // Adjust as needed
});

// Simulate game over for testing (remove this in production)
setTimeout(() => {
    player.health = 0;
    if (player.health <= 0) showGameOver();
}, 10000); // Game over after 10 seconds