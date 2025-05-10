/**
 * Textures class for managing game textures
 */
class Textures {
    constructor(tilesetPath, tileWidth, tileHeight) {
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.tiles = new Map();
        this.tilesetPath = tilesetPath;
        this.tilesetImage = new Image();
        this.tilesetImage.src = tilesetPath;
        this.placeholderImage = null;
        this.tileCount = 0;

        // Wait for the tileset image to load before calculating tile count
        this.tilesetImage.onload = () => {
            const cols = Math.floor(this.tilesetImage.width / this.tileWidth);
            const rows = Math.floor(this.tilesetImage.height / this.tileHeight);
            this.tileCount = cols * rows;
            console.log(`Loaded tileset with ${this.tileCount} tiles`);

            // Create a temporary canvas for tile extraction
            this.canvas = document.createElement('canvas');
            this.canvas.width = this.tileWidth;
            this.canvas.height = this.tileHeight;
            this.ctx = this.canvas.getContext('2d');

            // Dispatch an event when textures are ready
            document.dispatchEvent(new CustomEvent('textures-loaded', { detail: this }));
        };

        this.tilesetImage.onerror = (e) => {
            console.error('Failed to load tileset image:', e);
            // Create placeholder tileset with one texture
            this.createPlaceholderTileset();
        };
    }

    /**
     * Get a tile image by ID
     * @param {number} id - The tile ID (1-based index)
     * @returns {HTMLCanvasElement} - Canvas element containing the tile image
     */
    getTile(id) {
        if (this.tiles.has(id)) {
            return this.tiles.get(id);
        }

        try {
            const tile = this.loadTile(id);
            this.tiles.set(id, tile);
            return tile;
        } catch (e) {
            console.warn(`Failed to load tile with ID ${id}:`, e);
            return this.createPlaceholderTile();
        }
    }

    /**
     * Extract a tile from the tileset
     * @param {number} id - The tile ID (1-based index)
     * @returns {HTMLCanvasElement} - Canvas element containing the tile image
     */
    loadTile(id) {
        // Make sure we have a context
        if (!this.ctx) {
            return this.createPlaceholderTile();
        }

        const cols = Math.floor(this.tilesetImage.width / this.tileWidth);
        const row = Math.floor((id - 1) / cols);
        const col = (id - 1) % cols;

        // Create a new canvas for this specific tile
        const tileCanvas = document.createElement('canvas');
        tileCanvas.width = this.tileWidth;
        tileCanvas.height = this.tileHeight;
        const tileCtx = tileCanvas.getContext('2d');

        // Clear the canvas
        tileCtx.clearRect(0, 0, this.tileWidth, this.tileHeight);

        // Draw the specific tile from the tileset onto the tile canvas
        tileCtx.drawImage(
            this.tilesetImage,
            col * this.tileWidth, row * this.tileHeight, this.tileWidth, this.tileHeight,
            0, 0, this.tileWidth, this.tileHeight
        );

        return tileCanvas;
    }

    /**
     * Create a placeholder tile
     * @returns {HTMLCanvasElement} - Canvas element containing a placeholder image
     */
    createPlaceholderTile() {
        if (this.placeholderImage) {
            return this.placeholderImage;
        }

        const placeholder = document.createElement('canvas');
        placeholder.width = this.tileWidth;
        placeholder.height = this.tileHeight;
        const ctx = placeholder.getContext('2d');

        // Fill with a magenta and black checkered pattern
        for (let y = 0; y < this.tileHeight; y++) {
            for (let x = 0; x < this.tileWidth; x++) {
                ctx.fillStyle = ((x + y) % 2 === 0) ? '#FF00FF' : '#000000';
                ctx.fillRect(x, y, 1, 1);
            }
        }

        this.placeholderImage = placeholder;
        return placeholder;
    }

    /**
     * Create a placeholder tileset for when the image fails to load
     */
    createPlaceholderTileset() {
        this.tileCount = 16; // Provide a default number of textures

        // Create and dispatch the loaded event so the app can proceed
        document.dispatchEvent(new CustomEvent('textures-loaded', { detail: this }));
    }

    /**
     * Get the width of a tile
     * @returns {number} - Tile width in pixels
     */
    getTileWidth() {
        return this.tileWidth;
    }

    /**
     * Get the height of a tile
     * @returns {number} - Tile height in pixels
     */
    getTileHeight() {
        return this.tileHeight;
    }

    /**
     * Get the total number of tiles in the tileset
     * @returns {number} - Number of tiles
     */
    getTileCount() {
        return this.tileCount;
    }
}

