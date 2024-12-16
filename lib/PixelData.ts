import Dataset from "./Dataset";
import Tag from "./Tag";


interface Fragment {
    offset:number;
    len:number
}

class PixelData {
    
    // static MAGICS = [
    //     // JPEG
    //     [0xFF,0xD8,0xFF,0xE0],
    //     // JPEG 2000
    //     [0x00,0x00,0x00,0x0C,0x6A,0x50,0x20,0x20,0x0D,0x0A,0x87,0x0A],
    //     [0xFF,0x4F,0xFF,0x51],

    //     // JPEG-LS
    //     []
    // ]

    static async get(dataset:Dataset,frame:number=0){
        const pixelData = PixelData._getixelDataViews(dataset,frame);
        return pixelData;
    }

    private static _getixelDataViews(dataset:Dataset,frameIndex:number):DataView{
        const pixelDataElement = dataset.tags['0x7FE00010'] || dataset.tags['0x7FE00008'] || dataset.tags['0x7FE00009'];
        
        const numberOfFrames = dataset.pixelModule.numberOfFrames || 1;
        if(pixelDataElement.valueLength === 0xFFFFFFFF){
            return PixelData._encapsulatePixelDatas(dataset,pixelDataElement,frameIndex);
        }else{
            const frameLen = pixelDataElement.valueLength/numberOfFrames;
            const offset = pixelDataElement.offset + (frameLen * frameIndex);
            return new DataView(dataset.dataView.buffer.slice(offset,offset+frameLen))
        }

    }

    private static _encapsulatePixelDatas(dataset:Dataset,pixelDataElement:Tag,frameIndex:number){
        if(!dataset.basicOffsetTable){
            dataset.basicOffsetTable =  PixelData._makeBasicOffsetTable(dataset,pixelDataElement);
        }

        if(!dataset.basicOffsetTable || dataset.basicOffsetTable.length-1 < frameIndex){
            throw new Error("not frame index found.");
        }

        let offset = dataset.basicOffsetTable[frameIndex];
        const nextFrameOffset = dataset.basicOffsetTable.length>frameIndex+1 ? dataset.basicOffsetTable[frameIndex+1] : -1;

        const fragments = [];
        while(true){
            if(nextFrameOffset>0 && offset >= nextFrameOffset){
                break;
            }

            const group = dataset.dataView.getUint16(offset,dataset.littleEndian) as number;
            offset +=2;
            const element = dataset.dataView.getUint16(offset,dataset.littleEndian) as number;
            offset +=2;
            if(group !==0xFFFE || element !== 0xE000){
                break;
            }
            const len = dataset.dataView.getUint32(offset,dataset.littleEndian);
            offset += 4;
            fragments.push(
                dataset.dataView.buffer.slice(offset,offset+len),
            );
            offset += len;
        }

        if(fragments.length < 1){
            throw new Error("image not created");
        }

        let buffer = fragments[0];
        for(let i=1;i<fragments.length;i++){
            buffer = PixelData._concatArrayBuffers(buffer,fragments[i]);
        }

        return new DataView(buffer);
        
    }

    private static _concatArrayBuffers(buffer1:ArrayBuffer, buffer2:ArrayBuffer) {
        var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
        tmp.set(new Uint8Array(buffer1), 0);
        tmp.set(new Uint8Array(buffer2), buffer1.byteLength)
        return tmp.buffer;
    };

    private static _makeBasicOffsetTable(dataset:Dataset,pixelDataElement:Tag){
        let offset = pixelDataElement.offset;
        const group = dataset.dataView.getUint16(offset,dataset.littleEndian) as number;
        offset +=2;
        const element = dataset.dataView.getUint16(offset,dataset.littleEndian) as number;
        offset +=2;
        if(group !== 0xFFFE && element !== 0xE000){
            throw new Error("is not basic table");
        }
        const len = dataset.dataView.getUint32(offset,dataset.littleEndian);
        offset += 4;
        
        const basicOffsetTable = [];
        const basicOffsetIndex = offset + len;

        
        if(len > 0){
            for(let i=0; i<len; i+=4){
                basicOffsetTable.push(
                    basicOffsetIndex + dataset.dataView.getUint16(offset,dataset.littleEndian) as number
                );
                offset +=4;
            }
            return basicOffsetTable;
        }

        const basicOffsetTableElement = dataset.tags['0x7FE00001'];
        if(basicOffsetTableElement && basicOffsetTableElement.valueLength>0){
            for(let i=0; i<len; i+=4){
                offset = basicOffsetTableElement.offset;
                basicOffsetTable.push(
                    basicOffsetIndex + dataset.dataView.getUint16(offset,dataset.littleEndian) as number
                );
                offset +=4;
            }
            return basicOffsetTable;
        }

        const numberOfFrames = dataset.pixelModule.numberOfFrames || 1;
        if(numberOfFrames === 1){
            return [basicOffsetIndex];
        }

        const fragments = this._makeFragments(dataset,basicOffsetIndex);
        if(fragments.length === numberOfFrames){
            return fragments.map(fragment=>fragment.offset);
        }

        return PixelData._makeBasicOfsetTableForJPEGImages(dataset,fragments);

    }

    private static _makeBasicOfsetTableForJPEGImages(dataset:Dataset,fragments:Fragment[]){
        const basicOffsetTable:number[] = [];
        for(let i=0;i<fragments.length;i++){
            const fragment = fragments[i];
            if(
                PixelData._isJPEG(fragment.offset+8,dataset.dataView) 
                || PixelData._isJPEG2000(fragment.offset+8,dataset.dataView) 
            ){
                basicOffsetTable.push(fragment.offset);
                console.log('magics is jpeg/jpeg2000');
            }
        }
        return basicOffsetTable;
    }

    private static _isJPEG(position:number,dataView:DataView) {
        const magic1 = dataView.getUint8(position);
        const magic2 = dataView.getUint8(position+1);
        if(magic1===0xFF && magic2 === 0xD8){
            return true;
        }
        return false;
    }

    private static _isJPEG2000(position:number,dataView:DataView) {

        const magics2 = [0xFF,0x4F,0xFF,0x51];
        console.log('magics2',magics2);
        for(let i=0;i<magics2.length;i++){
            const finded = dataView.getUint8(position+i);
            console.log(finded);
            if(finded !== magics2[i]){
                break;
            }else if(i===magics2.length-1){
                return true;
            }
        }

        const magics = [0x00,0x00,0x00,0x0C,0x6A,0x50,0x20,0x20,0x0D,0x0A,0x87,0x0A];
        for(let i=0;i<magics.length;i++){
            const finded = dataView.getInt8(position+i);
            if(finded !== magics[i]){
                break;
            }else if(i===magics2.length-1){
                return true;
            }
        }

        return false;
    }


    private static _makeFragments(dataset:Dataset,basicOffsetIndex:number){
        const fragments:Fragment[] = [];
        let offset = basicOffsetIndex;
        const dataView = dataset.dataView;
        while(true){
            console.log(offset,dataView.byteLength)
            if(offset>=dataView.byteLength+8){
                break;
            }
            const group = dataset.dataView.getUint16(offset,dataset.littleEndian) as number;
            offset +=2;
            const element = dataset.dataView.getUint16(offset,dataset.littleEndian) as number;
            offset +=2;
            if(group !== 0xFFFE || element !== 0xE000){
                break;
            }
            const len = dataset.dataView.getUint16(offset,dataset.littleEndian);
            offset += 4;
            const fragment = {
                offset:offset-8,
                len,
            }
            fragments.push(fragment);
            offset += len;
        }
        return fragments;
    }

   



}

export default PixelData;
