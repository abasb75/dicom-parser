import Dataset from "../Dataset";
import { PaletteColorData, PaletteColorDataColor } from "../types";

class PaletteColor {

    static get(dataset:Dataset):PaletteColorData|undefined{


        const {

            redPaletteColorLookupTableData,
            redPaletteColorLookupTableDescriptor,
            segmentedRedPaletteColorLookupTableData,

            greenPaletteColorLookupTableData,
            greenPaletteColorLookupTableDescriptor,
            segmentedGreenPaletteColorLookupTableData,

            bluePaletteColorLookupTableData,
            bluePaletteColorLookupTableDescriptor,
            segmentedAlphaPaletteColorLookupTableData,

            alphaPaletteColorLookupTableData,
            alphaPaletteColorLookupTableDescriptor,
            segmentedBluePaletteColorLookupTableData,

            bitsAllocated,

        } = dataset.pixelModule;

        if(!bitsAllocated || ![8,16].includes(bitsAllocated)) {
            return undefined;
        }

        const littleEndian = dataset.littleEndian;

        const red = PaletteColor.getData(
            redPaletteColorLookupTableDescriptor as number[]|undefined,
            redPaletteColorLookupTableData,
            segmentedRedPaletteColorLookupTableData,
            bitsAllocated,
            littleEndian,
        );

        const green = PaletteColor.getData(
            greenPaletteColorLookupTableDescriptor as number[]|undefined,
            greenPaletteColorLookupTableData,
            segmentedGreenPaletteColorLookupTableData,
            bitsAllocated,
            littleEndian,

        );
        const blue = PaletteColor.getData(
            bluePaletteColorLookupTableDescriptor as number[]|undefined,
            bluePaletteColorLookupTableData,
            segmentedBluePaletteColorLookupTableData,
            bitsAllocated,
            littleEndian
        );
        const alpha = PaletteColor.getData(
            alphaPaletteColorLookupTableDescriptor as number[]|undefined,
            alphaPaletteColorLookupTableData,
            segmentedAlphaPaletteColorLookupTableData,
            bitsAllocated,
            littleEndian,
        );


        return {
            red,
            green,
            blue,
            alpha,
        }
    }


    private static getData(
        descriptor:number[]|undefined,
        paletteData:DataView|undefined,
        segmentedPaletteData:DataView|undefined,
        bitsAllocated:number,
        littleEndian:boolean,
    ):PaletteColorDataColor|undefined{
        
        if(
            !Array.isArray(descriptor) 
            || descriptor.length < 3
        ){
            return undefined;
        }

        let tableDataArray = null;

        const lutEntries = descriptor[0] || Math.pow(2,16);
        const firstInputValueMapped = descriptor[1];
        const bitsPerEntry = descriptor[2];
        if(![8,16].includes(bitsPerEntry)) {
            return undefined;
        }

        if(paletteData){
            tableDataArray = bitsPerEntry===16 
            ? PaletteColor.get16Array(paletteData,bitsAllocated,littleEndian) 
            : PaletteColor.get8Array(paletteData);
        }else if(segmentedPaletteData){
            const segmentedTableDataArray = bitsPerEntry===16 
            ? PaletteColor.get16Array(segmentedPaletteData,bitsAllocated,littleEndian) 
            : PaletteColor.get8Array(segmentedPaletteData);
            tableDataArray = PaletteColor.segmentedDataToData(segmentedTableDataArray,lutEntries)?.tableData;
            
        }

        if(!tableDataArray){
            return undefined;
        }
        
        return {
            data:tableDataArray,
            firstInputValueMapped,
            lutEntries,
            bitsPerEntry
        }
    }

    private static get16Array(
        paletteData:DataView,
        bitsAllocated:number,
        littleEndian:boolean
    ){
        const array:number[] = [];
        for(let i=0;i<paletteData.byteLength;i+=2){
            if(bitsAllocated === 8){
                array.push(paletteData.getUint16(i,littleEndian) >> 8);
            }else{
                array.push(paletteData.getUint16(i,littleEndian));
            }
            
        }
        return array;
    }

    private static get8Array(paletteData:DataView){
        const array:number[] = [];
        for(let i=0;i<paletteData.byteLength;i++){
            array.push(paletteData.getUint8(i));
        }
        return array;
    }

    private static segmentedDataToData(
        segmentedTableData:number[],
        lutEntries:number,
        segmentedTableDataOffset?:number,
        valuedTableData?:number[],
        valuedTableDataOffset?:number, 
        stopIndex?:number,
        prevLastValue?:number,
    ){
        let tableData = valuedTableData 
            ? valuedTableData : new Array(lutEntries);
        let segmentedDataOffset = segmentedTableDataOffset || 0;
        let tableDataOffset = valuedTableDataOffset || 0;
        let lastValue:undefined|number = prevLastValue || undefined;

        while(segmentedDataOffset < (stopIndex || segmentedTableData.length)){
            const op = segmentedTableData[segmentedDataOffset];
            segmentedDataOffset++;
            const len = segmentedTableData[segmentedDataOffset];
            segmentedDataOffset++;
            if(op===2){
                console.log({op});
            }
            switch(op){
                case 0:
                    for(let i=0;i<len;i++){
                        tableData[tableDataOffset] = segmentedTableData[segmentedDataOffset];
                        segmentedDataOffset++;
                        tableDataOffset++;
                    }
                    lastValue = tableData[segmentedDataOffset-1] & 0xFFFF;
                    break;
                case 1:
                    if(typeof lastValue !== "number"){
                        return null;
                    }
                    const newValue = segmentedTableData[segmentedDataOffset];
                    segmentedDataOffset++;
                    for (let i = 1; i <= len; i++){
                        tableData [tableDataOffset] = (lastValue + ((newValue - lastValue) / len));
                        tableDataOffset++;
                    }
                    lastValue = newValue & 0xFFFF;
                    break;
                case 2: // untested
                    if(typeof lastValue !== "number"){
                        return null;
                    }
                    const startPosition = (segmentedTableData[segmentedDataOffset] & 0xffff) 
                        | ((segmentedTableData[segmentedDataOffset+1] & 0xffff)  << 16);
                    segmentedDataOffset +=2;
                    const res = PaletteColor.segmentedDataToData(
                        segmentedTableData,
                        lutEntries,
                        startPosition,
                        tableData,
                        tableDataOffset,
                        startPosition+len,
                        lastValue,
                    );
                    lastValue = res?.lastValue;
                    tableData = res?.tableData as number[];
                    segmentedDataOffset = res?.segmentedDataOffset as number;
                    tableDataOffset = res?.tableDataOffset as number;
                    break;
                default:
                    return null;
            }
        }
        return {tableData,lastValue,segmentedDataOffset,tableDataOffset};
    }

    

}

export default PaletteColor;