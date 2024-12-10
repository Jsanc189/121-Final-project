import "phaser";
import { languages } from "../Scripts/Text.js";


export function initPlayUIX(scene, undo, redo, endDay, saveFile, quit, moveUp, moveDown, moveLeft, moveRight) {
    const uiDimensions = {
        buttonWidth: (scene.game.config.width - scene.width) / 1.5,
        buttonHeight: 25,
        arrowSize: (scene.game.config.width - scene.width) / 5,
        toggleWidth: Math.min(((scene.game.config.width - scene.width) / 1.5), 100),
        sidebarDivision: 24,
        fontSize: 16,
        charWidth: 10,
    }
    initSystemButtons(scene, undo, redo, endDay, saveFile, quit, uiDimensions);
    initToggles(scene, uiDimensions);
    initPlayerButtons(scene, uiDimensions, moveUp, moveDown, moveLeft, moveRight);
    initGoalText(scene, uiDimensions);
}

export function initSystemButtons(scene, undo, redo, endDay, saveFile, quit, uiDimensions) {
    //Save button
    makePlayButton(
        scene,
        scene.width,
        (scene.height / uiDimensions.sidebarDivision),
        uiDimensions.buttonWidth,
        uiDimensions.charWidth,
        uiDimensions.buttonHeight,
        languages[scene.game.globals.language]["save_verb"],
        0xffffff,
        uiDimensions.fontSize+"px",
        () => saveFile.bind(scene, scene),
    );
    //Quit button
    makePlayButton(
        scene,
        scene.width,
        (scene.height / uiDimensions.sidebarDivision) * 2,
        uiDimensions.buttonWidth,
        uiDimensions.charWidth,
        uiDimensions.buttonHeight,
        languages[scene.game.globals.language]["quit"],
        0xffffff,
        uiDimensions.fontSize+"px",
        () => quit.bind(scene, scene),
    );
    //Undo button
    makePlayButton(
        scene,
        scene.width,
        (scene.height / uiDimensions.sidebarDivision) * 3,
        uiDimensions.buttonWidth,
        uiDimensions.charWidth,
        uiDimensions.buttonHeight,
        languages[scene.game.globals.language]["undo"],
        0xffffff,
        uiDimensions.fontSize+"px",
        () => undo.bind(scene, scene),
    );
    //Redo button
    makePlayButton(
        scene,
        scene.width,
        (scene.height / uiDimensions.sidebarDivision) * 4,
        uiDimensions.buttonWidth,
        uiDimensions.charWidth,
        uiDimensions.buttonHeight,
        languages[scene.game.globals.language]["redo"],
        0xffffff,
        uiDimensions.fontSize+"px",
        () => redo.bind(scene, scene),
    );
    //End day button
    makePlayButton(
        scene,
        scene.width,
        (scene.height / uiDimensions.sidebarDivision) * 5,
        uiDimensions.buttonWidth,
        uiDimensions.charWidth,
        uiDimensions.buttonHeight,
        languages[scene.game.globals.language]["end_day"],
        0xffffff,
        uiDimensions.fontSize+"px",
        () => endDay.bind(scene, scene),
    );
}

export function initPlayerButtons(scene, uiDimensions, moveUp, moveDown, moveLeft, moveRight) {//up button
    makePlayButton(
        scene,
        scene.width,
        (scene.height / uiDimensions.sidebarDivision) * 12,
        uiDimensions.arrowSize,
        uiDimensions.charWidth,
        uiDimensions.arrowSize,
        "\u2191",
        0xffffff,
        uiDimensions.fontSize+"px",
        () => moveUp.bind(scene, scene)
    );

    //down button
    makePlayButton(
        scene,
        scene.width + (uiDimensions.arrowSize * 1.5),
        (scene.height / uiDimensions.sidebarDivision) * 12,
        uiDimensions.arrowSize,
        uiDimensions.charWidth,
        uiDimensions.arrowSize,
        "\u2193",
        0xffffff,
        uiDimensions.fontSize+"px",
        () => moveDown.bind(scene, scene),
    );

    //left button
    makePlayButton(
        scene,
        scene.width,
        (scene.height / uiDimensions.sidebarDivision) * 14,
        uiDimensions.arrowSize,
        uiDimensions.charWidth,
        uiDimensions.arrowSize,
        "\u2190",
        0xffffff,
        uiDimensions.fontSize+"px",
        () => moveLeft.bind(scene, scene),
    );

    //right button
    makePlayButton(
        scene,
        scene.width + (uiDimensions.arrowSize * 1.5),
        (scene.height / uiDimensions.sidebarDivision) * 14,
        uiDimensions.arrowSize,
        uiDimensions.charWidth,
        uiDimensions.arrowSize,
        "\u2192",
        0xffffff,
        uiDimensions.fontSize+"px",
        () => moveRight.bind(scene, scene),
    );
}

