
import PixelData from "./utils/PixelData";
import Tag from "./Tag";
import Value from "./Value";
import { DicomDate, DicomPatientModule, DicomPixelModule, DicomScalingModule, DicomTime, DicomVOILutModule, Tags } from "./types";
import PaletteColor from "./utils/PaletteColor";

class Dataset {
    
    static Float = "Float";
    static Integer = "Integer";

    /** duration of parse */
    start:number;
    end:number|undefined;

    tags:Tags;
    transferSyntaxUID:string = "1.2.840.10008.1.2";
    dataView:DataView;
    studyInstanceUID:string = "";
    studyID:string= "";
    seriesInstanceUID:string;	
    seriesNumber:number|string|undefined;
    studyDate:string|DicomDate;
    studyTime:number|DicomTime|string|undefined;
    littleEndian:boolean;
    accessionNumber:string;
    imageType:number|string|number[]|string[]|undefined;	
    modality:number|string|number[]|string[]|undefined;	
    seriesDescription:string;
    basicOffsetTable:number[]|undefined;

    /** modules */
    voiLUTModule:DicomVOILutModule;
    patientModule:DicomPatientModule;
    pixelModule:DicomPixelModule;
    scalingModule:DicomScalingModule;
    
    constructor(tags:Tags,dataView:DataView,littleEndian:boolean,start:number,end:number){
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
        this.voiLUTModule = this.getVOILutModule();
        this.patientModule = this.getPatientModule();
        this.pixelModule = this.getPixelModule();
        this.scalingModule = this.getScalingModule();
        this.start = start;
        this.end = end;
    }

    hasPixelData():boolean{
        if(
            this.tags['0x7FE00010'] 
            || this.tags['0x7FE00008'] 
            || this.tags['0x7FE00009']
        ){
            return true;
        }
        return false;
    }

    getPixelTypes(){
        if(
            this.tags['0x7FE00008'] 
            || this.tags['0x7FE00009']
        ){
            return Dataset.Float;
        }else if(this.tags['0x7FE00010'] ){
            return  Dataset.Integer;
        }
        return null;
    }

    async getPixelData(frame:number=0){
        return await PixelData.get(this,frame);
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
            samplesPerPixel:this.int(0x0028,0x0002),
            pixelDataProviderURL:this.get(0x0028,0x7FE0),
            pixelPaddingRangeLimit:this.get(0x0028,0x0121),
            extendedOffsetTable:this.get(0x7FE0,0x0001),
            extendedOffsetTableLengths:this.get(0x7FE0,0x0002),
            pixelAspectRatio:this.get(0x0028,0x0034),
            planarConfiguration:this.int(0x0028,0x0006),
            redPaletteColorLookupTableDescriptor:this.get(0x0028,0x1101),
            greenPaletteColorLookupTableDescriptor:this.get(0x0028,0x1102),
            bluePaletteColorLookupTableDescriptor:this.get(0x0028,0x1103),
            alphaPaletteColorLookupTableDescriptor:this.get(0x0028,0x1104),
            redPaletteColorLookupTableData:this.get(0x0028,0x1201),
            greenPaletteColorLookupTableData:this.get(0x0028,0x1202),
            bluePaletteColorLookupTableData:this.get(0x0028,0x1203),
            alphaPaletteColorLookupTableData:this.get(0x0028,0x1204),
            segmentedRedPaletteColorLookupTableData:this.get(0x0028,0x1221),
            segmentedGreenPaletteColorLookupTableData:this.get(0x0028,0x1222),
            segmentedBluePaletteColorLookupTableData:this.get(0x0028,0x1223),
            segmentedAlphaPaletteColorLookupTableData:this.get(0x0028,0x1224),
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
            const dateVaues = dateValue.split('-');
            return {
                year:dateVaues[0],
                month:dateVaues[1],
                day:dateVaues[2],
            };
        }
        return dateValue;
    }

    time(group:number,element:number){
        const dateValue = this.get(group,element);
        
        if(/^[0-9]{2}\:[0-9]{2}\:[0-9]{2}$/.exec(dateValue)){
            const dateVaues = dateValue.split(':');
            return {
                hour:dateVaues[0],
                minute:dateVaues[1],
                second:dateVaues[2],
            };
        }
        return dateValue;
    }

    int(group:number,element:number):number|undefined{
        const is = this.get(group,element);
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
        return this.getValue(group,element,'string') + "";
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

    getPaletteColorData(){
        return PaletteColor.get(this);
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


    
}

export default Dataset;