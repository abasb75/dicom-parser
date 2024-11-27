import Dataset from "./Dataset";
import Utilities from "./Utitlities";
import { PixelArray } from "./types";

class Draw {

    static draw(canvas:HTMLCanvasElement,pixelDatas:PixelArray[],dataset:Dataset){
        
        if(!pixelDatas.length) return;

        const pixelData = pixelDatas[0];
        const {min,max,windowCenter,windowWidth} = Draw._getLUT(pixelData,dataset);
        console.log('lut',min,max,windowCenter,windowWidth)
        canvas.width = dataset.pixelModule.columns || 0;
        canvas.height= dataset.pixelModule.rows || 0;



        console.log( canvas.width *  canvas.height  , pixelData.length)

        const context = canvas.getContext('2d');
        const imageData = context?.createImageData(canvas.width,canvas.height);
                  
        if(imageData){
            for(var i = 0; i < pixelData.length; i++) {
                imageData.data[4*i] = Draw._calcPixel(pixelData[i],min,max,windowWidth,windowCenter);
                imageData.data[4*i+1] = Draw._calcPixel(pixelData[i],min,max,windowWidth,windowCenter);
                imageData.data[4*i+2] = Draw._calcPixel(pixelData[i],min,max,windowWidth,windowCenter);
                imageData.data[4*i+3] = 255;
            }
            context?.putImageData(imageData,0,0);
        }

    }

    private static _getLUT(pixelData:PixelArray,dataset:Dataset){
        if(dataset.voiLUTModule.windowCenter && dataset.voiLUTModule.windowWidth){
            const windowWidth = dataset.voiLUTModule.windowWidth;
            const windowCenter = dataset.voiLUTModule.windowCenter;
            return {
                windowWidth,
                windowCenter,
                max:windowCenter - 0.5 + windowWidth / 2,
                min:windowCenter - 0.5 - windowWidth / 2,
            }
        }
        const {min,max} =  Utilities.getMinMax(pixelData);
        const windowWidth = max - min;
        const windowCenter = min + windowWidth / 2  - 0.5;
        return {
            min,
            max,
            windowWidth,
            windowCenter,
        }
    }

    private static _calcPixel(pixel:number,min:number,max:number,windowWidth:number,windowCenter:number){
        if(max <= pixel) return 255;
        else if( min >= pixel) return 0;
        else return (Math.round(pixel - windowCenter - 0.5)/(windowWidth-1)+0.5)*255;
    }

}

export default Draw;