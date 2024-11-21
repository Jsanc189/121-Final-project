function coinflip(weight = 5, range = 10){
    let rand = Math.floor(Math.random() * range);
    return rand <= weight;
}

export class Weather {
    constructor(options = {}){
        this.seed = (options.seed) ? options.seed : Math.random();
        this.sample = (options.sample) ? options.sample : 5;
        this.multiplier = (options.multiplier) ? options.multiplier : 100;
        this.isSunny = (options.isSunny !== undefined) ? options.isSunny : coinflip();
    }
}

export class TileWeather extends Weather{
    constructor(i, j, weather){
        super(structuredClone(weather));
        this.i = i;
        this.j = j;
    }

    generate(){
        // there will be the most of this type of weather
        let primary = this.perlinValue(this.seed, this.multiplier);
    
        // and the least of this type
        let secondary = this.perlinValue(this.seed / 2, this.multiplier / 3);
        if(primary !== 0){
            secondary = Math.floor(secondary / primary);
            secondary = coinflip() ? 0 : secondary;
        }

        let weather = {
            sun: (this.isSunny) ? primary : secondary,
            rain: (this.isSunny) ? secondary : primary,
        }
        
        return weather;
    }

    perlinValue(seed, mult){
        noise.seed(seed);
        let pVal = Math.abs(noise.perlin2(this.i / this.sample, this.j / this.sample));
        pVal *= mult;
        pVal = Math.floor(pVal)
    
        return pVal;
    }
}