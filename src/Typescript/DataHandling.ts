import { renderPlantSprites, updatePlantCount } from "../Typescript/Plant.js";

export function undo(scene) {
    let popped = scene.undoStack.pop();
    if (popped) {
        scene.redoStack.push(popped);
        
        if (popped.weather) { 
            console.log("undo weather");
            scene.updateWorld("weather", popped.weather);
        }

        if (popped.plant) { 
            console.log("undo plant")
            // update sprites
            let destroy = scene.plantSprites.pop();
            scene.findSprite(destroy.x, destroy.y).destroy();
            scene.destroyedSprites.push({
            ...destroy,
            type: popped.plant.cell.plant_type
            });

            // update grid at cell
            popped.plant.cell.plant_type = 0;
            popped.plant.cell.growth_lvl = 0;
            scene.grid.setCell(popped.plant.cell.x, popped.plant.cell.y, popped.plant.cell);
        }

        if (popped.harvested) {
            console.log("undo harvest")
            let restore = scene.destroyedSprites.pop();

            renderPlantSprites([restore], scene);
            scene.plantSprites.push(restore);

            updatePlantCount(scene, popped.harvested.type, -1);

            popped.harvested.cell.plant_type = popped.harvested.type_index;
            popped.harvested.cell.growth_lvl = 3;
            scene.grid.setCell(popped.harvested.cell.x, popped.harvested.cell.y, popped.harvested.cell);
        }

      if (popped.growth) {
        let restore = scene.grownPlants.pop();
        if (restore.length > 0) {
            console.log("undo growth");
        }

        scene.ungrownPlants.push(restore);
        restore.forEach(cell => {
            // restore (step back) growth at cell
            let restoreToLevel = cell.growth_lvl - 1;
            if (restoreToLevel < 1) {
                restoreToLevel = 1;
            }

            cell.growth_lvl = restoreToLevel;
            scene.grid.setCell(cell.x, cell.y, cell);

            // update sprite
            let plantSprite = {
                x: (cell.x + 0.5) * scene.tile_size,
                y: (cell.y + 0.5) * scene.tile_size,
                img: `plant${cell.plant_type}_${cell.growth_lvl}`
            }

            scene.updateSprite(
                (cell.x + 0.5) * scene.tile_size,
                (cell.y + 0.5) * scene.tile_size,
                scene.plantSprites,
                plantSprite
            );

            renderPlantSprites([plantSprite], scene);
        });
      }
    } 
    else {
        console.log("undo failed: nothing to undo");
    }
}

export function redo(scene) {
    let popped = scene.redoStack.pop();
    if (popped) {
        scene.undoStack.push(popped);

        if (popped.weather) { 
            console.log("redo weather");
            scene.updateWorld("weather", popped.weather); 
        }

        if (popped.plant) { 
            console.log("redo plant");
            // update sprites
            let restore = scene.destroyedSprites.pop();
            renderPlantSprites([restore], scene);
            scene.plantSprites.push(restore);

            // update grid at cell
            popped.plant.cell.plant_type = restore.type;
            popped.plant.cell.growth_lvl = 1;
            scene.grid.setCell(popped.plant.cell.x, popped.plant.cell.y, popped.plant.cell);
        }

        if (popped.harvested) {
            console.log("redo harvest");
            let destroy = scene.plantSprites.pop();
            scene.findSprite(destroy.x, destroy.y).destroy();
            scene.destroyedSprites.push(destroy);

            updatePlantCount(scene, popped.harvested.type, 1);

            popped.harvested.cell.plant_type = 0;
            popped.harvested.cell.growth_lvl = 0;
            scene.grid.setCell(popped.harvested.cell.x, popped.harvested.cell.y, popped.harvested.cell);
        }

        if (popped.growth) {
            let restore = scene.ungrownPlants.pop();
            if(restore.length > 0) {
                console.log("redo growth");
            }
            scene.grownPlants.push(restore);
            restore.forEach(cell => {
                // restore (step back) growth at cell
                let restoreToLevel = cell.growth_lvl + 1;
                if(restoreToLevel > 3) {
                    restoreToLevel = 3;
                }
                cell.growth_lvl = restoreToLevel;
                scene.grid.setCell(cell.x, cell.y, cell);

                // update sprite
                let plantSprite = {
                    x: (cell.x + 0.5) * scene.tile_size,
                    y: (cell.y + 0.5) * scene.tile_size,
                    img: `plant${cell.plant_type}_${cell.growth_lvl}`
                }

                scene.updateSprite(
                    (cell.x + 0.5) * scene.tile_size,
                    (cell.y + 0.5) * scene.tile_size,
                    scene.plantSprites,
                    plantSprite
                );

                renderPlantSprites([plantSprite], scene);
            });
        }
    } 
    else {
        console.log("redo failed: nothing to redo");
    }
}