export function initToggles(scene, uiDimensions) {

    //Autosave toggle
    let autosaveText = wrapText(
        languages[scene.game.globals.language]["autosave"],
        uiDimensions.buttonWidth,
        10,
    );
    scene.autosaveToggle = scene.add.rectangle(
        scene.width,
        (scene.height / uiDimensions.sidebarDivision) * 7,
        uiDimensions.toggleWidth / 3,
        uiDimensions.toggleWidth / 3,
        0xFFFFFF,
    ).setOrigin(0);
    scene.add.text( //Label
        scene.autosaveToggle.x,
        ((scene.height / uiDimensions.sidebarDivision) * 7) + (uiDimensions.toggleWidth / 3),
        autosaveText.text,
        {
            fontSize: uiDimensions.fontSize,
            color: "#c2df48",
        },
    ).setOrigin(0);

    //heatmapToggle
    let heatmap = wrapText(
        languages[scene.game.globals.language]["weather_layer"],
        uiDimensions.buttonWidth,
        10,
    );
    scene.heatmapToggle = scene.add.rectangle(
        scene.width,
        (scene.height / uiDimensions.sidebarDivision) * 9,
        uiDimensions.toggleWidth / 3,
        uiDimensions.toggleWidth / 3,
        0xFFFFFF,
    ).setOrigin(0);
    scene.add.text( //Label
        scene.heatmapToggle.x,
        ((scene.height / uiDimensions.sidebarDivision) * 9) + (uiDimensions.toggleWidth / 3),
        heatmap.text,
        {
        fontSize: uiDimensions.fontSize,
        color: "#c2df48",
        },
    ).setOrigin(0);

    toggleInteractions(scene, scene.autosaveToggle, scene.heatmapToggle)
    
}

export function toggleInteractions(scene, autosaveToggle, heatmapToggle) {
    //autosaveToggle
    autosaveToggle.setInteractive();
    autosaveToggle.on("pointerover", () => {
        autosaveToggle.setFillStyle(0x3CAD24);
    });

    autosaveToggle.on("pointerout", () => {
        if (!scene.toggles.autosave) autosaveToggle.setFillStyle(0xFFFFFF);
    });

    autosaveToggle.on("pointerdown", () => {
        autosaveToggle.setFillStyle(0x3CAD24);
    });
    
    autosaveToggle.on("pointerup", () => {
        scene.toggles.autosave = !scene.toggles.autosave;
        if (scene.toggles.autosave) autosaveToggle.setFillStyle(0x06402B);
        else autosaveToggle.setFillStyle(0xFFFFFF);
    });

    //heatmapToggle
    heatmapToggle.setInteractive();
    heatmapToggle.on("pointerover", () => {
        heatmapToggle.setFillStyle(0x3CAD24);
    });
    heatmapToggle.on("pointerout", () => {
        if (!scene.toggles.heatmap) heatmapToggle.setFillStyle(0xFFFFFF);
    });
    heatmapToggle.on("pointerdown", () => {
        heatmapToggle.setFillStyle(0x3CAD24);
    });
    heatmapToggle.on("pointerup", () => {
        scene.toggles.heatmap = !scene.toggles.heatmap;
        if (scene.toggles.heatmap) {
            heatmapToggle.setFillStyle(0x06402B);
            scene.weatherMap = scene.grid.render(scene.tile_size);
        }
        else {
            heatmapToggle.setFillStyle(0xFFFFFF);
            if (scene.weatherMap.length > 0) {
                for (const rect of scene.weatherMap) rect.destroy();
            }
            scene.weatherMap = [];
        }
    });

}

export function initGoalText(scene, uiDimensions) {
    let gridWidth = (scene.grid_dims.scale * scene.grid_dims.tile_size) * scene.grid_dims.width;
    // harvested plant counts
    let wrappedCarrot = wrapText(
        `${10 - scene.counts["carrot"]} ${
        languages[scene.game.globals.language]["carrots"]
        }`,
        uiDimensions.buttonWidth,
        10,
    );

    let wrappedTomato = wrapText(
        `${10 - scene.counts["tomato"]} ${
        languages[scene.game.globals.language]["tomatoes"]
        }`,
        uiDimensions.buttonWidth,
        10,
    );

    let wrappedCorn = wrapText(
        `${10 - scene.counts["corn"]} ${
        languages[scene.game.globals.language]["corn"]
        }`,
        uiDimensions.buttonWidth,
        10,
    );

    let carrotText = scene.add.text(
        gridWidth + 20,
        (scene.height / uiDimensions.sidebarDivision) * 16,
        wrappedCarrot.text,
    );

    let tomatoText = scene.add.text(
        gridWidth + 20,
        carrotText.y + carrotText.height + 20,
        wrappedTomato.text,
    );
    
    scene.add.text( //cornText
        gridWidth + 20,
        tomatoText.y + tomatoText.height + 20,
        wrappedCorn.text,
    );
}

export function makePlayButton(scene, x, y, width, charWidth, height, text, textColor, textSize, functionCall) {
    const wrapped = wrapText(text, width, charWidth);
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

export function makeMenuButton(scene, x, y, text, style) {
    const colors = [{ fill: "#b18b1c" }, { fill: '#c2df48' }]
    const button = scene.add.text(x, y, text, style).setOrigin(0.5, 0.5);
    button.setInteractive();
    button.on("pointerover", () => {
      button.setStyle(colors[0]);
    });
    button.on("pointerout", () => {
      button.setStyle(colors[1]);
    });
    return button;
  }

export function wrapText(text, maxWidth, charWidth) {
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
        }
        else {
            line = testLine;
        }
    }

    wrappedText += line.trim(); // Add the last line
    return { text: wrappedText, lines: lines };
}

export function cellPreview(scene, ptr) {
    if (!(ptr.x >= scene.width - scene.tile_size || ptr.y >= scene.height - scene.tile_size)) {
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
