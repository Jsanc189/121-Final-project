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
      const plantSprite = scene.add.sprite(
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
      let plantState = scene.grid.copyAttributesToArray(["plant_type"]);
      scene.undoStack.push({plant: plantState});

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
      let x =  (Math.floor(ptr.x / tileSize) + 0.5) * tileSize;
      let y =  (Math.floor(ptr.y / tileSize) + 0.5) * tileSize;
      if(clickedCell.growth_lvl >= 3){
        console.log("Harvesting plant!");

        let plantState = scene.grid.copyAttributesToArray(["plant_type"]);
        scene.undoStack.push({harvested: plantState});

        let harvestSprite = scene.findSprite(x, y);
        scene.destroyedSprites.push({
          x: x,
          y: y,
          img: `plant${clickedCell.plant_type}_${clickedCell.growth_lvl}`,
          type: clickedCell.plant_type
        });
        harvestSprite.destroy();

        // update plant type count
        updatePlantCount(clickedCell.plant_type, 1, scene);

      }
  }
}

export function updatePlants(scene) {
  let dayGrowth = [];
  for (let x = 0; x < scene.grid.height; x++) {
    for (let y = 0; y < scene.grid.width; y++) {
      const cell = scene.grid.getCell(x, y); //get the tile of the plant
      const plant = cell.plant_type;

      //skip if no plant or plan is full grown
      if (plant == 0 ||  cell.growth_lvl >= 3) continue;

      //find correct sprite 
      const plantSprite = scene.findSprite( (x + 0.5) * scene.tile_size, (y + 0.5) * scene.tile_size, scene.plantSprites);
      switch (cell.plant_type) {
        case 1:
          if (cell.sun_lvl >= 10 && cell.rain_lvl >= 10) { // check for plant type 1 growth conditions
              const newGrowth = cell.growth_lvl + 1; //increase growth level
              plantSprite.img = "plant1_" + newGrowth;
              scene.grid.setCell(x, y, { ...cell, growth_lvl: newGrowth }); //update the growth level in the grid
              console.log("Plant 1 grew!" + newGrowth)

          }
          break;
        case 2:
          if (cell.sun_lvl >= 15 && cell.rain_lvl >= 20) { // check for plant type 2 growth conditions
              const newGrowth = cell.growth_lvl + 1; //increase growth level
              plantSprite.img = "plant2_" + newGrowth;
              scene.grid.setCell(x, y, { ...cell, growth_lvl: newGrowth }); //update the growth level in the grid
              console.log("Plant 2 grew!" + newGrowth);

          }
          break;
        case 3:
          if (cell.sun_lvl >= 20 && cell.rain_lvl >= 30) { // check for plant type 3 growth conditions
              const newGrowth = cell.growth_lvl + 1; //increase growth level
              plantSprite.img = "plant3_" + newGrowth;
              console.log(toString(plantSprite.img));
              scene.grid.setCell(x, y, { ...cell, growth_lvl: newGrowth }); //update the growth level in the grid
              console.log("Plant 3 is ready to harvest! " + newGrowth)
          }
          break;
      }
      scene.updateSprite(plantSprite.x, plantSprite.y, scene.plantSprites, plantSprite);
      if(cell.growth_lvl > 1) dayGrowth.push(cell);
    }
  }
  scene.grownPlants.push(dayGrowth);
  renderPlantSprites(scene.plantSprites, scene);
}

export function updatePlantCount(type, amount, scene){
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