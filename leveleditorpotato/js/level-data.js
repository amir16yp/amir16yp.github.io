/**
 * Level data structures for the Potato Level Editor
 */

/**
 * Wall class represents a wall or floor tile
 */
class Wall {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
    }

    getType() {
        return this.type;
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }
}

/**
 * Door class extends Wall to represent doors
 */
class Door extends Wall {
    constructor(keyType, x, y, textureId = 1) {
        super(textureId, x, y);
        this.keyType = keyType || 0; // Default to no key required
    }

    getKeyType() {
        return this.keyType;
    }

    setKeyType(keyType) {
        this.keyType = keyType;
    }

    getCurrentTexture() {
        // In a full implementation, this would return a different texture
        // based on door state (open/closed)
        return null; // getTile is called externally
    }
}

/**
 * EntityData class represents an entity in the level
 */
class EntityData {
    constructor(className, x, y, enemyType = null) {
        this.className = className;
        this.x = x;
        this.y = y;
        this.enemyType = enemyType;
    }

    getClassName() {
        return this.className;
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    getEnemyType() {
        return this.enemyType;
    }

    isEnemyEntity() {
        return this.className === "potato.entities.EnemyEntity";
    }
}

/**
 * LevelData class maintains the complete level data
 */
class LevelData {
    constructor(width = GRID_WIDTH, height = GRID_HEIGHT) {
        this.width = width;
        this.height = height;
        
        // Initialize empty maps
        this.wallMap = Array(height).fill().map(() => Array(width).fill(null));
        this.floorMap = Array(height).fill().map(() => Array(width).fill(null));
        
        // Level properties
        this.floorColor = '#646464'; // RGB: 100, 100, 100
        this.ceilingColor = '#87CEFA'; // RGB: 135, 206, 250 (light sky blue)
        this.fogColor = '#87CEFA'; // Same as ceiling by default
        this.floorTextureId = null;
        this.ceilingTextureId = null;
        
        // Entity data
        this.spawnPoint = null;
        this.entities = [];
    }

    /**
     * Reset the level data to empty state
     */
    clear() {
        // Clear wall and floor maps
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.wallMap[y][x] = null;
                this.floorMap[y][x] = null;
            }
        }
        
        // Reset properties to defaults
        this.floorColor = '#646464';
        this.ceilingColor = '#87CEFA';
        this.fogColor = '#87CEFA';
        this.floorTextureId = null;
        this.ceilingTextureId = null;
        
        // Clear entities and spawn
        this.spawnPoint = null;
        this.entities = [];
    }

    /**
     * Get a wall or null at the specified position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {boolean} isWallLayer - Whether to get from wall or floor layer
     * @returns {Wall|null} - The wall at the position or null
     */
    getWallAt(x, y, isWallLayer) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return null;
        }
        
        const map = isWallLayer ? this.wallMap : this.floorMap;
        return map[y][x];
    }
    
    /**
     * Set a wall at the specified position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {Wall|null} wall - The wall to set, or null to clear
     * @param {boolean} isWallLayer - Whether to set in wall or floor layer
     */
    setWallAt(x, y, wall, isWallLayer) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return;
        }
        
        const map = isWallLayer ? this.wallMap : this.floorMap;
        map[y][x] = wall;
    }
    
    /**
     * Add an entity to the level
     * @param {EntityData} entity - The entity to add
     */
    addEntity(entity) {
        this.entities.push(entity);
    }
    
    /**
     * Remove entities at the specified grid position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    removeEntitiesAt(x, y) {
        this.entities = this.entities.filter(entity => 
            Math.floor(entity.getX()) !== x || Math.floor(entity.getY()) !== y
        );
    }
    
    /**
     * Set the spawn point
     * @param {Object} point - An object with x and y properties
     */
    setSpawnPoint(point) {
        this.spawnPoint = point ? { x: point.x, y: point.y } : null;
    }
    
    /**
     * Check if a point has the spawn point
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} - True if this is the spawn point
     */
    isSpawnPoint(x, y) {
        return this.spawnPoint && this.spawnPoint.x === x && this.spawnPoint.y === y;
    }
} 