
const eng = {
    game_name: "Plant Harvest", // name of the game
    new_game: "New Game", // to start a new game
    load_game: "Load Game", // to load a previous save
    select_lang: "Select Language", // to select language
    eng: "English", // English
    swe: "Swedish", // Swedish
    hebr: "Hebrew", // Hebrew
    chi: "Chinese", // Chinese 
    save_noun: "Save", // indicating a save slot (eg. save 1)
    back: "Back", // indicating a "go back" button
    delete_saves: "Delete saves", // button that deletes all saves
    empty_save: "empty slot", // indicates empty save slot
    undo: "Undo", // undo last game action
    redo: "Redo", // redo last undid game action
    end_day: "End Day", // end the day, in-game
    save_verb: "Save", // save the game, in-game
    quit: "Quit", // quit the game, in-game
    autosave: "Autosave", // toggle autosave functions
    weather_layer: "Weather layer", // show the weather layer overlay
    sun: "sun", // sun level per tile
    rain: "rain", // rain level per tile
    plant_type: "plant", // the type of plant - carrot, corn, or tomato
    growth: "growth", // growth level from 1-3
    carrots: "Carrots needed", // [x] more carrots needed to fulfill win conditions
    tomatoes: "Tomatoes needed", // [x] more tomatoes needed to fulfill win conditions
    corn: "Corn needed", // [x] more corn needed to fulfill win conditions
    you_win: "You win!", // win messsage
    main_menu: "Main Menu", // main menu
    overwrite_saves: "This will overwrite your saved data. Proceed?", // this will overwrite your saves, proceed?
}

const swe = {
    game_name: "Växtskörd", // name of the game
    new_game: "Nytt Spel", // to start a new game
    load_game: "Ladda Spel", // to load a previous save
    select_lang: "Välj Språk", // to select language
    eng: "Engelska", // English
    swe: "Svenska", // Swedish
    hebr: "Hebreiska", // Hebrew
    chi: "Kinesiska", // Chinese 
    save_noun: "Sparfil", // indicating a save slot (eg. save 1)
    back: "Tillbaka", // indicating a "go back" button
    delete_saves: "Radera sparfilar", // button that deletes all saves
    empty_save: "tom sparfil", // indicates empty save slot
    undo: "Ångra", // undo last game action
    redo: "Gör om", // redo last undid game action
    end_day: "Avsluta dagen", // end the day, in-game
    save_verb: "Spara", // save the game, in-game
    quit: "Avsluta spel", // quit the game, in-game
    autosave: "Autospara", // toggle autosave functions
    weather_layer: "Visa väder", // show the weather layer overlay
    sun: "sol", // sun level per tile
    rain: "regn", // rain level per tile
    plant_type: "växttyp", // the type of plant - carrot, corn, or tomato
    growth: "tillväxtnivå", // growth level from 1-3
    carrots: "Morötter behövs", // [x] more carrots needed to fulfill win conditions
    tomatoes: "Tomater behövs", // [x] more tomatoes needed to fulfill win conditions
    corn: "Majs behövs", // [x] more corn needed to fulfill win conditions
    you_win: "Du vinner!", // win messsage
    main_menu: "Menyn", // main menu
    overwrite_saves: "Detta kommer att skriva över dina sparfilar. Fortsätt?", // this will overwrite your saves, proceed?
};

const hebr = {
    game_name: "קציר צמחים", // name of the game
    new_game: "משחק חדש", // to start a new game
    load_game: "לטעון משחק", // to load a previous save
    select_lang: "בוחר שפה", // to select language
    eng: "אנגלית", // English
    swe: "שוודית", // Swedish
    hebr: "עברית", // Hebrew
    chi: "סינית", // Chinese 
    save_noun: "שמירה", // indicating a save slot (eg. save 1)
    back: "הקודם", // indicating a "go back" button
    delete_saves: "למחוק את השמירות", // button that deletes all saves
    empty_save: "שמירה ריקה", // indicates empty save slot
    undo: "ביטול פעולה", // undo last game action
    redo: "עושת שוב", // redo last undid game action
    end_day: "מסיים את היום", // end the day, in-game
    save_verb: "שומר את המשחק", // save the game, in-game
    quit: "עזוב את המשחק", // quit the game, in-game
    autosave: "שמירה אוטומטית", // toggle autosave functions
    weather_layer: "מראה את מזג האוויר", // show the weather layer overlay
    sun: "שמש", // sun level per tile
    rain: "גשם", // rain level per tile
    plant_type: "צמח", // the type of plant - carrot, corn, or tomato
    growth: "רמת הצמיחה", // growth level from 1-3
    carrots: "גזרים לקציר", // [x] more carrots needed to fulfill win conditions
    tomatoes: "עגבניות לקציר", // [x] more tomatoes needed to fulfill win conditions
    corn: "תירס לקציר", // [x] more corn needed to fulfill win conditions
    you_win: "אתה מנצח", // win messsage
    main_menu: "תפריט ראשי", // main menu
    overwrite_saves: "פעולה זו תחליף את הנתונים השמורים שלך. ממשיך" + "?", // this will overwrite your saves, proceed?
}

const chi = {
    game_name: "收割植物", // name of the game
    new_game: "新遊戲", // to start a new game
    load_game: "加載遊戲", // to load a previous save
    select_lang: "語言選擇", // to select language
    eng: "英文", // English
    swe: "瑞典文", // Swedish
    hebr: "希伯來文", // Hebrew
    chi: "中文", // Chinese 
    save_noun: "備份", // indicating a save slot (eg. save 1)
    back: "返回", // indicating a "go back" button
    delete_saves: "刪除所有備份", // button that deletes all saves
    empty_save: "空白備份", // indicates empty save slot
    undo: "撤銷", // undo last game action
    redo: "重做", // redo last undid game action
    end_day: "快進一天", // end the day, in-game
    save_verb: "儲存", // save the game, in-game
    quit: "退出", // quit the game, in-game
    autosave: "自動儲存", // toggle autosave functions
    weather_layer: "氣候層次", // show the weather layer overlay
    sun: "太陽", // sun level per tile
    rain: "雨", // rain level per tile
    plant_type: "植物", // the type of plant - carrot, corn, or tomato
    growth: "生長程度a", // growth level from 1-3
    carrots: "需要_蘿蔔", // [x] more carrots needed to fulfill win conditions
    tomatoes: "需要_番茄", // [x] more tomatoes needed to fulfill win conditions
    corn: "需要_玉米", // [x] more corn needed to fulfill win conditions
    you_win: "勝利", // win messsage
    main_menu: "主畫面", // go back to main menu
    overwrite_saves: "舊資料將會被刪除，確認？", // this will overwrite your saves, proceed?
}

export const languages = {"eng": eng, "swe": swe, "hebr": hebr, "chi": chi};