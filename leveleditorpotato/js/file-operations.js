/**
 * File operations for the Potato Level Editor
 */
class FileOperations {
    constructor(levelData) {
        this.levelData = levelData;
    }
    
    /**
     * Save the level to a JSON file
     */
    saveLevel() {
        // Create level content
        const levelContent = this.createLevelContent();
        
        // Create a blob from the content
        const blob = new Blob([levelContent], { type: 'text/plain' });
        
        // Create a link element, set the download attribute, and click it
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'level.json';
        a.click();
        
        // Clean up
        URL.revokeObjectURL(a.href);
    }
    
    /**
     * Save the level as a ZIP file
     */
    saveLevelAsZip() {
        // Check if JSZip is available
        if (typeof JSZip === 'undefined') {
            alert('JSZip library is required for ZIP operations.');
            return;
        }
        
        // Create a new ZIP file
        const zip = new JSZip();
        
        // Add level info file
        zip.file("level_info.csv", this.createLevelInfoCSV());
        
        // Add wall map file
        zip.file("wall_map.csv", this.createWallMapCSV(true));
        
        // Add floor map file
        zip.file("floor_map.csv", this.createWallMapCSV(false));
        
        // Add entities file
        zip.file("entities.csv", this.createEntitiesCSV());
        
        // Generate zip file and trigger download
        zip.generateAsync({ type: "blob" }).then(blob => {
            // Create a link element and trigger download
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'level.zip';
            a.click();
            
            // Clean up
            URL.revokeObjectURL(a.href);
        }).catch(err => {
            console.error('Error creating ZIP file:', err);
            alert('Error creating ZIP file: ' + err.message);
        });
    }
    
    /**
     * Create level info CSV content
     * @returns {string} CSV content
     */
    createLevelInfoCSV() {
        let content = "key,value\n";
        
        // Dimensions
        content += `width,${GRID_WIDTH}\n`;
        content += `height,${GRID_HEIGHT}\n`;
        
        // Texture IDs
        content += `floorTextureId,${this.levelData.floorTextureId || ""}\n`;
        content += `ceilingTextureId,${this.levelData.ceilingTextureId || ""}\n`;
        
        // Colors
        const floorColor = hexToRgb(this.levelData.floorColor);
        content += `floorColor,${floorColor.r},${floorColor.g},${floorColor.b}\n`;
        
        const ceilingColor = hexToRgb(this.levelData.ceilingColor);
        content += `ceilingColor,${ceilingColor.r},${ceilingColor.g},${ceilingColor.b}\n`;
        
        const fogColor = hexToRgb(this.levelData.fogColor);
        content += `fogColor,${fogColor.r},${fogColor.g},${fogColor.b}\n`;
        
        // Spawn point
        if (this.levelData.spawnPoint) {
            content += `spawnX,${this.levelData.spawnPoint.x}\n`;
            content += `spawnY,${this.levelData.spawnPoint.y}\n`;
        }
        
        return content;
    }
    
    /**
     * Create wall or floor map CSV content
     * @param {boolean} isWallMap - Whether to create wall map (true) or floor map (false)
     * @returns {string} CSV content
     */
    createWallMapCSV(isWallMap) {
        const map = isWallMap ? this.levelData.wallMap : this.levelData.floorMap;
        let content = "";
        
        for (let y = 0; y < map.length; y++) {
            const row = [];
            
            for (let x = 0; x < map[y].length; x++) {
                const wall = map[y][x];
                
                if (!wall) {
                    row.push("0"); // Empty cell
                } else if (wall instanceof Door) {
                    // Format: D|texture_id
                    row.push(`D|${wall.getType()}`);
                } else {
                    // Just a regular wall, save the texture ID
                    row.push(wall.getType());
                }
            }
            
            content += row.join(",") + "\n";
        }
        
        return content;
    }
    
    /**
     * Create entities CSV content
     * @returns {string} CSV content
     */
    createEntitiesCSV() {
        let content = "class,x,y,enemyType\n";
        
        for (const entity of this.levelData.entities) {
            if (entity.isEnemyEntity() && entity.getEnemyType() != null) {
                content += `${entity.getClassName()},${entity.getX()},${entity.getY()},${entity.getEnemyType()}\n`;
            } else {
                content += `${entity.getClassName()},${entity.getX()},${entity.getY()},\n`;
            }
        }
        
        return content;
    }
    
