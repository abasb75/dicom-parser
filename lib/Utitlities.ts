import { PixelArray } from "./types";


class Utilities{

    static getMinMax(pixelData:PixelArray){
        let min=pixelData[0];
        let max=pixelData[0];
        for(let i=0;i<pixelData.length;i++){
            if(pixelData[i]<min) min=pixelData[i];
            if(pixelData[i]>max) max=pixelData[i];
        }
        return {min,max}
    }

    static getLUTwithMinMax(min:number,max:number){
        const windowWidth = max - min
        const windowCenter = min + windowWidth / 2
        return {windowWidth,windowCenter}
    }

}

export default Utilities;