/**
 * DoorTextures class for handling door spritesheets
 */
class DoorTextures {
    constructor() {
        this.doorTextures = [
            {
                name: "Dirty Door",
                path: "textures/spritesheet dirty metal door.png",
                frameCount: 8,
                frames: []
            },
            {
                name: "Metal Door",
                path: "textures/spritesheet metal door.png",
                frameCount: 8,
                frames: []
            },
            {
                name: "Wood Door",
                path: "textures/spritesheet wood door.png",
                frameCount: 8,
                frames: []
            }
        ];
        
        this.frameWidth = 64;
        this.frameHeight = 64;
        this.loaded = false;
        
        // Load all door textures
        this.loadDoorTextures();
    }
    
    /**
     * Load all door textures from spritesheets
     */
    loadDoorTextures() {
        let loadedCount = 0;
        
        this.doorTextures.forEach((door, index) => {
            const img = new Image();
            img.src = door.path;
            
            img.onload = () => {
                // Extract the first frame for display in the editor
                const frameCanvas = document.createElement('canvas');
                frameCanvas.width = this.frameWidth;
                frameCanvas.height = this.frameHeight;
                const ctx = frameCanvas.getContext('2d');
                
                // Draw just the first frame (door closed)
                ctx.drawImage(
                    img,
                    0, 0, this.frameWidth, this.frameHeight, // Source
                    0, 0, this.frameWidth, this.frameHeight  // Destination
                );
                
                // Store the frame
                this.doorTextures[index].frames[0] = frameCanvas;
                
                // Store the original image for later use
                this.doorTextures[index].image = img;
                
                loadedCount++;
                if (loadedCount === this.doorTextures.length) {
                    this.loaded = true;
                    console.log("All door textures loaded");
                    
                    // Update door option images in the dialog
                    this.updateDoorDialog();
                    
                    // Dispatch event when door textures are loaded
                    document.dispatchEvent(new CustomEvent('door-textures-loaded'));
                }
            };
            
            img.onerror = () => {
                console.error(`Failed to load door texture: ${door.path}`);
                this.doorTextures[index].frames[0] = this.createPlaceholderDoor();
                
                loadedCount++;
                if (loadedCount === this.doorTextures.length) {
                    this.loaded = true;
                    console.log("Door textures loaded with placeholders");
                    
                    // Update door option images in the dialog
                    this.updateDoorDialog();
                    
                    // Dispatch event when door textures are loaded
                    document.dispatchEvent(new CustomEvent('door-textures-loaded'));
                }
            };
        });
    }
    
    /**
     * Update door dialog with the loaded door textures
     */
    updateDoorDialog() {
        const doorOptions = document.querySelectorAll('.door-option');
        
        doorOptions.forEach((option, index) => {
            if (index < this.doorTextures.length) {
                const img = option.querySelector('img');
                if (img && this.doorTextures[index].frames[0]) {
                    // Replace the image with the first frame canvas
                    const canvas = this.doorTextures[index].frames[0];
                    img.parentNode.replaceChild(canvas, img);
                    
                    // Make sure data attribute is preserved
                    canvas.dataset.textureId = String(index + 1);
                    canvas.alt = this.doorTextures[index].name;
                }
            }
        });
    }
    
    /**
     * Create a placeholder door texture
     * @returns {HTMLCanvasElement} - Canvas with placeholder door
     */
    createPlaceholderDoor() {
        const canvas = document.createElement('canvas');
        canvas.width = this.frameWidth;
        canvas.height = this.frameHeight;
        const ctx = canvas.getContext('2d');
        
        // Draw door placeholder (similar to the one in main.js)
        ctx.fillStyle = '#808080';
        ctx.fillRect(0, 0, this.frameWidth, this.frameHeight);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 5, this.frameWidth - 20, this.frameHeight - 10);
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(12, 7, this.frameWidth - 24, this.frameHeight - 14);
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(this.frameWidth - 16, this.frameHeight/2, 5, 0, Math.PI * 2);
        ctx.fill();
        
        return canvas;
    }
    
    /**
     * Get the first frame of a door texture by type
     * @param {number} doorType - The door type (1-3)
     * @returns {HTMLCanvasElement} - The door texture frame
     */
    getDoorTexture(doorType) {
        // Convert to zero-based index
        const index = doorType - 1;
        
        if (index >= 0 && index < this.doorTextures.length && this.doorTextures[index].frames[0]) {
            return this.doorTextures[index].frames[0];
        }
        
        return this.createPlaceholderDoor();
    }
} 