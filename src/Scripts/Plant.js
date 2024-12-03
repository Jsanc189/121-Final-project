export function plantHandler(ptr, scene) {
  const tileSize = scene.tile_size;
  // Get the cell offset for the player's current position
  const playerCellOffset = scene.grid.getCellAt(scene.player.x, scene.player.y, tileSize);
  if (playerCellOffset === false) {
      console.log("Player is out of bounds!");
      return;
  }

  // Get the cell offset for the clicked position
  const clickedCellOffset = scene.grid.getCellAt(ptr.x, ptr.y, tileSize);
  if (clickedCellOffset === false) {
      console.log("Clicked position is out of bounds!");
      return;
  }

  // Check if the clicked cell is adjacent to the player's cell
  if (!scene.grid.isAdjacentCell(playerCellOffset, clickedCellOffset)) {
      console.log("Clicked cell is not adjacent to the player's cell!");
      return;
  }

  // Retrieve the clicked cell's data
  const clickedCell = scene.grid.getCell(
      Math.floor(ptr.x / tileSize),
      Math.floor(ptr.y / tileSize)
  );

  const plantTypes = scene.game.globals.plantTypes;
  


  // Check if the cell already has a plant
  if (clickedCell.plant_type === 0) {
      // No plant exists, plant a new one
      const randomType = Math.floor(Math.random() * plantTypes.length);
      const plant = plantTypes[randomType];
      const plantStage = plant.growthStages[0].image;


      // Create a sprite for the new plant
      let plantX = (Math.floor(ptr.x / tileSize) + 0.5) * tileSize;
      let plantY = (Math.floor(ptr.y / tileSize) + 0.5) * tileSize;
      scene.add.sprite(
          plantX, 
          plantY, 
          plantStage
      ).setScale(scene.GRID_SCALE - 2)
      .setName("plant");

      scene.plantSprites.push({
        x: plantX,
        y: plantY,
        img: plantStage
      }); 

      // save grid state before changing
      let plantState = scene.grid.copyAttributesToArray(["x", "y", "sun_lvl", "rain_lvl", "plant_type", "growth_lvl"]);
      scene.undoStack.push({cell: clickedCell, plant: plantState});

      // Update the grid cell with the plant data
      scene.grid.setCell(
          Math.floor(ptr.x / tileSize),
          Math.floor(ptr.y / tileSize),
          {
              ...clickedCell,
              plant_type: randomType + 1,
              growth_lvl: 1,
          }
      );

      console.log(`Planted a type ${plant.name} plant at (${ptr.x}, ${ptr.y}).`);
      clickedCell.plant_type = randomType;
  } else {
    console.log("plant here...", clickedCell);

      let x =  (Math.floor(ptr.x / tileSize) + 0.5) * tileSize;
      let y =  (Math.floor(ptr.y / tileSize) + 0.5) * tileSize;
      if(clickedCell.growth_lvl >= 3){
        console.log("Harvesting plant!");

        let plantState = scene.grid.copyAttributesToArray(["plant_type"]);
        scene.undoStack.push({cell: clickedCell, harvested: plantState});

        // find sprite to destroy
        let harvestSprite = scene.findSprite(x, y);

        // remove harvest sprite from plantSprites
        scene.plantSprites = scene.plantSprites.filter(sprite =>
          sprite !== scene.findSprite(harvestSprite.x, harvestSprite.y, scene.plantSprites)
        );

        // destroy sprite
        scene.destroyedSprites.push({
          x: harvestSprite.x,
          y: harvestSprite.y,
          img: harvestSprite.img,
          type: clickedCell.plant_type
        });
        harvestSprite.destroy();

        // update plant type count
        updatePlantCount(clickedCell.plant_type, 1, scene);

        // update cell data
        clickedCell.plant_type = 0;
        clickedCell.growth_lvl = 0;
        scene.grid.setCell(clickedCell.x, clickedCell.y, clickedCell);
      }
  }
}

