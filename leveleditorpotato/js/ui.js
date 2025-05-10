/**
 * UI management for the Potato Level Editor
 */
class EditorUI {
    constructor(levelData, textures) {
        this.levelData = levelData;
        this.textures = textures;
        
        // Canvas and context
        this.canvas = document.getElementById('gridCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set up canvas size
        this.resizeCanvas();
        
        // Editor state
        this.selectedTextureId = 1;
        this.editingWalls = true; // true for walls, false for floor - Set wall layer as default
        this.currentMode = EditMode.DRAWING;
        this.lastDragPoint = null;
        
        // Store active tool button for reference
        this.activeToolButton = null;
        
        // Initialize color buttons with default colors
        this.initColorButtons();
        
        // Initialize texture selection panel
        this.initTexturePanel();
        
        // Initialize layer toggle buttons - ensure correct buttons are active
        this.initLayerButtons();
        
        // Initialize tool buttons
        this.initToolButtons();
        
        // Initialize property combos
        this.initPropertyCombos();
        
        // Set up canvas event listeners
        this.setupCanvasListeners();
        
        // Update status bar
        this.updateStatusBar();
        
        // Set up window resize listener
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    /**
     * Resize the canvas to fill the container
     */
    resizeCanvas() {
        // Set canvas size to fill the grid container or show the whole grid, whichever is larger
        const container = document.querySelector('.grid-container');
        const requiredWidth = GRID_WIDTH * CELL_SIZE;
        const requiredHeight = GRID_HEIGHT * CELL_SIZE;
        
        this.canvas.width = Math.max(container.clientWidth, requiredWidth);
        this.canvas.height = Math.max(container.clientHeight, requiredHeight);
        
        this.render();
    }
    
    /**
     * Initialize color buttons and their event handlers
     */
    initColorButtons() {
        // Floor color button
        const floorColorBtn = document.getElementById('floorColorBtn');
        floorColorBtn.style.backgroundColor = this.levelData.floorColor;
        floorColorBtn.addEventListener('click', () => this.openColorPicker('floor'));
        
        // Ceiling color button
        const ceilingColorBtn = document.getElementById('ceilingColorBtn');
        ceilingColorBtn.style.backgroundColor = this.levelData.ceilingColor;
        ceilingColorBtn.addEventListener('click', () => this.openColorPicker('ceiling'));
        
        // Fog color button
        const fogColorBtn = document.getElementById('fogColorBtn');
        fogColorBtn.style.backgroundColor = this.levelData.fogColor;
        fogColorBtn.addEventListener('click', () => this.openColorPicker('fog'));
        
        // Color picker dialog
        const colorDialog = document.getElementById('colorPickerDialog');
        const colorPicker = document.getElementById('colorPicker');
        const confirmBtn = document.getElementById('confirmColorBtn');
        const cancelBtn = document.getElementById('cancelColorBtn');
        
        let currentColorTarget = null;
        
        // Setting up color picker dialog
        confirmBtn.addEventListener('click', () => {
            const newColor = colorPicker.value;
            if (currentColorTarget === 'floor') {
                this.levelData.floorColor = newColor;
                floorColorBtn.style.backgroundColor = newColor;
            } else if (currentColorTarget === 'ceiling') {
                this.levelData.ceilingColor = newColor;
                ceilingColorBtn.style.backgroundColor = newColor;
            } else if (currentColorTarget === 'fog') {
                this.levelData.fogColor = newColor;
                fogColorBtn.style.backgroundColor = newColor;
            }
            colorDialog.close();
        });
        
        cancelBtn.addEventListener('click', () => {
            colorDialog.close();
        });
        
        // Function to open color picker for different targets
        this.openColorPicker = (target) => {
            currentColorTarget = target;
            let currentColor = '#646464'; // Default
            
            if (target === 'floor') {
                currentColor = this.levelData.floorColor;
            } else if (target === 'ceiling') {
                currentColor = this.levelData.ceilingColor;
            } else if (target === 'fog') {
                currentColor = this.levelData.fogColor;
            }
            
            colorPicker.value = currentColor;
            colorDialog.showModal();
        };
    }
    
    /**
     * Initialize texture selection panel
     */
    initTexturePanel() {
        const texturePanel = document.getElementById('texturePanel');
        
        // Clear panel
        texturePanel.innerHTML = '';
        
        // Add texture tiles
        for (let i = 1; i <= this.textures.getTileCount(); i++) {
            const textureId = i;
            
            // Create a div for this texture
            const tileDiv = document.createElement('div');
            tileDiv.className = 'texture-item';
            if (textureId === this.selectedTextureId) {
                tileDiv.classList.add('selected');
            }
            
            // Add the texture image
            const tileCanvas = this.textures.getTile(textureId);
            tileDiv.appendChild(tileCanvas);
            
            // Add click handler
            tileDiv.addEventListener('click', () => {
                // Just change the texture, don't touch the mode
                this.selectedTextureId = textureId;
                
                // Check active buttons for debugging
                const activeButtons = document.querySelectorAll('.toggle-btn.active:not(#wallLayerBtn):not(#floorLayerBtn)');
                console.log(`Active tool buttons after texture selection: ${activeButtons.length}`);
                activeButtons.forEach(btn => {
                    console.log(`- Active button: ${btn.id}`);
                });
                console.log(`Current mode after texture selection: ${this.currentMode}`);
                
                // Update selected class
                document.querySelectorAll('.texture-item').forEach(item => {
                    item.classList.remove('selected');
                });
                tileDiv.classList.add('selected');
                
                this.updateStatusBar();
            });
            
            texturePanel.appendChild(tileDiv);
        }
    }
    
    /**
     * Initialize layer toggle buttons
     */
    initLayerButtons() {
        const wallLayerBtn = document.getElementById('wallLayerBtn');
        const floorLayerBtn = document.getElementById('floorLayerBtn');
        
        // Ensure the correct button has the active class on startup
        wallLayerBtn.classList.add('active');
        floorLayerBtn.classList.remove('active');
        
        wallLayerBtn.addEventListener('click', () => {
            if (!this.editingWalls) {
                this.editingWalls = true;
                wallLayerBtn.classList.add('active');
                floorLayerBtn.classList.remove('active');
                this.render();
                this.updateStatusBar();
            }
        });
        
        floorLayerBtn.addEventListener('click', () => {
            if (this.editingWalls) {
                this.editingWalls = false;
                floorLayerBtn.classList.add('active');
                wallLayerBtn.classList.remove('active');
                this.render();
                this.updateStatusBar();
            }
        });
    }
    
    /**
     * Initialize tool buttons
     */
    initToolButtons() {
        // Log all button IDs for debugging
        console.log("Initializing tool buttons...");
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            console.log(`Found button with ID: ${btn.id}`);
        });
        
        // Set up toggle buttons with individual event handlers to avoid issues
        const eraseBtn = document.getElementById('eraseBtn');
        const fillBtn = document.getElementById('fillBtn');
        const spawnBtn = document.getElementById('spawnBtn');
        const entityBtn = document.getElementById('entityBtn');
        const doorBtn = document.getElementById('doorBtn');
        
        // Create an array of all tool buttons for easier management
        const toolButtons = [eraseBtn, fillBtn, spawnBtn, entityBtn, doorBtn].filter(btn => btn !== null);
        
        // Function to activate a specific tool button
        const activateTool = (button, mode) => {
            // Deactivate all tool buttons first
            toolButtons.forEach(btn => {
                if (btn !== button) {
                    btn.classList.remove('active');
                }
            });
            
            // Toggle the clicked button
            if (button.classList.contains('active')) {
                // If already active, deactivate and return to drawing mode
                button.classList.remove('active');
                this.currentMode = EditMode.DRAWING;
                console.log(`Tool deactivated, switched to drawing mode`);
            } else {
                // Activate the button and set mode
                button.classList.add('active');
                this.currentMode = mode;
                console.log(`Activated tool: ${button.id}, mode: ${mode}`);
            }
            
            this.updateStatusBar();
        };
        
        // Add click handlers for each tool button
        if (eraseBtn) {
            eraseBtn.addEventListener('click', () => activateTool(eraseBtn, EditMode.ERASING));
        }
        
        if (fillBtn) {
            fillBtn.addEventListener('click', () => activateTool(fillBtn, EditMode.FILLING));
        }
        
        if (spawnBtn) {
            spawnBtn.addEventListener('click', () => activateTool(spawnBtn, EditMode.PLACING_SPAWN));
        }
        
        if (entityBtn) {
            entityBtn.addEventListener('click', () => activateTool(entityBtn, EditMode.PLACING_ENTITY));
        }
        
        if (doorBtn) {
            doorBtn.addEventListener('click', () => activateTool(doorBtn, EditMode.PLACING_DOOR));
        }
        
        // Door texture dialog setup
        const doorDialog = document.getElementById('doorTextureDialog');
        const doorOptions = document.querySelectorAll('.door-option');
        const confirmDoorBtn = document.getElementById('confirmDoorBtn');
        const cancelDoorBtn = document.getElementById('cancelDoorBtn');
        
        let selectedDoorTextureId = 1;
        let doorCallback = null;
        
        // Set up door selection
        doorOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remove selected class from all options
                doorOptions.forEach(o => o.classList.remove('selected'));
                
                // Add selected class to clicked option
                option.classList.add('selected');
                
                // Get selected texture ID
                selectedDoorTextureId = parseInt(option.querySelector('img').dataset.textureId);
            });
        });
        
        confirmDoorBtn.addEventListener('click', () => {
            doorDialog.close();
            if (doorCallback) {
                doorCallback(selectedDoorTextureId);
            }
        });
        
        cancelDoorBtn.addEventListener('click', () => {
            doorDialog.close();
            if (doorCallback) {
                doorCallback(null);
            }
        });
        
        // Function to open door texture dialog
        this.openDoorTextureDialog = (callback) => {
            doorCallback = callback;
            
            // Reset selection
            doorOptions.forEach(o => o.classList.remove('selected'));
            doorOptions[0].classList.add('selected');
            selectedDoorTextureId = 1;
            
            doorDialog.showModal();
        };
    }
    
    /**
     * Initialize property comboboxes
     */
    initPropertyCombos() {
        // Floor texture combo
        const floorTextureCombo = document.getElementById('floorTextureCombo');
        
        // Clear combo
        floorTextureCombo.innerHTML = '<option value="">None</option>';
        
        // Add texture options
        for (let i = 1; i <= this.textures.getTileCount(); i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Texture ${i}`;
            floorTextureCombo.appendChild(option);
        }
        
        // Set current value
        if (this.levelData.floorTextureId) {
            floorTextureCombo.value = this.levelData.floorTextureId;
        }
        
        // Add change listener
        floorTextureCombo.addEventListener('change', () => {
            this.levelData.floorTextureId = floorTextureCombo.value ? parseInt(floorTextureCombo.value) : null;
        });
        
        // Ceiling texture combo
        const ceilingTextureCombo = document.getElementById('ceilingTextureCombo');
        
        // Clear combo
        ceilingTextureCombo.innerHTML = '<option value="">None</option>';
        
        // Add texture options
        for (let i = 1; i <= this.textures.getTileCount(); i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Texture ${i}`;
            ceilingTextureCombo.appendChild(option);
        }
        
        // Set current value
        if (this.levelData.ceilingTextureId) {
            ceilingTextureCombo.value = this.levelData.ceilingTextureId;
        }
        
        // Add change listener
        ceilingTextureCombo.addEventListener('change', () => {
            this.levelData.ceilingTextureId = ceilingTextureCombo.value ? parseInt(ceilingTextureCombo.value) : null;
        });
    }
    
    /**
     * Set up canvas event listeners
     */
    setupCanvasListeners() {
        this.canvas.addEventListener('mousedown', (e) => {
            // Handle grid click at mouse position
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            this.handleGridClick(mouseX, mouseY);
            
            // Save last drag point
            this.lastDragPoint = { x: mouseX, y: mouseY };
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            // Update status bar with current position
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const gridPoint = canvasToGrid(mouseX, mouseY);
            this.updateStatusBar(gridPoint);
            
            // Handle dragging
            if (this.lastDragPoint) {
                this.handleGridClick(mouseX, mouseY);
                this.lastDragPoint = { x: mouseX, y: mouseY };
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.lastDragPoint = null;
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.lastDragPoint = null;
        });
    }
    
    /**
     * Handle a click on the grid
     * @param {number} canvasX - Canvas X coordinate
     * @param {number} canvasY - Canvas Y coordinate
     */
    handleGridClick(canvasX, canvasY) {
        const gridPoint = canvasToGrid(canvasX, canvasY);
        const gridX = gridPoint.x;
        const gridY = gridPoint.y;
        
        // Check if the click is within the grid
        if (!isValidGridPosition(gridX, gridY)) {
            return;
        }
        
        switch (this.currentMode) {
            case EditMode.PLACING_DOOR:
                if (this.editingWalls) {
                    // Check if there's already a door here
                    const existingWall = this.levelData.getWallAt(gridX, gridY, true);
                    if (existingWall instanceof Door) {
                        alert("There is already a door at this location");
                        return;
                    }
                    
                    // Show door texture picker - Doors can be placed anywhere now
                    this.openDoorTextureDialog((textureId) => {
                        if (textureId !== null) {
                            // Create door with selected texture
                            const door = new Door(KEY_NONE, gridX, gridY, textureId);
                            this.levelData.setWallAt(gridX, gridY, door, true);
                            
                            // Don't reset the door mode - keep it active
                            this.render();
                            this.updateStatusBar();
                        }
                    });
                } else {
                    alert("Doors can only be placed in the wall layer");
                }
                break;
                
            case EditMode.PLACING_ENTITY:
                const entitySelect = document.getElementById('entityTypeSelect');
                const selectedEntity = entitySelect.value;
                
                if (selectedEntity) {
                    if (selectedEntity.startsWith('potato.entities.EnemyEntity:')) {
                        // Extract enemy type from the string
                        const enemyType = selectedEntity.split(':')[1];
                        // Create EntityData with enemy type
                        this.levelData.addEntity(new EntityData("potato.entities.EnemyEntity", gridX + 0.5, gridY + 0.5, enemyType));
                    } else {
                        this.levelData.addEntity(new EntityData(selectedEntity, gridX + 0.5, gridY + 0.5));
                    }
                    
                    // Don't reset entity mode - keep it active
                    this.render();
                }
                break;
                
            case EditMode.PLACING_SPAWN:
                this.levelData.setSpawnPoint({ x: gridX, y: gridY });
                // Don't reset spawn mode - keep it active
                this.render();
                break;
                
            case EditMode.ERASING:
                // Remove wall/floor
                this.levelData.setWallAt(gridX, gridY, null, this.editingWalls);
                
                // Also remove entities or spawn at this location
                this.levelData.removeEntitiesAt(gridX, gridY);
                if (this.levelData.isSpawnPoint(gridX, gridY)) {
                    this.levelData.setSpawnPoint(null);
                }
                
                this.render();
                break;
                
            case EditMode.FILLING:
                // Get the target type
                const targetWall = this.levelData.getWallAt(gridX, gridY, this.editingWalls);
                const targetType = targetWall ? targetWall.getType() : null;
                
                // Don't fill if target already has the selected texture
                if (targetType !== null && targetType === this.selectedTextureId) {
                    return;
                }
                
                // Perform flood fill
                this.floodFill(gridX, gridY, targetType);
                this.render();
                break;
                
            case EditMode.DRAWING:
                // Set wall/floor with selected texture
                this.levelData.setWallAt(
                    gridX, 
                    gridY, 
                    new Wall(this.selectedTextureId, gridX, gridY), 
                    this.editingWalls
                );
                this.render();
                break;
        }
        
        this.updateStatusBar();
    }
    
    /**
     * Perform flood fill starting from a position
     * @param {number} startX - Starting X coordinate
     * @param {number} startY - Starting Y coordinate
     * @param {number|null} targetType - Type to replace (null for empty cells)
     */
    floodFill(startX, startY, targetType) {
        // Create a visited array
        const visited = Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(false));
        
        // Recursive flood fill function
        const fill = (x, y) => {
            // Check bounds
            if (!isValidGridPosition(x, y)) {
                return;
            }
            
            // Check if already visited
            if (visited[y][x]) {
                return;
            }
            
            // Mark as visited
            visited[y][x] = true;
            
            // Get current wall
            const currentWall = this.levelData.getWallAt(x, y, this.editingWalls);
            const currentType = currentWall ? currentWall.getType() : null;
            
            // Check if this cell matches the target type
            if ((targetType === null && currentType !== null) || 
                (targetType !== null && currentType !== targetType)) {
                return;
            }
            
            // Fill this cell
            this.levelData.setWallAt(
                x, 
                y, 
                new Wall(this.selectedTextureId, x, y), 
                this.editingWalls
            );
            
            // Recursively fill neighbors (4-way connectivity)
            fill(x + 1, y);
            fill(x - 1, y);
            fill(x, y + 1);
            fill(x, y - 1);
        };
        
        // Start the flood fill
        fill(startX, startY);
    }
    
    /**
     * Update the status bar with current information
     * @param {Object} gridPoint - Current grid point (optional)
     */
    updateStatusBar(gridPoint) {
        // Use last drag point if no gridPoint provided
        if (!gridPoint && this.lastDragPoint) {
            gridPoint = canvasToGrid(this.lastDragPoint.x, this.lastDragPoint.y);
        }
        
        const gridX = gridPoint ? gridPoint.x : 0;
        const gridY = gridPoint ? gridPoint.y : 0;
        
        const layer = this.editingWalls ? "Wall Layer" : "Floor Layer";
        const mode = this.currentMode;
        console.log(`Current mode in updateStatusBar: ${mode}`);
        
        const spawnStatus = this.levelData.spawnPoint
            ? `Spawn: (${this.levelData.spawnPoint.x}, ${this.levelData.spawnPoint.y})`
            : "No spawn set";
            
        const entityCount = `Entities: ${this.levelData.entities.length}`;
        
        document.getElementById('statusBar').textContent = 
            `Position: ${gridX}, ${gridY} | Layer: ${layer} | Selected Texture: ${this.selectedTextureId} | Mode: ${mode} | ${spawnStatus} | ${entityCount}`;
    }
    
    /**
     * Render the level editor
     */
    render() {
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw the grid
        this.drawGrid();
        
        // Draw the inactive layer with transparency
        const inactiveMap = this.editingWalls ? this.levelData.floorMap : this.levelData.wallMap;
        this.ctx.globalAlpha = INACTIVE_LAYER_ALPHA;
        this.drawLayer(inactiveMap, false);
        
        // Draw the active layer at full opacity
        const activeMap = this.editingWalls ? this.levelData.wallMap : this.levelData.floorMap;
        this.ctx.globalAlpha = 1.0;
        this.drawLayer(activeMap, true);
        
        // Draw entities and spawn point at full opacity
        this.drawEntitiesAndSpawn();
    }
    
    /**
     * Draw the grid lines
     */
    drawGrid() {
        this.ctx.strokeStyle = "#CCCCCC";
        this.ctx.lineWidth = 1;
        
        // Draw vertical lines
        for (let x = 0; x <= GRID_WIDTH; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * CELL_SIZE, 0);
            this.ctx.lineTo(x * CELL_SIZE, GRID_HEIGHT * CELL_SIZE);
            this.ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let y = 0; y <= GRID_HEIGHT; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * CELL_SIZE);
            this.ctx.lineTo(GRID_WIDTH * CELL_SIZE, y * CELL_SIZE);
            this.ctx.stroke();
        }
    }
    
    /**
     * Draw a layer (wall or floor)
     * @param {Array} layer - The layer to draw
     * @param {boolean} isActive - Whether this is the active layer
     */
    drawLayer(layer, isActive) {
        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                const wall = layer[y][x];
                
                if (!wall) continue;
                
                const cellX = x * CELL_SIZE;
                const cellY = y * CELL_SIZE;
                
                if (wall instanceof Door) {
                    // Draw door with key type indicator
                    const door = wall;
                    this.ctx.fillStyle = getDoorColor(door.getKeyType());
                    this.ctx.fillRect(cellX + 1, cellY + 1, CELL_SIZE - 2, CELL_SIZE - 2);
                    
                    // Draw door texture if this is the active layer
                    if (isActive) {
                        // Use the door texture from the door type
                        if (doorTextures && doorTextures.loaded) {
                            const doorTexture = doorTextures.getDoorTexture(door.getType());
                            this.ctx.drawImage(doorTexture, cellX, cellY, CELL_SIZE, CELL_SIZE);
                        } else {
                            // Fallback to regular texture if door textures not loaded
                            const texture = this.textures.getTile(door.getType());
                            this.ctx.drawImage(texture, cellX, cellY, CELL_SIZE, CELL_SIZE);
                        }
                    }
                    
                    // Draw door symbol
                    this.ctx.fillStyle = "#FFFFFF";
                    this.ctx.font = "bold 12px Arial";
                    this.ctx.fillText("D", cellX + CELL_SIZE/2 - 4, cellY + CELL_SIZE/2 + 4);
                } else {
                    // Draw regular wall or floor
                    if (isActive) {
                        const texture = this.textures.getTile(wall.getType());
                        this.ctx.drawImage(texture, cellX, cellY, CELL_SIZE, CELL_SIZE);
                    } else {
                        this.ctx.fillStyle = "rgba(100, 100, 100, 0.5)";
                        this.ctx.fillRect(cellX + 1, cellY + 1, CELL_SIZE - 2, CELL_SIZE - 2);
                    }
                }
            }
        }
    }
    
    /**
     * Draw entities and spawn point
     */
    drawEntitiesAndSpawn() {
        // Draw spawn point
        if (this.levelData.spawnPoint) {
            const cellX = this.levelData.spawnPoint.x * CELL_SIZE;
            const cellY = this.levelData.spawnPoint.y * CELL_SIZE;
            
            const margin = CELL_SIZE / 4;
            
            // Green circle
            this.ctx.fillStyle = "#00FF00";
            this.ctx.beginPath();
            this.ctx.arc(
                cellX + CELL_SIZE/2, 
                cellY + CELL_SIZE/2, 
                CELL_SIZE/2 - margin, 
                0, 
                Math.PI * 2
            );
            this.ctx.fill();
            
            // Black outline
            this.ctx.strokeStyle = "#000000";
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(
                cellX + CELL_SIZE/2, 
                cellY + CELL_SIZE/2, 
                CELL_SIZE/2 - margin, 
                0, 
                Math.PI * 2
            );
            this.ctx.stroke();
        }
        
        // Draw entities
        for (const entity of this.levelData.entities) {
            const gridX = Math.floor(entity.getX());
            const gridY = Math.floor(entity.getY());
            
            const x = gridX * CELL_SIZE;
            const y = gridY * CELL_SIZE;
            const size = CELL_SIZE / 2;
            
            // Draw entity circle
            this.ctx.fillStyle = "#FF0000";
            this.ctx.beginPath();
            this.ctx.arc(
                x + CELL_SIZE/2, 
                y + CELL_SIZE/2, 
                size/2, 
                0, 
                Math.PI * 2
            );
            this.ctx.fill();
            
            // Draw entity type label
            const shortName = entity.getClassName().substring(
                entity.getClassName().lastIndexOf('.') + 1
            );
            
            const displayName = entity.getEnemyType() 
                ? `${shortName}:${entity.getEnemyType()}`
                : shortName;
                
            // Draw entity name
            this.ctx.fillStyle = "#000000";
            this.ctx.font = "10px Arial";
            this.ctx.fillText(
                displayName, 
                x, 
                y + CELL_SIZE + 12
            );
            
            // Draw coordinates for debugging
            this.ctx.fillStyle = "#0000FF";
            this.ctx.fillText(
                `(${entity.getX().toFixed(1)},${entity.getY().toFixed(1)})`,
                x,
                y + CELL_SIZE + 24
            );
        }
    }
} 