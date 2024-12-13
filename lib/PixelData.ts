import Dataset from "./Dataset";

class PixelData {


    static async getAll(dataset:Dataset){
        return PixelData._getixelDataViews(dataset);
    }

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
            let isBasic = true;
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
                
                const len = dataset.dataView.getUint32(offset,dataset.littleEndian);
                offset +=4;
                if(len !== 0 && !isBasic){
                    const dataView = new DataView(dataset.dataView.buffer.slice(offset,offset+len));
                    pixelDatas.push(dataView);
                }else if(isBasic){
                    isBasic=false;
                }
                offset += len;
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