export function saveFile(scene, isAuto) {
    if (isAuto && !scene.toggles.autosave) {
        return;
    }
    const gridState = scene.grid.copyAttributesToArray(["sun_lvl", "rain_lvl", "plant_type", "growth_lvl"]);
    const playerState = {
        x: scene.player.x,
        y: scene.player.y,
    };
    const saveData = {
        grid: gridState,
        player: playerState,
        toggles: {
            autosave: scene.toggles.autosave,
            heatmap: scene.toggles.heatmap
        },
        plantCounts: {
            plantOneCount: scene.plantOneCount,
            plantTwoCount: scene.plantTwoCount,
            plantThreeCount: scene.plantThreeCount
        },
        plantSprites: {
            active: scene.plantSprites,
            destroyed: scene.destroyedSprites
        },
        undoStack: scene.undoStack,
        redoStack: scene.redoStack
    };

    // push to save files array
    if (isAuto) {
        handleAutosave(scene, saveData);
    } 
    else { 
        scene.scene.pause();
        scene.scene.start("savesScene", {mode: "save", saveData: saveData, scene: scene});
    }

    localStorage.setItem('saveFiles', JSON.stringify(scene.saveFiles));
}

function handleAutosave(scene, saveData){
    // if we're in a loaded file, save to same index
    if (scene.load) {
        scene.saveFiles[scene.load_index] = saveData;
        return;
    }
    // if not, find first null in saveFiles
    let saved = false;
    for (let i = 0; i < scene.saveFiles.length; i++) {
        if (scene.saveFiles[i] === null) {
            scene.saveFiles[i] = saveData;
            scene.load = true;
            scene.load_index = i;
            return;
        }
    }
    // no null found
    if (!saved) {
        // if there's space, push
        if (scene.saveFiles.length < scene.game.MAX_SAVES) {
            scene.saveFiles.push(saveData); 
            scene.load = true;
            scene.load_index = scene.saveFiles.length - 1;
            return;
        }
        // if no space, ask if user wants to overwrite
        else {
            const overwrite = window.confirm("All save slots in use. Overwrite?");
            // if user declines, turn off autosave
            if (!overwrite) { 
                scene.autosaveToggle.emit("pointerup");
                return;
            }
            // is user accepts, let them pick which slot to overwrite
            else {
                scene.scene.pause();
                scene.scene.start("savesScene", {mode: "save", saveData: saveData, scene: scene});
                return;
            }
        }
    }
}

export function loadFile(scene, savedData) {
    if (savedData) {
        const parsedData = (JSON.parse(savedData));
        scene.saveFiles = parsedData;

        // get session data by index
        const sessionData = parsedData[scene.load_index];

        // Restore grid state
        scene.grid.setStateFromArray(sessionData.grid);

        // Restore player state
        scene.player.setPosition(sessionData.player.x, sessionData.player.y);
        scene.toggles.autosave = sessionData.toggles.autosave;
        scene.toggles.heatmap = sessionData.toggles.heatmap;

        // Restore plant counts
        scene.plantOneCount = sessionData.plantCounts.plantOneCount;
        scene.plantTwoCount = sessionData.plantCounts.plantTwoCount;
        scene.plantThreeCount = sessionData.plantCounts.plantThreeCount;

        // restore sprites
        scene.plantSprites = sessionData.plantSprites.active;
        renderPlantSprites(scene.plantSprites, scene);
        scene.destroyedSprites = sessionData.plantSprites.destroyed;

        // Restore undo/redo stacks
        scene.undoStack = sessionData.undoStack || [];
        scene.redoStack = sessionData.redoStack || [];
    } 
    else {
        console.log('No saved game found.');
    }
}