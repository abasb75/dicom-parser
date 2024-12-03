import Draw from "./Draw";
import PixelData from "./PixelData";
import Tag from "./Tag";
import Value from "./Value";
import { DicomDate, DicomPatientModule, DicomPixelModule, DicomScalingModule, DicomTime, DicomVOILutModule, Tags } from "./types";

class Dataset {
    tags:Tags;
    transferSyntaxUID:string = "1.2.840.10008.1.2";
    dataView:DataView;
    studyInstanceUID:string = "";
    studyID:string= "";
    seriesInstanceUID:string;	
    seriesNumber:number|string|undefined;
    studyDate:string|DicomDate;
    studyTime:number|DicomTime|string|undefined;
    pixelRepresentation:number|string|undefined;
    littleEndian:boolean;
    pixeSpacing:number|number[]|string|undefined;
    accessionNumber:string;
    bitsAllocated:number|string|undefined;
    bitsStored:number|string|undefined;
    highBit:number|string|undefined;
    imageType:number|string|number[]|string[]|undefined;	
    modality:number|string|number[]|string[]|undefined;	
    seriesDescription:string
    rows:string|number|undefined;
    columns:string|number|undefined;
    patientSex:any;
    /** modules */
    voiLUTModule:DicomVOILutModule;
    patientModule:DicomPatientModule;
    pixelModule:DicomPixelModule;
    scalingModule:DicomScalingModule;
    constructor(tags:Tags,dataView:DataView,littleEndian:boolean){
        this.tags = tags;
        this.dataView = dataView;
        this.littleEndian = littleEndian;
        this.studyID = this.get(0x0020,0x0010) as string;
        this.studyInstanceUID = this.string(0x0020,0x000D);
        this.seriesInstanceUID = this.get(0x0020,0x000E);
        this.seriesNumber = this.get(0x0020,0x0011);
        this.studyDate = this.date(0x0008,0x0020);
        this.studyTime = this.time(0x0008,0x0030);
        this.accessionNumber = this.string(0x0008,0x0050);
        this.imageType = this.get(0x0008,0x0008);
        this.modality = this.get(0x0008,0x0060);
        this.seriesDescription = this.string(0x0008,0x103E);
        this.patientSex = this.get(0x0010,0x0040);
        this.voiLUTModule = this.getVOILutModule();
        this.patientModule = this.getPatientModule();
        this.pixelModule = this.getPixelModule();
        this.scalingModule = this.getScalingModule();
    }

    async getPixelData(){
        return await PixelData.get(this);
    }

    getVOILutModule():DicomVOILutModule{
        return {
            voiLUTFunction:this.get(0x0028,0x1056),
            windowWidth:this.int(0x0028,0x1051),
            windowCenter:this.int(0x0028,0x1050),
            voiLUTSequence:this.get(0x0028,0x3010),
            lutDescriptor:this.get(0x0028,0x3002),
            lutExplanation:this.get(0x0028,0x3003),
            lutData:this.get(0x0028,0x3006),
            windowCenterAndWidthExplanation:this.get(0x0028,0x1055),
        }
    }

    getPatientModule():DicomPatientModule{
        return {
            patientName:this.get(0x0010,0x0010),
            patientID:this.get(0x0010,0x0020),
            typeofPatientID:this.get(0x0010,0x0022),
            patientSex:this.get(0x0010,0x0040),
            patientBirthDate:this.get(0x0010,0x0030),
            patientAge:this.get(0x0010,0x1010),
            patientSize:this.get(0x0010,0x1020),
            otherPatientIDs:this.get(0x0010,0x1000),
            otherPatientNames:this.get(0x0010,0x1001),
            patientWeight:this.get(0x0010,0x1030),
        }	

    }

    getPixelModule():DicomPixelModule{
        return {
            photometricInterpretation:this.get(0x0028,0x0004),
            numberOfFrames:this.int(0x0028,0x0008),
            pixelRepresentation : this.int(0x0028,0x0103),
            pixeSpacing:this.get(0x0028,0x0030),
            rows:this.int(0x0028,0x0010),
            columns:this.int(0x0028,0x0011),
            bitsAllocated:this.int(0x0028,0x0100),
            highBit:this.int(0x0028,0x0102),
            bitsStored:this.int(0x0028,0x0101),
            samplesPerPixel:this.int(0x0028,0x0002)
        }
    }

    getScalingModule():DicomScalingModule{
        return {
            rescaleSlope:this.int(0x0028,0x1053), 
            rescaleIntercept:this.int(0x0028,0x1052), 
            modality:this.modality as string,
        }
    }

    date(group:number,element:number){
        const dateValue = this.get(group,element);
        
        if(/^[0-9]{4}\-[0-9]{2}\-[0-9]{2}$/.exec(dateValue)){
            console.log('dateValue1',dateValue);
            const dateVaues = dateValue.split('-');
            return {
                year:dateVaues[0],
                month:dateVaues[1],
                day:dateVaues[2],
            };
        }
        console.log('dateValue',dateValue);
        return dateValue;
    }

    time(group:number,element:number){
        const dateValue = this.get(group,element);
        
        if(/^[0-9]{2}\:[0-9]{2}\:[0-9]{2}$/.exec(dateValue)){
            console.log('dateValue1',dateValue);
            const dateVaues = dateValue.split(':');
            return {
                hour:dateVaues[0],
                minute:dateVaues[1],
                second:dateVaues[2],
            };
        }
        console.log('dateValue',dateValue);
        return dateValue;
    }

    int(group:number,element:number):number|undefined{
        const is = this.get(group,element);
        console.log("int to pix",is,);
        if(typeof is === "number"){
            return is;
        }else if(Array.isArray(is) && typeof is[0] === "number"){
            return is[0] as number;
        }else{
            return undefined;
        }
    }

    get(group:number,element:number){
        const value = this.getValue(group,element) as string;
        return value;
    }

    string(group:number,element:number):string{
        return this.getValue(group,element) + "";
    }

    getValue(element:number|string,elementId?:number|string,vr?:string){

        if(!element && !elementId){
            return "";
        }
        let _group,_element = "";
        if(typeof element === 'string' && element.length >= 8){
            const el = element.replace(/^0[xX]/,'');
            if(el.length !== 8){
                return "";
            }
            _group = el.slice(0,3);
            _element = el.slice(4,7);
        }else if(typeof element === 'number' && element > 0xffff) {
            const el = Tag.intTo4digitString(element);
            _group = el.slice(0,3);
            _element = el.slice(4,7);
        }else{
            _group = this._reformatToString(element);
            _element = this._reformatToString(elementId);
            if(!_group || !_element) return "";
        }

        const key = `0x${_group}${_element}`;
        if(!this.tags[key]){
            return "";
        }
        const _vr = vr || this.tags[key]?.vr || Tag.getTagVRFromDictionary(_group,_element) || "AA";
        return this._getValue(this.tags[key],_vr);

    }

    private _getValue(tag:Tag,vr:string="AA"){
        const offset = tag.offset;
        if(!offset) return "";
        const len = tag.valueLength;
        const value = Value.byVr(this.dataView,offset,len,vr,this.littleEndian);
        tag.value = value;
        return value;
    }

    private _reformatToString(input:number|string|undefined):string{
        if(!input) return "";
        if(typeof input === "string"){
            return input.replace(/^0[xX]/,'');
        }
        return Tag.intTo4digitString(input);
    }

    async draw(canvas:HTMLCanvasElement){
        const pixelDatas = await this.getPixelData();
        if(pixelDatas){
            //@ts-ignore
            Draw.draw(canvas,pixelDatas,this);
        }
    }
    
}

export default Dataset;