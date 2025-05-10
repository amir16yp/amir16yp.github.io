/**
 * Constants for the Potato Level Editor
 */

// Grid constants
const CELL_SIZE = 32;
const GRID_WIDTH = 32;
const GRID_HEIGHT = 32;
const INACTIVE_LAYER_ALPHA = 0.3;

// Key types
const KEY_NONE = 0;
const KEY_RED = 1;
const KEY_BLUE = 2;
const KEY_GREEN = 3;

// Texture category collections
const WALL_TEXTURE_IDS = [6, 7, 10, 11]; // Regular wall textures
const BANNER_WALL_IDS = [4, 8]; // Banner/flag walls
const FLOOR_TEXTURE_IDS = [9, 10, 12, 13]; // Floor textures

// Random level generation constants
const MIN_ROOM_SIZE = 3;
const MAX_ROOM_SIZE = 8;
const MIN_ROOMS = 8;
const MAX_ROOMS = 15;
const MAX_HALLWAY_LENGTH = 12;
const ENEMY_DENSITY = 0.1; // Enemies per room
const SECRET_ROOM_CHANCE = 0.4; // 40% chance to have a secret room
const TREASURE_CHANCE = 0.3; // 30% chance for a room to have treasure

// Edit modes enum
const EditMode = {
    DRAWING: 'DRAWING',
    ERASING: 'ERASING',
    PLACING_SPAWN: 'PLACING_SPAWN',
    PLACING_ENTITY: 'PLACING_ENTITY',
    PLACING_DOOR: 'PLACING_DOOR',
    FILLING: 'FILLING'
}; 