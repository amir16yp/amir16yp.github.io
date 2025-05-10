# Potato Level Editor

A web-based level editor for creating and editing levels for Potato first-person shooter games.

## Features

- Create and edit grid-based levels with walls and floors
- Place entities and spawn points
- Add doors with different textures (can be placed anywhere in the wall layer)
- Save and load levels in both JSON and ZIP formats
- Fill tool for quick level creation
- Visual texture selection
- Color customization for floors, ceilings, and fog

## Usage

1. Open `index.html` in a modern web browser
2. Use the toolbar buttons to select edit mode:
   - Wall/Floor Layer: Toggle between editing walls or floors
   - Erase: Remove walls, floors, entities, or spawn points
   - Fill: Fill connected areas with the selected texture
   - Place Spawn: Set the player spawn point
   - Place Entity: Add enemy entities
   - Place Door: Add doors to any position in the wall layer

3. Use the texture panel on the right to select textures
4. Use the property panel to set level properties:
   - Floor/Ceiling colors and textures
   - Fog color

## File Operations

- **New**: Create a new empty level
- **Open**: Load a level from a JSON or ZIP file
- **Save**: Save the level as a JSON file
- **Save as ZIP**: Save the level as a ZIP file containing CSV files (compatible with the original Java-based level editor)

## Keyboard Shortcuts

No keyboard shortcuts are currently implemented.

## Requirements

- Modern web browser with HTML5 and Canvas support
- JavaScript enabled
- Internet connection for loading the JSZip library (used for ZIP file operations)

## File Format

### JSON Format

The JSON format contains the full level data in a single file, including:
- Wall and floor maps
- Colors and textures
- Spawn point
- Entity data

### ZIP Format

The ZIP format contains multiple CSV files:
- `level_info.csv`: Level properties
- `wall_map.csv`: Wall layer data
- `floor_map.csv`: Floor layer data
- `entities.csv`: Entity data

This format is compatible with the original Java-based level editor.

## Technical Details

The editor uses HTML5 Canvas for rendering the level grid and JavaScript for all functionality.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 