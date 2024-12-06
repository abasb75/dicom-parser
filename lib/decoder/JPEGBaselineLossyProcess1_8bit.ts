import { createElement } from "react";
import Dataset from "../Dataset";

class JPEGBaselineLossyProcess1_8bit{
    static async decode(pixelData:DataView,dataset:Dataset){
        if (
            dataset.pixelModule.bitsAllocated === 8 &&
            [3,4].includes(dataset.pixelModule.samplesPerPixel)
        ) {
            // decode with browser option.
            return JPEGBaselineLossyProcess1_8bit.browser(pixelData,dataset);
        }else{
            throw new Error('dicom parser not support your image!');
        }
    }


    static async browser(pixelData:DataView,dataset:Dataset){

        const createImage = (imageData)=>new Promise<HTMLImageElement>((resolve,reject)=>{
            var img = document.createElement('img');
            img.src = imageData;
            img.onload = ()=>{
                resolve(img);
            }
            img.onerror = ()=>{
                reject();
            }
        });

        var arrayBufferView = new Uint8Array( pixelData.buffer );
        var blob = new Blob( [ arrayBufferView ], { type: "image/jpeg" } );
        var urlCreator = window.URL || window.webkitURL;
        var imageUrl = urlCreator.createObjectURL( blob );
        const img = await createImage(imageUrl);

        const canvas = document.createElement('canvas') as HTMLCanvasElement;
        canvas.height = img.height;
        canvas.width = img.width;
        const context = canvas.getContext('2d');
        context.drawImage(img, 0, 0);

        const imageData = context.getImageData(0,0,img.width,img.height);
        return new Uint8Array(imageData.data.buffer);

    }
}

export default JPEGBaselineLossyProcess1_8bit;