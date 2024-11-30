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

  // Check if the cell already has a plant
  if (clickedCell.plant_type === 0) {
      // No plant exists, plant a new one
      const randomType = Math.floor(Math.random() * 3) + 1;

      // Create a sprite for the new plant
      let plantX = (Math.floor(ptr.x / tileSize) + 0.5) * tileSize;
      let plantY = (Math.floor(ptr.y / tileSize) + 0.5) * tileSize;
      scene.add.sprite(
          plantX, 
          plantY, 
          `plant${randomType}_1`
      ).setScale(scene.GRID_SCALE - 2)
      .setName("plant");

      scene.plantSprites.push({
        x: plantX,
        y: plantY,
        img: `plant${randomType}_1`
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
              plant_type: randomType,
              growth_lvl: 1,
          }
      );

      console.log(`Planted a type ${randomType} plant at (${ptr.x}, ${ptr.y}).`);
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
  for (let x = 0; x < scene.grid.height; x++) {
    for (let y = 0; y < scene.grid.width; y++) {
      const cell = scene.grid.getCell(x, y); //get the tile of the plant
      const plant = cell.plant_type;

      //skip if no plant or plan is full grown
      if (plant == 0 ||  cell.growth_lvl >= 3) continue;

      //find correct sprite 
      let plantSprite = scene.findSprite( (x + 0.5) * scene.tile_size, (y + 0.5) * scene.tile_size, scene.plantSprites);
      if(plantSprite === null){
        plantSprite = {
          x: (x + 0.5) * scene.tile_size,
          y: (y + 0.5) * scene.tile_size,
          img: ""
        }
      }
      switch (cell.plant_type) {
        case 1:
          if (cell.sun_lvl >= 10 && cell.rain_lvl >= 10) { // check for plant type 1 growth conditions
              const newGrowth = cell.growth_lvl + 1; //increase growth level
              plantSprite.img = "plant1_" + newGrowth;
              cell.growth_lvl = newGrowth;
              scene.grid.setCell(x, y, cell); //update the growth level in the grid
              console.log("Plant 1 grew!" + newGrowth)
              growthToTrack = true;
          }
          break;
        case 2:
          if (cell.sun_lvl >= 15 && cell.rain_lvl >= 20) { // check for plant type 2 growth conditions
              const newGrowth = cell.growth_lvl + 1; //increase growth level
              plantSprite.img = "plant2_" + newGrowth;
              cell.growth_lvl = newGrowth;
              scene.grid.setCell(x, y, cell); //update the growth level in the grid
              console.log("Plant 2 grew!" + newGrowth);
              growthToTrack = true;
          }
          break;
        case 3:
          if (cell.sun_lvl >= 20 && cell.rain_lvl >= 30) { // check for plant type 3 growth conditions
              const newGrowth = cell.growth_lvl + 1; //increase growth level
              plantSprite.img = "plant3_" + newGrowth;
              console.log(toString(plantSprite.img));
              cell.growth_lvl = newGrowth;
              scene.grid.setCell(x, y, cell); //update the growth level in the grid
              console.log("Plant 3 is ready to harvest! " + newGrowth)
              growthToTrack = true;
          }
          break;
      }
      scene.updateSprite(plantSprite.x, plantSprite.y, scene.plantSprites, plantSprite);
      if(growthToTrack === true) dayGrowth.push(cell);
    }
  }
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