export function updatePlants(scene) {
  let growthToTrack = false;
  let dayGrowth = [];
  const plantTypes = scene.game.globals.plantTypes;
  const sunRequirements = scene.game.globals.sunlightRequirements;
  const waterRequirements = scene.game.globals.waterRequirements;

  for (let x = 0; x < scene.grid.height; x++) {
    for (let y = 0; y < scene.grid.width; y++) {
      const cell = scene.grid.getCell(x, y); //get the tile of the plant
      let plant = cell.plant_type;

      //skip if no plant or plan is full grown
      if (plant == 0 ||  cell.growth_lvl >= 3) continue;

      //find correct sprite 
      let plantSprite = scene.findSprite(
        (x + 0.5) * scene.tile_size, 
        (y + 0.5) * scene.tile_size, 
        scene.plantSprites
      );

      if(plantSprite === null){
        plantSprite = {
          x: (x + 0.5) * scene.tile_size,
          y: (y + 0.5) * scene.tile_size,
          img: ""
        }
      }

      const sunlightRequired = sunRequirements[cell.growth_lvl -1];
      const waterRequired = waterRequirements[cell.growth_lvl -1];

      // Check if the plant can grow
      if (cell.sun_lvl >= sunlightRequired && cell.rain_lvl >= waterRequired) {
        const newGrowth = cell.growth_lvl + 1;
        const plantType = plantTypes[cell.plant_type - 1];

        // Update sprite image to the new growth stage
        plantSprite.img = plantType.growthStages[cell.growth_lvl].image;

        // Update grid cell with new growth level
        cell.growth_lvl = newGrowth;
        scene.grid.setCell(x, y, cell);

        console.log(`Plant ${cell.plant_type} grew to stage ${newGrowth}!`);
        growthToTrack = true;
      }

      // Update the sprite with the new image
      scene.updateSprite(plantSprite.x, plantSprite.y, scene.plantSprites, plantSprite);

      if (growthToTrack) dayGrowth.push(cell);
    }
  }

      // switch (plant) {
      //   case 1:
      //     if (cell.sun_lvl >=  sunRequirements[0] && cell.rain_lvl >= waterRequirements[0]) { // check for plant type 1 growth conditions
      //         console.log(plant);
      //         const newGrowth = cell.growth_lvl + 1; //increase growth level
      //         console.log("case 1 plant type: ", plantTypes[plant-1])
      //         plantSprite.img = plantTypes[plant].growthStages[cell.growth_lvl - 1].image;
      //         cell.growth_lvl = newGrowth;
      //         scene.grid.setCell(x, y, cell); //update the growth level in the grid
      //         console.log("Plant 1 grew!" + newGrowth)
      //         growthToTrack = true;
      //     }
      //     break;
      //   case 2:
      //     if (cell.sun_lvl >= sunRequirements[1] && cell.rain_lvl >= waterRequirements[1]) { // check for plant type 2 growth conditions
      //         console.log(plant);
      //         console.log("case 1 plant type: ", plantTypes[plant-1])
      //         const newGrowth = cell.growth_lvl + 1; //increase growth level
      //         plantSprite.img = plantTypes[plant-1].growthStages[cell.growth_lvl - 1].image;
      //         cell.growth_lvl = newGrowth;
      //         scene.grid.setCell(x, y, cell); //update the growth level in the grid
      //         console.log("Plant 2 grew!" + newGrowth);
      //         growthToTrack = true;
      //     }
      //     break;
      //   case 3:
      //     if (cell.sun_lvl >= sunRequirements[2] && cell.rain_lvl >= waterRequirements[2]) { // check for plant type 3 growth conditions
      //         const newGrowth = cell.growth_lvl + 1; //increase growth level
      //         plantSprite.img = plantTypes[plant-1].growthStages[cell.growth_lvl - 1].image;
      //         console.log(toString(plantSprite.img));
      //         cell.growth_lvl = newGrowth;
      //         scene.grid.setCell(x, y, cell); //update the growth level in the grid
      //         console.log("Plant 3 is ready to harvest! " + newGrowth)
      //         growthToTrack = true;
      //     }
      //     break;
      // }
  //     scene.updateSprite(plantSprite.x, plantSprite.y, scene.plantSprites, plantSprite);
  //     if(growthToTrack === true) dayGrowth.push(cell);
  //   }
  // }
  scene.grownPlants.push(dayGrowth);
  renderPlantSprites(scene.plantSprites, scene);
}

export function updatePlantCount(type, amount, scene){
  if(type === null) return;
  switch(type){
    case 1:
      scene.plantOneCount += amount;
      break;
    case 2:
      scene.plantTwoCount += amount;
      break;
    case 3:
      scene.plantThreeCount += amount;
      break;
    default:
      throw new Error(`Unknown plant type: ${type}`);
  }
}

export function renderPlantSprites(sprites, scene){
  for(const plant of sprites){
    // if there's already a cell here, destroy it so we aren't rendering
    //  sprites on top of each other
    let cellSprite = scene.findSprite(plant.x, plant.y);
    if(cellSprite){
      cellSprite.destroy();
    }
    scene.add.sprite(plant.x, plant.y, plant.img)
      .setScale(scene.GRID_SCALE - 2)
      .setName("plant");
  }
}