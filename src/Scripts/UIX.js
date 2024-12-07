import "phaser";
import { languages } from "../Scripts/Text.js";

export function initUIX(scene, undo, redo, endDay, saveFile, quit){
    //buttons
    makeButton(
      scene,
      75,
      860,
      100,
      50,
      languages[scene.game.globals.language]["undo"],
      0xffffff,
      "16px",
      () => undo.bind(scene, scene),
    );
    makeButton(
      scene,
      225,
      860,
      100,
      50,
      languages[scene.game.globals.language]["redo"],
      0xffffff,
      "16px",
      () => redo.bind(scene, scene),
    );
    makeButton(
      scene,
      375,
      860,
      100,
      50,
      languages[scene.game.globals.language]["end_day"],
      0xffffff,
      "16px",
      () => endDay.bind(scene, scene),
    );
    makeButton(
      scene,
      575,
      860,
      100,
      50,
      languages[scene.game.globals.language]["save_verb"],
      0xffffff,
      "16px",
      () => saveFile.bind(scene, scene),
    );
    makeButton(
      scene,
      725,
      860,
      100,
      50,
      languages[scene.game.globals.language]["quit"],
      0xffffff,
      "16px",
      () => quit.bind(scene, scene),
    );

    // make toggle for autosaving
    let gridWidth = scene.grid_dims.scale * scene.grid_dims.tile_size * scene.grid_dims.width;
    scene.autosaveToggle = scene.add.rectangle(
      gridWidth + 100, 50, 50, 50, 0xFFFFFF)
      .setOrigin(0.5);
    scene.add.text(scene.autosaveToggle.x, scene.autosaveToggle.y + 50, languages[scene.game.globals.language]["autosave"], {
      fontSize: 16,
      color: "#3CAD24",
    }).setOrigin(0.5);
    scene.autosaveToggle.setInteractive();
    scene.autosaveToggle.on("pointerover", () => {
      scene.autosaveToggle.setFillStyle(0x3CAD24);
    });
    scene.autosaveToggle.on("pointerout", () => {
      if(!scene.toggles.autosave) scene.autosaveToggle.setFillStyle(0xFFFFFF);
    });
    scene.autosaveToggle.on("pointerdown", () => {
      scene.autosaveToggle.setFillStyle(0x3CAD24);
    });
    scene.autosaveToggle.on("pointerup", () => {
      scene.toggles.autosave = !scene.toggles.autosave;
      if(scene.toggles.autosave) scene.autosaveToggle.setFillStyle(0x06402B);
      else scene.autosaveToggle.setFillStyle(0xFFFFFF);
    });

    // make toggle for heatmap
    scene.heatmapToggle = scene.add.rectangle(
      gridWidth + 100, 200, 50, 50, 0xFFFFFF)
      .setOrigin(0.5);
    scene.add.text(scene.heatmapToggle.x, scene.heatmapToggle.y + 50, languages[scene.game.globals.language]["weather_layer"], {
      fontSize: 16,
      color: "#3CAD24",
    }).setOrigin(0.5);
    scene.heatmapToggle.setInteractive();
    scene.heatmapToggle.on("pointerover", () => {
      scene.heatmapToggle.setFillStyle(0x3CAD24);
    });
    scene.heatmapToggle.on("pointerout", () => {
      if(!scene.toggles.heatmap) scene.heatmapToggle.setFillStyle(0xFFFFFF);
    });
    scene.heatmapToggle.on("pointerdown", () => {
      scene.heatmapToggle.setFillStyle(0x3CAD24);
    });
    scene.heatmapToggle.on("pointerup", () => {
      scene.toggles.heatmap = !scene.toggles.heatmap;
      if(scene.toggles.heatmap){ 
        scene.heatmapToggle.setFillStyle(0x06402B);
        scene.weatherMap = scene.grid.render(scene.tile_size);
      }
      else {
        scene.heatmapToggle.setFillStyle(0xFFFFFF);
        if(scene.weatherMap.length > 0) for(const rect of scene.weatherMap) rect.destroy();
        scene.weatherMap = [];
      }
    });

    // make sidebar for harvested plant counts
    scene.add.text(gridWidth + 50, 300, `${10 - scene.counts["carrot"]} ${languages[scene.game.globals.language]["carrots"]}`);
    scene.add.text(gridWidth + 50, 325, `${10 - scene.counts["tomato"]} ${languages[scene.game.globals.language]["tomatoes"]}`);
    scene.add.text(gridWidth + 50, 350, `${10 - scene.counts["corn"]} ${languages[scene.game.globals.language]["corn"]}`);
}

function makeButton(scene, x, y, width, height, text, textColor, textSize, functionCall) {
    const buttonBG = scene.add.rectangle(x, y, width, height, 0xFFFFFF);
    const button = scene.add.text(x, y, text, {
      fontSize: textSize,
      color: textColor,
    }).setOrigin(0.5);
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
    if (!(ptr.x >= 800 || ptr.y >= 800)) {
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
        `${languages[scene.game.globals.language]["sun"]}: ${cell.sun_lvl}\n${languages[scene.game.globals.language]["rain"]}: ${cell.rain_lvl}\nplant type: ${cell.plant_type}\ngrowth: ${cell.growth_lvl}`,
        );
    }
}