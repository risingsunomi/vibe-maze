// dungeon.js

export function generateDungeon(width, height) {
    // Create an empty grid filled with zeros (open spaces)
    const maze = Array(height).fill().map(() => Array(width).fill(0));
    
    // Place walls in a simple pattern (every other cell is a wall)
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (x % 2 === 0 || y % 2 === 0) {
                maze[y][x] = 1; // 1 represents a wall
            }
        }
    }
    
    return maze;
}