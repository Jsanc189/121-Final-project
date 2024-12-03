export function initUIX(scene, undo, redo, endDay, saveFile, quit){
    //buttons
    makeButton(
      scene,
      75,
      860,
      100,
      50,
      "Undo",
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
      "Redo",
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
      "End Day",
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
      "Save",
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
      "Quit",
      0xffffff,
      "16px",
      () => quit.bind(scene, scene),
    );

    // make toggle for autosaving
    scene.autosaveToggle = scene.add.rectangle(
      scene.game.config.width - 50, 50, 50, 50, 0xFFFFFF)
      .setOrigin(0.5);
    scene.add.text(scene.autosaveToggle.x, scene.autosaveToggle.y + 50, "autosave", {
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
      scene.game.config.width - 50, 200, 50, 50, 0xFFFFFF)
      .setOrigin(0.5);
    scene.add.text(scene.heatmapToggle.x, scene.heatmapToggle.y + 50, "weather\n layer", {
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
        `sun: ${cell.sun_lvl}\nrain: ${cell.rain_lvl}\nplant type: ${cell.plant_type}\ngrowth: ${cell.growth_lvl}`,
        );
    }
}