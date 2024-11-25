import Dataset from "./Dataset";
import Tag from "./Tag";
import Value from "./Value";
import { Tags } from "./types";
import pako from "pako";

class Parser {

    private arrayBuffer;
    private offset:number;
    private dataView:DataView;
    private tags:Tags = {};
    private dataSet:Dataset|undefined;
    private EXEPTED = ["OB", "OW", "SQ", "UN"];
    private VRS = ["AE", "AS", "AT", "CS", "DA", "DS", "DT", "FL", "FD", "IS", "LO", "LT", "OB", "OD", "OF", "OW", "PN", "SH", "SL", "SS", "ST", "TM", "UI", "UL", "UN", "US", "UT", "UC"];
    private IMPLICT_TRANSFER_SYNTAXES = ["1.2.840.10008.1.2"];
    private BIG_ENDIAN_TRANSFER_SYNTAXES = ["1.2.840.10008.1.2.2"];
    private DEFLATED_TRANSFER_SYNTAXES = ["1.2.840.10008.1.2.1.99"];
    private littleEndian:boolean=true;
    private implicit:boolean=false;
    private transferSyntaxUID:string = "";
    private UNDEFIENED_LEN:number = 0xffffffff;
    private inflated:boolean = false;

    constructor(arrayBuffer:ArrayBuffer){
        this.offset = 0;
        this.arrayBuffer = arrayBuffer;
        this.dataView = new DataView(arrayBuffer);


        if(this.arrayBuffer.byteLength < 132){
            console.error("is not valid dicom file");
            return;
        }

        const prefix =Value.getString(new Uint8Array(arrayBuffer,128,4));
        if(prefix !== 'DICM'){
            console.error("is not valid dicom file");
            return;
        }

        this.offset = 132;

        this.parse();
        
    }


    parse(){
        this.getNextTag();
        this.dataSet = new Dataset(this.tags,this.arrayBuffer);
        console.log(this.dataSet)
        this.dataSet.transferSyntaxUID = this.transferSyntaxUID;
        return this.dataSet;
    }

    getDataset(){
        return this.dataSet;
    }

    getNextTag():void{

        if(this.offset >= this.arrayBuffer.byteLength){
            return;
        }
        

        const {group,element} = this.getNextGroupAndElement();
        if(!group && !element){
            return;
        }

        if(group === 0xFFFE && (element === 0xE0DD  || element === 0xE00D || element === 0xE000)){
            this.offset += 4;
            return this.getNextTag();
        }

        if(!this.implicit && group!==0x0002 && this.IMPLICT_TRANSFER_SYNTAXES.includes(this.transferSyntaxUID)){
            this.implicit = true;
        }

        if(this.littleEndian && group!==0x0002 && this.BIG_ENDIAN_TRANSFER_SYNTAXES.includes(this.transferSyntaxUID)){
            this.littleEndian = false;
        }

        if( !this.inflated && group!==0x0002 && this.DEFLATED_TRANSFER_SYNTAXES.includes(this.transferSyntaxUID)){
            this.offset -= 4;
            const meta = this.dataView.buffer.slice(0,this.offset);
            const body = this.dataView.buffer.slice(this.offset);
            const infaltedBody = pako.inflateRaw(body);
            this.arrayBuffer = this.concatArrayBuffers(meta,infaltedBody);
            this.dataView = new DataView(this.arrayBuffer);
            this.inflated = true;
            return this.getNextTag();
        }

        const vr = this.getNextVR(group,element);
        let len=0;
        
        
        if(this.implicit){
            len = this.dataView.getUint32(this.offset,this.littleEndian);
            this.offset += 4;
        }
        else if(this.EXEPTED.includes(vr)){
            this.offset += 2; // skip 2 byte reserved
            len = this.dataView.getUint32(this.offset,this.littleEndian);
            this.offset += 4;
        }else if(this.VRS.includes(vr)){
            len = this.dataView.getUint16(this.offset,this.littleEndian);
            this.offset += 2;
        }else if((!vr || !vr.match(/^[A-Z]{2}$/)) && group===0x0002 && element===0x0000){
            console.log("pyz");
            this.offset = 132;
            this.tags = {};
            this.implicit = true;
            return this.getNextTag();
        }else{
            console.log("ended",vr)
            return;
        }

        if(group===0x0002 && element===0x0010){
            console.log("transfer syntax uid",this.transferSyntaxUID);
            this.transferSyntaxUID = (Value.getString(new Uint8Array(this.arrayBuffer,this.offset,len))).replace('\0', '');
        }

        const tag = new Tag(group,element,vr,len,this.offset);
        const key = tag.generateKey();
        this.tags[key] = tag;
        

        if(vr === "SQ"){
            this.getNextTag();
        }else{
            this.offset += len;
            this.getNextTag();
        }
        

    }

    getValue(len:number){
        const value = this.arrayBuffer.slice(this.offset,len);
        this.offset += len;
        return value;
    }

    getNextGroupAndElement():{group:number,element:number}{
        try{
            const group = this.dataView.getUint16(this.offset,this.littleEndian) as number;
            this.offset +=2;
            const element = this.dataView.getUint16(this.offset,this.littleEndian) as number;
            this.offset +=2;
            return {group,element};
        }catch{
            return {group:0,element:0}
        }
    }

    getNextVR(groupInt:number,elementInt:number){
        if(this.implicit){
            return Tag.getTagVRFromDictionary(groupInt,elementInt) || "AA";
        }
        const vr = Value.getString(new Uint8Array(this.arrayBuffer,this.offset,2));
        this.offset +=2;
        return vr;
    }
    
    

    concatArrayBuffers = function (buffer1:ArrayBuffer, buffer2:ArrayBuffer) {
        var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
        tmp.set(new Uint8Array(buffer1), 0);
        tmp.set(new Uint8Array(buffer2), buffer1.byteLength)
        return tmp.buffer;
    };
    


}


export default Parser;