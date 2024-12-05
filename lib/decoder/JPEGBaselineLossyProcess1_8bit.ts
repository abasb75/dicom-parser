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
        }
    }


    static async browser(pixelData:DataView,dataset:Dataset){
        const imgBlob = new Blob([pixelData], { type: 'image/jpeg' });
        console.log('imgBlob',imgBlob);

        const fileReader = new FileReader();

        if (fileReader.readAsBinaryString === undefined) {
        fileReader.readAsArrayBuffer(imgBlob);
        } else {
        fileReader.readAsBinaryString(imgBlob); // doesn't work on IE11
        }

        fileReader.onload = function () {
            const img = new Image();

            img.onload = function () {
                const canvas = document.createElement('canvas') as HTMLCanvasElement;
                canvas.height = img.height;
                canvas.width = img.width;
                const context = canvas.getContext('2d');

                context.drawImage(this as any, 0, 0);
                const imageData = context.getImageData(0, 0, img.width, img.height);
                const end = new Date().getTime();

                const  pixelData = new Uint8Array(imageData.data.buffer);
            };


            if (fileReader.readAsBinaryString === undefined) {
                img.src = `data:image/jpeg;base64,${window.btoa(
                    arrayBufferToString(fileReader.result as ArrayBuffer)
                )}`;
            } else {
                    img.src = `data:image/jpeg;base64,${window.btoa(
                    fileReader.result as string
            )}`; 
      }
    };

    }
}

export default JPEGBaselineLossyProcess1_8bit;