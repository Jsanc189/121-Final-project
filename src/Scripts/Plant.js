import "phaser";
export function plantHandler(scene, pixelCoord, clickedCell, plantTypes) {
  const plant = {
    type: plantTypes[clickedCell.plant_type-1],
    type_index: clickedCell.plant_type,
    x: pixelCoord.x,
    y: pixelCoord.y,
    cell: clickedCell
  }
  // Check if the cell already has a plant
  if (clickedCell.plant_type === 0) {
      // No plant exists, plant a new one
      const randomType = Math.floor(Math.random() * plantTypes.length);
      plant.type_index = randomType;
      plant.type = plantTypes[randomType];
      
      putRandomPlant(scene, plant);
      clickedCell.plant_type = randomType;
  } else {
      if(clickedCell.growth_lvl >= 3){
        // If growth level is high enough, harvest plant
        harvestPlant(scene, plant);
      }
  }
}

export function updatePlants(scene, plantTypes, requirements) {
  let dayGrowth = [];

  for (let x = 0; x < scene.grid.dimensions.width; x++) {
    for (let y = 0; y < scene.grid.dimensions.height; y++) {
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
export function updatePlantCount(scene, type, amount){
  type = type.name.toLowerCase();
  if(scene.counts[type] === null){ 
    throw new Error(`Unknown plant type: ${type}`);
  } else {
    scene.counts[type] += amount;
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
      .setScale(scene.grid_dims.scale - 2)
      .setName("plant");
  }
}

function putRandomPlant(scene, plant){
  const plantStage = plant.type.growthStages[0].image;

    scene.add.sprite(
        plant.x, 
        plant.y, 
        plantStage
    ).setScale(scene.grid_dims.scale - 2)
    .setName("plant");

    scene.plantSprites.push({
      x: plant.x,
      y: plant.y,
      img: plantStage
    }); 

    // save grid state before changing
    scene.undoStack.push({plant: plant});

    // Update the grid cell with the plant data
    scene.grid.setCell(
      plant.cell.x,
      plant.cell.y,
        {
            ...plant.cell,
            plant_type: plant.type_index + 1,
            growth_lvl: 1,
        }
    );
}

function harvestPlant(scene, plant){
  scene.undoStack.push({harvested: plant});

  // find sprite to destroy
  let harvestSprite = scene.findSprite(plant.x, plant.y);

  // remove harvest sprite from plantSprites
  scene.plantSprites = scene.plantSprites.filter(sprite =>
    sprite !== scene.findSprite(harvestSprite.x, harvestSprite.y, scene.plantSprites)
  );

  // destroy sprite
  scene.destroyedSprites.push({
    x: harvestSprite.x,
    y: harvestSprite.y,
    img: harvestSprite.texture.key,
    type: plant.cell.plant_type
  });
  harvestSprite.destroy();

  // update plant type count
  updatePlantCount(scene, plant.type, 1);

  // update cell data
  plant.cell.plant_type = 0;
  plant.cell.growth_lvl = 0;
  scene.grid.setCell(plant.cell.x, plant.cell.y, plant.cell);
}

function growPlant(scene, plant, cell){
  // Update sprite image to the new growth stage
  plant.sprite.img = plant.type.growthStages[cell.growth_lvl].image;

  // Update the sprite with the new image
  scene.updateSprite(plant.sprite.x, plant.sprite.y, scene.plantSprites, plant.sprite);

  // Update grid cell with new growth level
  cell.growth_lvl = plant.newGrowth;
  scene.grid.setCell(cell.x, cell.y, cell);
}