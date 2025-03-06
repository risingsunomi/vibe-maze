import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';

export class Dungeon {
  constructor(width, height, cellSize) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.theme = Math.random() < 0.5 ? 'brick' : 'forest'; // Randomly choose theme
    this.maze = this.generateMaze();
  }

  generateMaze() {
    const maze = Array.from({ length: this.height }, () => new Array(this.width).fill(0));

    // Create border walls
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (y === 0 || y === this.height - 1 || x === 0 || x === this.width - 1) {
          maze[y][x] = 1;
        } else {
          maze[y][x] = Math.random() < 0.2 ? 1 : 0; // Sparse internal walls
        }
      }
    }

    // Create exits
    maze[0][Math.floor(this.width / 2)] = 0;
    maze[this.height - 1][Math.floor(this.width / 2)] = 0;

    return maze;
  }

  createWalls(scene) {
    const walls = [];
    let wallGeo, wallMat;

    if (this.theme === 'brick') {
      wallGeo = new THREE.BoxGeometry(this.cellSize, this.cellSize * 1.5, this.cellSize);
      wallMat = new THREE.MeshPhongMaterial({ color: 0x8b4513 }); // Brick-like brown
      // Simulate brick texture with a simple pattern (optional enhancement later)
    } else { // Forest
      wallGeo = new THREE.CylinderGeometry(0.3, 0.3, this.cellSize * 2, 8); // Tree trunk shape
      wallMat = new THREE.MeshPhongMaterial({ color: 0x228b22 }); // Forest green
    }

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.maze[y][x] === 1) {
          const wall = new THREE.Mesh(wallGeo, wallMat);
          wall.position.set(
            x * this.cellSize,
            this.theme === 'brick' ? this.cellSize * 0.75 : this.cellSize,
            y * this.cellSize
          );
          scene.add(wall);
          walls.push(wall);
        }
      }
    }
    return walls;
  }
}