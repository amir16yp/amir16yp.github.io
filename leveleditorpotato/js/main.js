/**
 * Main entry point for the Potato Level Editor
 */
// Store UI in a global variable for access from other functions
let editorUI = null;
// Store door textures globally
let doorTextures = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Potato Level Editor - Initializing...');
    console.log('Feature: Doors can be placed anywhere on the wall layer');
    
    // Create placeholder textures to display before the actual textures load
    createPlaceholderTextures();
    
    // Initialize door textures
    doorTextures = new DoorTextures();
    
    // Load textures
    const textures = new Textures('textures/tileset.png', 64, 64); // 64x64 is the texture size, not 32x32 like in the cell size
    
    // Create level data
    const levelData = new LevelData();
    
    // Create file operations handler
    const fileOps = new FileOperations(levelData);
    
    // Set up event listeners for when textures are loaded
    document.addEventListener('textures-loaded', function(e) {
        console.log('Textures loaded, initializing UI...');
        initializeUI(e.detail, levelData, fileOps);
    });
    
    // Set up level loaded event handler
    document.addEventListener('level-loaded', function() {
        console.log('Level loaded, updating UI...');
        // Use the existing UI reference
        updateUI(textures, levelData);
        
        // Force a render of the UI
        if (editorUI) {
            editorUI.render();
            editorUI.updateStatusBar();
        }
    });
});

/**
 * Initialize the UI
 * @param {Textures} textures - The textures object
 * @param {LevelData} levelData - The level data object
 * @param {FileOperations} fileOps - The file operations object
 */
function initializeUI(textures, levelData, fileOps) {
    // Create the editor UI
    editorUI = new EditorUI(levelData, textures);
    
    // Ensure wall layer is selected by default
    const wallLayerBtn = document.getElementById('wallLayerBtn');
    const floorLayerBtn = document.getElementById('floorLayerBtn');
    
    if (wallLayerBtn && floorLayerBtn) {
        wallLayerBtn.classList.add('active');
        floorLayerBtn.classList.remove('active');
    }
    
    // Set up button event handlers
    
    // New level button
    document.getElementById('newBtn').addEventListener('click', () => {
        fileOps.newLevel();
    });
    
    // Open level button
    document.getElementById('openBtn').addEventListener('click', () => {
        fileOps.loadLevel();
    });
    
    // Save level button
    document.getElementById('saveBtn').addEventListener('click', () => {
        fileOps.saveLevel();
    });
    
    // Save as ZIP button
    document.getElementById('saveZipBtn').addEventListener('click', () => {
        fileOps.saveLevelAsZip();
    });
    
    // Hide the Wolfenstein level button since we're not implementing it
    const wolfensteinBtn = document.getElementById('wolfensteinBtn');
    if (wolfensteinBtn) {
        wolfensteinBtn.style.display = 'none';
    }
    
    console.log('UI initialized');
}

/**
 * Update the UI when a level is loaded
 * @param {Textures} textures - The textures object
 * @param {LevelData} levelData - The level data object
 */
function updateUI(textures, levelData) {
    // Instead of creating a new UI which resets modes and tool states,
    // find the existing UI and update it
    // When a new UI is created, it resets all tools to the default state
    console.log('Updating UI for loaded level - without recreating the UI');
    
    // Force a re-render of the existing UI
    const canvas = document.getElementById('gridCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    // Reload property values
    const floorTextureCombo = document.getElementById('floorTextureCombo');
    const ceilingTextureCombo = document.getElementById('ceilingTextureCombo');
    
    if (floorTextureCombo && levelData.floorTextureId) {
        floorTextureCombo.value = levelData.floorTextureId;
    }
    
    if (ceilingTextureCombo && levelData.ceilingTextureId) {
        ceilingTextureCombo.value = levelData.ceilingTextureId;
    }
    
    // Update color buttons
    const floorColorBtn = document.getElementById('floorColorBtn');
    const ceilingColorBtn = document.getElementById('ceilingColorBtn');
    const fogColorBtn = document.getElementById('fogColorBtn');
    
    if (floorColorBtn) floorColorBtn.style.backgroundColor = levelData.floorColor;
    if (ceilingColorBtn) ceilingColorBtn.style.backgroundColor = levelData.ceilingColor;
    if (fogColorBtn) fogColorBtn.style.backgroundColor = levelData.fogColor;
}

/**
 * Create placeholder textures while waiting for the actual textures to load
 */
function createPlaceholderTextures() {
    // Placeholder for door textures
    const doorImages = document.querySelectorAll('.door-option img');
    doorImages.forEach(img => {
        // If there's an error loading the image, create a placeholder
        img.onerror = function() {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            
            // Draw door placeholder
            ctx.fillStyle = '#808080';
            ctx.fillRect(0, 0, 64, 64);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.strokeRect(10, 5, 44, 54);
            ctx.fillStyle = '#A0522D';
            ctx.fillRect(12, 7, 40, 50);
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(48, 32, 5, 0, Math.PI * 2);
            ctx.fill();
            
            // Replace the img with the canvas
            this.parentNode.replaceChild(canvas, this);
        };
    });
} 