import Dataset from "./Dataset";
import JPEG2000 from "./decoder/JPEG2000";
import UncompressDecoderr from "./decoder/Uncompressed";

class PixelData {


    static async get(dataset:Dataset){
        const transferSyntaxUID = dataset.transferSyntaxUID;
        switch(transferSyntaxUID){
            case "1.2.840.10008.1.2.4.90":
                return await PixelData._getJPEG2000ImageCompression_LosslessOnly(dataset);
            case "1.2.840.10008.1.2":
            case "1.2.840.10008.1.2.1":
            case "1.2.840.10008.1.2.2":
            case "1.2.840.10008.1.2.1.99":
            default:
                return PixelData._getUncompressed(dataset);
        }
    }

    private static _getUncompressed(dataset:Dataset){
        const bitsAllocated = dataset.pixelModule.bitsAllocated || 1;
        const pixelRepresentation = dataset.pixelModule.pixelRepresentation || 0;

        
        const pixelDataViews =  PixelData._getixelDataViews(dataset);
        return  pixelDataViews.map((dataView:DataView)=>{
            return UncompressDecoderr.decode({
                pixelData:dataView,
                bitsAllocated,
                pixelRepresentation,
                littleEndian:dataset.littleEndian,
                dataset:dataset,
            });
        });
        
    }

    private static async _getJPEG2000ImageCompression_LosslessOnly(dataset:Dataset){
        const bitsAllocated = dataset.pixelModule.bitsAllocated || 1;
        const pixelRepresentation = dataset.pixelModule.pixelRepresentation || 0;

        const pixelDataViews =  PixelData._getixelDataViews(dataset);
        return Promise.all(pixelDataViews.map(async (dataView:DataView)=>{
            return await JPEG2000.decode({
                pixelData:dataView,
                bitsAllocated,
                pixelRepresentation,
                littleEndian:dataset.littleEndian,
                dataset:dataset,
            });
        }));
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
                    break;;
                }
                const len = dataset.dataView.getUint32(offset,dataset.littleEndian);
                offset +=4;
                if(len !== 0){
                    const dataView = new DataView(dataset.dataView.buffer.slice(offset,offset+len));
                    pixelDatas.push(dataView);
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
