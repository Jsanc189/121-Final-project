export function plantHandler(scene, pixelCoord, clickedCell, plantTypes) {
  // Check if the cell already has a plant
  if (clickedCell.plant_type === 0) {
      // No plant exists, plant a new one
      const randomType = Math.floor(Math.random() * plantTypes.length);
      const plant = {
        type: plantTypes[randomType],
        type_index: randomType,
        x: pixelCoord.x,
        y: pixelCoord.y,
      }
      putRandomPlant(scene, plant, clickedCell);

      console.log(`Planted a type ${plant.type.name} plant at cell (${clickedCell.x}, ${clickedCell.y}).`);
      clickedCell.plant_type = randomType;
  } else {
      if(clickedCell.growth_lvl >= 3){
        // If growth level is high enough, harvest plant
        harvestPlant(scene, clickedCell, pixelCoord);
      }
  }
}

export function updatePlants(scene, plantTypes, requirements) {
  let dayGrowth = [];

  for (let x = 0; x < scene.grid.height; x++) {
    for (let y = 0; y < scene.grid.width; y++) {
      const cell = scene.grid.getCell(x, y); //get the tile of the plant
      let plant = cell.plant_type;

      //skip if no plant or plan is full grown
      if (plant == 0 ||  cell.growth_lvl >= 3) continue;

      const sunlightRequired = requirements.sun[cell.growth_lvl -1];
      const waterRequired = requirements.water[cell.growth_lvl -1];

      // Check if the plant can grow
      if (cell.sun_lvl >= sunlightRequired && cell.rain_lvl >= waterRequired) {
        let pixelCoord = {
          x: (x + 0.5) * scene.tile_size, 
          y: (y + 0.5) * scene.tile_size, 
        };

        let plant = {
          type: plantTypes[cell.plant_type - 1],
          newGrowth: cell.growth_lvl + 1,
          sprite: scene.findSprite(pixelCoord.x, pixelCoord.y, scene.plantSprites)
        };

        if(plant.sprite === null){
          plant.sprite = {
            x: pixelCoord.x,
            y: pixelCoord.y,
            img: ""
          }
        }

        growPlant(scene, plant, cell);
        dayGrowth.push(cell);
      }
    }
  }
  scene.grownPlants.push(dayGrowth);
  renderPlantSprites(scene.plantSprites, scene);
}

//* functions called by yaml *//
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

function putRandomPlant(scene, plant, clickedCell){
  const plantStage = plant.type.growthStages[0].image;

    scene.add.sprite(
        plant.x, 
        plant.y, 
        plantStage
    ).setScale(scene.GRID_SCALE - 2)
    .setName("plant");

    scene.plantSprites.push({
      x: plant.x,
      y: plant.y,
      img: plantStage
    }); 

    // save grid state before changing
    let plantState = scene.grid.copyAttributesToArray(["x", "y", "sun_lvl", "rain_lvl", "plant_type", "growth_lvl"]);
    scene.undoStack.push({cell: clickedCell, plant: plantState});

    // Update the grid cell with the plant data
    scene.grid.setCell(
        clickedCell.x,
        clickedCell.y,
        {
            ...clickedCell,
            plant_type: plant.type_index + 1,
            growth_lvl: 1,
        }
    );
}

function harvestPlant(scene, clickedCell, pixelCoord){
  console.log("Harvesting plant!");

  let plantState = scene.grid.copyAttributesToArray(["plant_type"]);
  scene.undoStack.push({cell: clickedCell, harvested: plantState});

  // find sprite to destroy
  let harvestSprite = scene.findSprite(pixelCoord.x, pixelCoord.y);

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

function growPlant(scene, plant, cell){
  // Update sprite image to the new growth stage
  plant.sprite.img = plant.type.growthStages[cell.growth_lvl].image;

  // Update the sprite with the new image
  scene.updateSprite(plant.sprite.x, plant.sprite.y, scene.plantSprites, plant.sprite);

  // Update grid cell with new growth level
  cell.growth_lvl = plant.newGrowth;
  scene.grid.setCell(cell.x, cell.y, cell);

  console.log(`Plant ${cell.plant_type} grew to stage ${plant.newGrowth}!`);
}