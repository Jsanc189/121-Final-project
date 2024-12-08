import "phaser";
import { languages } from "../Scripts/Text.js";

export function initUIX(scene, undo, redo, endDay, saveFile, quit, moveUp, moveDown, moveLeft, moveRight) {
  let buttonWidth = (scene.game.config.width - scene.width) / 1.5;
  let arrowWidth = (scene.game.config.width - scene.width) / 5;
  let sidebarDivision = 24;
  
  //buttons
  //save button
  //makeButton(scene, x, y, width, height, text, textColor, textSize, functionCall)
  makeButton(
    scene,
    scene.width,
    (scene.height / sidebarDivision),
    buttonWidth,
    25,
    languages[scene.game.globals.language]["save_verb"],
    0xffffff,
    "16px",
    () => saveFile.bind(scene, scene),
  );
    
  //quit
  makeButton(
    scene,
    scene.width,
    (scene.height / sidebarDivision) * 2,
    buttonWidth,
    25,
    languages[scene.game.globals.language]["quit"],
    0xffffff,
    "16px",
    () => quit.bind(scene, scene),
  );
  
  //undo button
  makeButton(
    scene,
    scene.width,
    (scene.height / sidebarDivision) * 3,
    buttonWidth,
    25,
    languages[scene.game.globals.language]["undo"],
    0xffffff,
    "16px",
    () => undo.bind(scene, scene),
  );

  //redo button
  makeButton(
    scene,
    scene.width,
    (scene.height / sidebarDivision) * 4,
    buttonWidth,
    25,
    languages[scene.game.globals.language]["redo"],
    0xffffff,
    "16px",
    () => redo.bind(scene, scene),
  );

  //end day button
  makeButton(
    scene,
    scene.width,
    (scene.height / sidebarDivision) * 5,
    buttonWidth,
    25,
    languages[scene.game.globals.language]["end_day"],
    0xffffff,
    "16px",
    () => endDay.bind(scene, scene),
  );

  // make toggle for autosaving
  let gridWidth = scene.grid_dims.scale * scene.grid_dims.tile_size *
    scene.grid_dims.width;
  let toggleWidth = Math.min(buttonWidth, 100);
  let autosave = wrapText(
    languages[scene.game.globals.language]["autosave"],
    buttonWidth,
    10,
  );

  //autosave square for toggle
  scene.autosaveToggle = scene.add.rectangle(
    scene.width,
    (scene.height / sidebarDivision) * 7,
    toggleWidth / 3,
    toggleWidth / 3,
    0xFFFFFF,
  ).setOrigin(0);

  //autosavetext
  scene.add.text(
    scene.autosaveToggle.x,
    ((scene.height / sidebarDivision) * 7) + (toggleWidth / 3),
    autosave.text,
    {
      fontSize: 16,
      color: "#3CAD24",
    },
  ).setOrigin(0);
  scene.autosaveToggle.setInteractive();
  scene.autosaveToggle.on("pointerover", () => {
    scene.autosaveToggle.setFillStyle(0x3CAD24);
  });

  scene.autosaveToggle.on("pointerout", () => {
    if (!scene.toggles.autosave) scene.autosaveToggle.setFillStyle(0xFFFFFF);
  });

  scene.autosaveToggle.on("pointerdown", () => {
    scene.autosaveToggle.setFillStyle(0x3CAD24);
  });
  
  scene.autosaveToggle.on("pointerup", () => {
    scene.toggles.autosave = !scene.toggles.autosave;
    if (scene.toggles.autosave) scene.autosaveToggle.setFillStyle(0x06402B);
    else scene.autosaveToggle.setFillStyle(0xFFFFFF);
  });

  // make toggle for heatmap
  let heatmap = wrapText(
    languages[scene.game.globals.language]["weather_layer"],
    buttonWidth,
    10,
  );
  scene.heatmapToggle = scene.add.rectangle(
    scene.width,
    (scene.height / sidebarDivision) * 9,
    toggleWidth / 3,
    toggleWidth / 3,
    0xFFFFFF,
  ).setOrigin(0);
  scene.add.text(
    scene.heatmapToggle.x,
    ((scene.height / sidebarDivision) * 9) + (toggleWidth / 3),
    heatmap.text,
    {
      fontSize: 16,
      color: "#3CAD24",
    },
  ).setOrigin(0);
  scene.heatmapToggle.setInteractive();
  scene.heatmapToggle.on("pointerover", () => {
    scene.heatmapToggle.setFillStyle(0x3CAD24);
  });
  scene.heatmapToggle.on("pointerout", () => {
    if (!scene.toggles.heatmap) scene.heatmapToggle.setFillStyle(0xFFFFFF);
  });
  scene.heatmapToggle.on("pointerdown", () => {
    scene.heatmapToggle.setFillStyle(0x3CAD24);
  });
  scene.heatmapToggle.on("pointerup", () => {
    scene.toggles.heatmap = !scene.toggles.heatmap;
    if (scene.toggles.heatmap) {
      scene.heatmapToggle.setFillStyle(0x06402B);
      scene.weatherMap = scene.grid.render(scene.tile_size);
    } else {
      scene.heatmapToggle.setFillStyle(0xFFFFFF);
      if (scene.weatherMap.length > 0) {
        for (const rect of scene.weatherMap) rect.destroy();
      }
      scene.weatherMap = [];
    }
  });

  //add movement buttons
  //up button
  makeButton(
    scene,
    scene.width,
    (scene.height / sidebarDivision) * 12,
    arrowWidth,
    arrowWidth,
    "\u2191",
    0xffffff,
    "16px",
    () => moveUp.bind(scene, scene)
  );

  //down button
  makeButton(
    scene,
    scene.width + (arrowWidth * 1.5),
    (scene.height / sidebarDivision) * 12,
    arrowWidth,
    arrowWidth,
    "\u2193",
    0xffffff,
    "16px",
    () => moveDown.bind(scene, scene),
  );

  //left button
  makeButton(
    scene,
    scene.width,
    (scene.height / sidebarDivision) * 14,
    arrowWidth,
    arrowWidth,
    "\u2190",
    0xffffff,
    "16px",
    () => moveLeft.bind(scene, scene),
  );

  //right button
  makeButton(
    scene,
    scene.width + (arrowWidth * 1.5),
    (scene.height / sidebarDivision) * 14,
    arrowWidth,
    arrowWidth,
    "\u2192",
    0xffffff,
    "16px",
    () => moveRight.bind(scene, scene),
  );

  // harvested plant counts
  let wrappedCarrot = wrapText(
    `${10 - scene.counts["carrot"]} ${
      languages[scene.game.globals.language]["carrots"]
    }`,
    buttonWidth,
    10,
  );

  let wrappedTomato = wrapText(
    `${10 - scene.counts["tomato"]} ${
      languages[scene.game.globals.language]["tomatoes"]
    }`,
    buttonWidth,
    10,
  );

  let wrappedCorn = wrapText(
    `${10 - scene.counts["corn"]} ${
      languages[scene.game.globals.language]["corn"]
    }`,
    buttonWidth,
    10,
  );

  let carrotText = scene.add.text(
    gridWidth + 20,
    (scene.height / sidebarDivision) * 16,
    wrappedCarrot.text,
  );

  let tomatoText = scene.add.text(
    gridWidth + 20,
    carrotText.y + carrotText.height + 20,
    wrappedTomato.text,
  );
  
  let cornText = scene.add.text(
    gridWidth + 20,
    tomatoText.y + tomatoText.height + 20,
    wrappedCorn.text,
  );
}