    /**
     * Create level content as a JSON string
     */
    createLevelContent() {
        // Convert wall and floor maps to serializable format
        const wallMapData = this.serializeMap(this.levelData.wallMap);
        const floorMapData = this.serializeMap(this.levelData.floorMap);
        
        // Create level data object
        const levelData = {
            width: GRID_WIDTH,
            height: GRID_HEIGHT,
            wallMap: wallMapData,
            floorMap: floorMapData,
            floorColor: this.levelData.floorColor,
            ceilingColor: this.levelData.ceilingColor,
            fogColor: this.levelData.fogColor,
            floorTextureId: this.levelData.floorTextureId,
            ceilingTextureId: this.levelData.ceilingTextureId,
            spawnPoint: this.levelData.spawnPoint,
            entities: this.levelData.entities.map(entity => ({
                className: entity.getClassName(),
                x: entity.getX(),
                y: entity.getY(),
                enemyType: entity.getEnemyType()
            }))
        };
        
        return JSON.stringify(levelData, null, 2);
    }
    
    /**
     * Serialize a map to a format that can be saved to a file
     * @param {Array} map - The map to serialize
     * @returns {Array} - Serialized map
     */
    serializeMap(map) {
        const serializedMap = [];
        
        for (let y = 0; y < map.length; y++) {
            const row = [];
            
            for (let x = 0; x < map[y].length; x++) {
                const wall = map[y][x];
                
                if (!wall) {
                    row.push(null);
                } else if (wall instanceof Door) {
                    row.push({
                        type: 'door',
                        textureId: wall.getType(),
                        keyType: wall.getKeyType(),
                        x: wall.getX(),
                        y: wall.getY()
                    });
                } else {
                    row.push({
                        type: 'wall',
                        textureId: wall.getType(),
                        x: wall.getX(),
                        y: wall.getY()
                    });
                }
            }
            
            serializedMap.push(row);
        }
        
        return serializedMap;
    }
    
    /**
     * Load a level from a file (JSON or ZIP)
     */
    loadLevel() {
        // Get the file input element
        const fileInput = document.getElementById('fileInput');
        
        // Set up file input change handler
        fileInput.onchange = (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            // Check file extension
            if (file.name.toLowerCase().endsWith('.zip')) {
                this.loadZipLevel(file);
            } else {
                // Assume JSON file
                this.loadJsonLevel(file);
            }
        };
        
        // Trigger file input click
        fileInput.click();
    }
    
