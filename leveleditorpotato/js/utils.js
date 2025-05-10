/**
 * Utility functions for the Potato Level Editor
 */

/**
 * Convert a hex color string to RGB components
 * @param {string} hex - Hex color string (#RRGGBB)
 * @returns {Object} - Object with r, g, b properties
 */
function hexToRgb(hex) {
    // Remove the hash if it exists
    hex = hex.replace(/^#/, '');
    
    // Parse the hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return { r, g, b };
}

/**
 * Convert RGB components to a hex color string
 * @param {number} r - Red component (0-255)
 * @param {number} g - Green component (0-255)
 * @param {number} b - Blue component (0-255)
 * @returns {string} - Hex color string (#RRGGBB)
 */
function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

/**
 * Get the door color based on key type
 * @param {number} keyType - Key type constant (KEY_NONE, KEY_RED, etc.)
 * @returns {string} - Hex color string
 */
function getDoorColor(keyType) {
    switch (keyType) {
        case KEY_NONE:
            return '#969696'; // Gray
        case KEY_RED:
            return '#C83232'; // Red
        case KEY_BLUE:
            return '#3232C8'; // Blue
        case KEY_GREEN:
            return '#32C832'; // Green
        default:
            return '#969696'; // Default gray
    }
}

/**
 * Convert a grid position to canvas position
 * @param {number} gridX - Grid X coordinate
 * @param {number} gridY - Grid Y coordinate
 * @returns {Object} - Object with x and y properties for canvas position
 */
function gridToCanvas(gridX, gridY) {
    return {
        x: gridX * CELL_SIZE,
        y: gridY * CELL_SIZE
    };
}

/**
 * Convert a canvas position to grid position
 * @param {number} canvasX - Canvas X coordinate
 * @param {number} canvasY - Canvas Y coordinate
 * @returns {Object} - Object with x and y properties for grid position
 */
function canvasToGrid(canvasX, canvasY) {
    return {
        x: Math.floor(canvasX / CELL_SIZE),
        y: Math.floor(canvasY / CELL_SIZE)
    };
}

/**
 * Check if a grid position is within the bounds of the grid
 * @param {number} x - Grid X coordinate
 * @param {number} y - Grid Y coordinate
 * @returns {boolean} - True if the position is within bounds
 */
function isValidGridPosition(x, y) {
    return x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT;
}

/**
 * Generate a random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Random integer
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random RGB color
 * @returns {string} - Hex color string
 */
function randomColor() {
    const r = randomInt(0, 255);
    const g = randomInt(0, 255);
    const b = randomInt(0, 255);
    return rgbToHex(r, g, b);
}

/**
 * Show a confirmation dialog
 * @param {string} message - The message to show
 * @returns {Promise<boolean>} - Promise that resolves to true if confirmed
 */
function confirmDialog(message) {
    return new Promise(resolve => {
        resolve(window.confirm(message));
    });
} 