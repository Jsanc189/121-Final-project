export function weather(options){
    const { width, height, sample = 5, sunWeight = 5,
        largerRange = 100, smallerRange = 33 } = options;
    
    let sunny = coinflip(sunWeight);

    // assign multipliers based on whether coinflip 
    //      determined the day to be sunny or not
    let sunMult = (sunny === true) ? largerRange : smallerRange;
    let rainMult = (sunny === true) ? smallerRange : largerRange;

    let sun = new PerlinGrid(sample, sunMult, width, height);
    let rain = new PerlinGrid(sample, rainMult, width, height);

    if(sunny === true){
      sun.generate();            
      rain.generate(sun, 3, 10); 
    } else {
      rain.generate();           
      sun.generate(rain, 3, 10); 
    }

    return{
        "sun": sun,
        "rain": rain
    }
}

class PerlinGrid{
    constructor(sample, multiplier, width, height){
        this.sample = sample;
        this.multiplier = multiplier;

        this.seed = Math.random();

        this.grid = (height) ? new Array(height) : new Array(width);
        for (let i = 0; i < this.grid.length; i++) {
            this.grid[i] = new Array(width).fill(0);
        }
    }

    generate(reference, overlapWeight = 5, overlapRange = 10){
        noise.seed(this.seed);
        let sample = this.sample;
        let multiplier = this.multiplier;

        let result = [];
        for(let i = 0; i < this.grid.length; i++){
            result[i] = [];
            for(let j = 0; j < this.grid[i].length; j++){
                let pVal = Math.abs(noise.perlin2(i / sample, j / sample));
                pVal *= multiplier;
                pVal = Math.floor(pVal)
                
                if(reference){
                    let ref = reference.grid[i][j];
                    if(ref === 0){
                        result[i][j] = pVal;
                    } else {
                        pVal = Math.floor(pVal / ref);
                        result[i][j] = coinflip(overlapWeight, overlapRange) ? 0 : pVal;
                    }
                } else {
                    result[i][j] = pVal;
                } 
            }
        }
        this.grid = result;
    }

    toString(){
        return printGrid(this.grid);
    }
}

function printGrid(grid){
    let result = "";
    for(let i = 0; i< grid.length; i++){
        for(let j = 0; j < grid[i].length; j++){
            if(grid[i][j] === 0){
                result += `   `;
            } else {
                result += `${grid[i][j]}`.padStart(2, " ");
                result += ` `;
            }
        }
        result += `\n`;
    }
    return result;
}

function coinflip(weight = 5, range = 10){
    let rand = Math.floor(Math.random() * range);
    return rand <= weight;
}
