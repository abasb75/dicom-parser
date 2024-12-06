import Dataset from "./Dataset";
import Tag from "./Tag";

class PixelData {


    static async get(dataset:Dataset,frame:number=0){
        const pixelDatas = PixelData._getixelDataViews(dataset);
        if(frame > pixelDatas.length){
            throw new Error(`Frame ${frame} not found.`);
        }
        return pixelDatas[frame];

        
    }

    private static _getixelDataViews(dataset:Dataset):DataView[]{
        const pixelData = dataset.tags['0x7FE00010'] || dataset.tags['0x7FE00008'] || dataset.tags['0x7FE00009'];
        const pixelDatas:DataView[] = [];
        const numberOfFrames = dataset.pixelModule.numberOfFrames || 1;
        if(pixelData.valueLength === 0xFFFFFFFF){
            let offset = pixelData.offset;
            while(true){
                if(offset>=dataset.dataView.byteLength){
                    break;
                }
                const group = dataset.dataView.getUint16(offset,dataset.littleEndian) as number;
                offset +=2;
                const element = dataset.dataView.getUint16(offset,dataset.littleEndian) as number;
                offset +=2;
                
                if(group !== 0xFFFE && element !== 0xE000){
                    break;
                }else{
                   
                }
                console.log('group',Tag.intTo4digitString(group));
                console.log('element',Tag.intTo4digitString(element));
                const len = dataset.dataView.getUint32(offset,dataset.littleEndian);
                offset +=4;
                if(len !== 0){
                    console.log('element is 2',len)
                    if(len>4){
                        const dataView = new DataView(dataset.dataView.buffer.slice(offset,offset+len));
                        pixelDatas.push(dataView);
                    }else{
                        offset -4;
                    }
                    offset += len;
                }
            }
        }else{
            const frameLen = pixelData.valueLength/numberOfFrames;
            for(let i=0;i<numberOfFrames;i++){
                const offset = pixelData.offset + (frameLen * i);
                const dataView = new DataView(dataset.dataView.buffer.slice(offset,offset+frameLen));
                pixelDatas.push(dataView);
            }
        }
        return pixelDatas;
    }

}

export default PixelData;
