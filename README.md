# Minecraft World Converter
A simple application to convert server worlds to singleplayer game saves. Spigot and other minecraft server platforms save worlds in separate folders (world, world_nether, world_the_end). Conversely, vanilla Minecraft saves games in a single folder. The `WorldConverter` class merges the necessary data into a single folder to facilitate singleplayer world use.

# Usage
First, in the project directory, run `npm install`
```bash 
node converter.js --input [world world_nether world_the_end] --output <converted_world>
```