function makeButton(
  scene,
  x,
  y,
  width,
  height,
  text,
  textColor,
  textSize,
  functionCall,
) {
  const wrapped = wrapText(text, width, 10);
  const buttonBG = scene.add.rectangle(
    x,
    y,
    width,
    height * wrapped.lines,
    0xFFFFFF,
  ).setOrigin(0);
  const button = scene.add.text(
    x + buttonBG.width / 2,
    y + buttonBG.height / 2,
    wrapped.text,
    {
      fontSize: textSize,
      color: textColor,
    },
  ).setOrigin(0.5);
  buttonBG.setInteractive();
  button.setInteractive();
  buttonBG.on("pointerover", () => {
    button.setStyle({ color: "#3CAD24" });
  });
  button.on("pointerover", () => {
    button.setStyle({ color: "#3CAD24" });
  });
  buttonBG.on("pointerout", () => {
    button.setStyle({ color: textColor });
  });
  button.on("pointerup", functionCall());
  buttonBG.on("pointerup", functionCall());
}

export function cellPreview(scene, ptr) {
  if (
    !(ptr.x >= scene.width - scene.tile_size ||
      ptr.y >= scene.height - scene.tile_size)
  ) {
    let [x, y] = [ptr.x, ptr.y];
    let [w, h] = [scene.levelsText.width, scene.levelsText.height];
    if (x < w) w = 0;
    if (y < h) h = 0;
    scene.levelsText.x = x - w;
    scene.levelsText.y = y - h;

    let [gridX, gridY] = [
      Math.floor(x / scene.tile_size),
      Math.floor(y / scene.tile_size),
    ];
    let cell = scene.grid.getCell(gridX, gridY);
    scene.levelsText.setText(
      `${languages[scene.game.globals.language]["sun"]}: ${cell.sun_lvl}\n${
        languages[scene.game.globals.language]["rain"]
      }: ${cell.rain_lvl}\nplant type: ${cell.plant_type}\ngrowth: ${cell.growth_lvl}`,
    );
  }
}

function wrapText(text, maxWidth, charWidth) {
  const maxCharsPerLine = Math.floor(maxWidth / charWidth);
  const words = text.split(" ");
  let lines = 1;
  let line = "";
  let wrappedText = "";

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";

    if (testLine.length > maxCharsPerLine) {
      wrappedText += line.trim() + "\n";
      line = words[i] + " ";
      lines++;
    } else {
      line = testLine;
    }
  }

  wrappedText += line.trim(); // Add the last line
  return { text: wrappedText, lines: lines };
}