    /**
     * Load a level from a JSON file
     * @param {File} file - The JSON file to load
     */
    loadJsonLevel(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const levelData = JSON.parse(e.target.result);
                this.applyLevelData(levelData);
                
                // Trigger a reload of the UI
                document.dispatchEvent(new CustomEvent('level-loaded'));
            } catch (error) {
                console.error('Error loading JSON level:', error);
                alert('Error loading JSON level: ' + error.message);
            }
        };
        
        reader.readAsText(file);
    }
    
    /**
     * Load a level from a ZIP file
     * @param {File} file - The ZIP file to load
     */
    loadZipLevel(file) {
        // Check if JSZip is available
        if (typeof JSZip === 'undefined') {
            alert('JSZip library is required for ZIP operations.');
            return;
        }
        
        JSZip.loadAsync(file).then(zip => {
            // Extract level info
            const levelInfoPromise = zip.file("level_info.csv") ? 
                zip.file("level_info.csv").async("string") : Promise.resolve(null);
            
            // Extract wall map
            const wallMapPromise = zip.file("wall_map.csv") ? 
                zip.file("wall_map.csv").async("string") : Promise.resolve(null);
            
            // Extract floor map
            const floorMapPromise = zip.file("floor_map.csv") ? 
                zip.file("floor_map.csv").async("string") : Promise.resolve(null);
            
            // Extract entities
            const entitiesPromise = zip.file("entities.csv") ? 
                zip.file("entities.csv").async("string") : Promise.resolve(null);
            
            // Process all extracted files
            Promise.all([levelInfoPromise, wallMapPromise, floorMapPromise, entitiesPromise])
                .then(([levelInfoData, wallMapData, floorMapData, entitiesData]) => {
                    // Clear current level
                    this.levelData.clear();
                    
                    // Parse and apply level info
                    if (levelInfoData) {
                        this.parseLevelInfoCSV(levelInfoData);
                    }
                    
                    // Parse and apply wall map
                    if (wallMapData) {
                        this.parseMapCSV(wallMapData, true);
                    }
                    
                    // Parse and apply floor map
                    if (floorMapData) {
                        this.parseMapCSV(floorMapData, false);
                    }
                    
                    // Parse and apply entities
                    if (entitiesData) {
                        this.parseEntitiesCSV(entitiesData);
                    }
                    
                    // Trigger a reload of the UI
                    document.dispatchEvent(new CustomEvent('level-loaded'));
                })
                .catch(error => {
                    console.error('Error processing ZIP files:', error);
                    alert('Error processing ZIP files: ' + error.message);
                });
        }).catch(error => {
            console.error('Error loading ZIP file:', error);
            alert('Error loading ZIP file: ' + error.message);
        });
    }
    
    /**
     * Parse level info from CSV data
     * @param {string} csvData - The level info CSV data
     */
    parseLevelInfoCSV(csvData) {
        // Skip header
        const lines = csvData.split('\n').slice(1);
        
        // Parse each line
        for (const line of lines) {
            if (!line.trim()) continue;
            
            const parts = line.split(',');
            if (parts.length < 2) continue;
            
            const key = parts[0];
            
            switch (key) {
                case 'floorTextureId':
                    this.levelData.floorTextureId = parts[1] ? parseInt(parts[1]) : null;
                    break;
                case 'ceilingTextureId':
                    this.levelData.ceilingTextureId = parts[1] ? parseInt(parts[1]) : null;
                    break;
                case 'floorColor':
                    if (parts.length >= 4) {
                        this.levelData.floorColor = rgbToHex(
                            parseInt(parts[1]),
                            parseInt(parts[2]),
                            parseInt(parts[3])
                        );
                    }
                    break;
                case 'ceilingColor':
                    if (parts.length >= 4) {
                        this.levelData.ceilingColor = rgbToHex(
                            parseInt(parts[1]),
                            parseInt(parts[2]),
                            parseInt(parts[3])
                        );
                    }
                    break;
                case 'fogColor':
                    if (parts.length >= 4) {
                        this.levelData.fogColor = rgbToHex(
                            parseInt(parts[1]),
                            parseInt(parts[2]),
                            parseInt(parts[3])
                        );
                    }
                    break;
                case 'spawnX':
                    if (!this.levelData.spawnPoint) {
                        this.levelData.spawnPoint = { x: 0, y: 0 };
                    }
                    this.levelData.spawnPoint.x = parseInt(parts[1]);
                    break;
                case 'spawnY':
                    if (!this.levelData.spawnPoint) {
                        this.levelData.spawnPoint = { x: 0, y: 0 };
                    }
                    this.levelData.spawnPoint.y = parseInt(parts[1]);
                    break;
            }
        }
    }
    
    /**
     * Parse map from CSV data
     * @param {string} csvData - The map CSV data
     * @param {boolean} isWallMap - Whether this is the wall map
     */
    parseMapCSV(csvData, isWallMap) {
        const lines = csvData.split('\n');
        const map = isWallMap ? this.levelData.wallMap : this.levelData.floorMap;
        
        for (let y = 0; y < Math.min(lines.length, GRID_HEIGHT); y++) {
            const line = lines[y].trim();
            if (!line) continue;
            
            const cells = line.split(',');
            
            for (let x = 0; x < Math.min(cells.length, GRID_WIDTH); x++) {
                const cell = cells[x];
                
                if (cell === '0') {
                    // Empty cell
                    map[y][x] = null;
                } else if (cell.startsWith('D|')) {
                    // Door: D|texture_id
                    const doorParts = cell.split('|');
                    if (doorParts.length >= 2) {
                        const textureId = parseInt(doorParts[1]);
                        // Create door with no key required by default
                        map[y][x] = new Door(KEY_NONE, x, y, textureId);
                    } else {
                        // Handle case where door is just marked with "D"
                        map[y][x] = new Door(KEY_NONE, x, y);
                    }
                } else {
                    try {
                        // Regular wall
                        const textureId = parseInt(cell);
                        map[y][x] = new Wall(textureId, x, y);
                    } catch (e) {
                        // If parse error, leave cell empty
                        console.warn(`Invalid cell value: ${cell} at position (${x},${y})`);
                        map[y][x] = null;
                    }
                }
            }
        }
    }
    
    /**
     * Parse entities from CSV data
     * @param {string} csvData - The entities CSV data
     */
    parseEntitiesCSV(csvData) {
        // Skip header
        const lines = csvData.split('\n').slice(1);
        
        for (const line of lines) {
            if (!line.trim()) continue;
            
            const parts = line.split(',');
            if (parts.length < 3) continue;
            
            const className = parts[0];
            const x = parseFloat(parts[1]);
            const y = parseFloat(parts[2]);
            
            // Check if this is an EnemyEntity with a type
            if (className === 'potato.entities.EnemyEntity' && parts.length >= 4 && parts[3]) {
                const enemyType = parts[3];
                this.levelData.addEntity(new EntityData(className, x, y, enemyType));
            } else {
                this.levelData.addEntity(new EntityData(className, x, y));
            }
        }
    }
    
    /**
     * Apply loaded level data to the current level
     * @param {Object} data - The level data to apply
     */
    applyLevelData(data) {
        // Clear current level
        this.levelData.clear();
        
        // Set properties
        this.levelData.floorColor = data.floorColor || '#646464';
        this.levelData.ceilingColor = data.ceilingColor || '#87CEFA';
        this.levelData.fogColor = data.fogColor || '#87CEFA';
        this.levelData.floorTextureId = data.floorTextureId || null;
        this.levelData.ceilingTextureId = data.ceilingTextureId || null;
        this.levelData.spawnPoint = data.spawnPoint || null;
        
        // Load wall map
        if (data.wallMap) {
            this.deserializeMap(data.wallMap, this.levelData.wallMap, true);
        }
        
        // Load floor map
        if (data.floorMap) {
            this.deserializeMap(data.floorMap, this.levelData.floorMap, false);
        }
        
        // Load entities
        if (data.entities && Array.isArray(data.entities)) {
            for (const entityData of data.entities) {
                this.levelData.addEntity(new EntityData(
                    entityData.className,
                    entityData.x,
                    entityData.y,
                    entityData.enemyType
                ));
            }
        }
    }
    
    /**
     * Deserialize a map from loaded data
     * @param {Array} serializedMap - The serialized map data
     * @param {Array} targetMap - The target map to populate
     * @param {boolean} isWallMap - Whether this is the wall map
     */
    deserializeMap(serializedMap, targetMap, isWallMap) {
        for (let y = 0; y < Math.min(serializedMap.length, GRID_HEIGHT); y++) {
            const row = serializedMap[y];
            
            for (let x = 0; x < Math.min(row.length, GRID_WIDTH); x++) {
                const cell = row[x];
                
                if (!cell) {
                    targetMap[y][x] = null;
                } else if (cell.type === 'door' && isWallMap) {
                    targetMap[y][x] = new Door(
                        cell.keyType || KEY_NONE,
                        x,
                        y,
                        cell.textureId
                    );
                } else if (cell.type === 'wall' || (cell.type === 'door' && !isWallMap)) {
                    targetMap[y][x] = new Wall(
                        cell.textureId,
                        x,
                        y
                    );
                }
            }
        }
    }
    
    /**
     * Generate a new empty level
     */
    newLevel() {
        return confirmDialog("Create new level? This will clear the current level.").then(result => {
            if (result) {
                this.levelData.clear();
                document.dispatchEvent(new CustomEvent('level-loaded'));
                return true;
            }
            return false;
        });
    }
} 