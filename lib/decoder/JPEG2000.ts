// @ts-ignore
import { JpxImage } from 'jpeg2000';
import { PixelDataDecodeOptions } from "../types";

class JPEG2000 {
    static decode(options:PixelDataDecodeOptions){

        console.log("ddss");

        let arrayBuffer = options.pixelData.buffer;
        let offset = options.pixelData.byteOffset;
        const length = options.pixelData.byteLength;
        
        return new Uint8Array(options.pixelData.buffer);
    

    }

}

export default JPEG2000;