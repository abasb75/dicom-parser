import Tag from "./Tag";
import Value from "./Value";
import { Tags } from "./types";

class Dataset {
    tags:Tags;
    transferSyntaxUID:string = "1.2.840.10008.1.2";
    dataView:DataView;
    studyInstanceUID:string = "";
    studyID:string= "";
    numberOfFrames:number|undefined;
    windowWidth:number|string|undefined;
    windowCenter:number|string|undefined;
    seriesInstanceUID:string;	
    seriesNumber:number|string|undefined;
    studyDate:string;
    studyTime:number|string|undefined;
    pixelRepresentation:number|string|undefined;
    littleEndian:boolean;
    pixeSpacing:number|number[]|string|undefined;
    accessionNumber:string;
    bitsAllocated:number|string|undefined;
    imageType:number|string|number[]|string[]|undefined;	
    modality:number|string|number[]|string[]|undefined;	
    seriesDescription:string
    rows:string|number|undefined;
    columns:string|number|undefined;
    patientSex:any;
    patientAge:string;
    constructor(tags:Tags,dataView:DataView,littleEndian:boolean){
        this.tags = tags;
        this.dataView = dataView;
        this.littleEndian = littleEndian;
        this.studyID = this.get(0x0020,0x0010) as string;
        this.studyInstanceUID = this.string(0x0020,0x000D);
        this.numberOfFrames = this.int(0x0028,0x0008);
        this.windowWidth = this.get(0x0028,0x1050);
        this.windowCenter = this.get(0x0028,0x1051);
        this.seriesInstanceUID = this.get(0x0020,0x000E);
        this.seriesNumber = this.get(0x0020,0x0011);
        this.studyDate = this.get(0x0008,0x0020);
        this.studyTime = this.get(0x0008,0x0030);
        this.pixelRepresentation = this.get(0x0028,0x0103);
        this.pixeSpacing = this.get(0x0028,0x0030);
        this.accessionNumber = this.string(0x0008,0x0050);
        this.bitsAllocated = this.get(0x0028,0x0100);
        this.imageType = this.get(0x0008,0x0008);
        this.modality = this.get(0x0008,0x0060);
        this.seriesDescription = this.string(0x0008,0x103E);
        this.patientSex = this.get(0x0010,0x0040);
        this.rows = this.get(0x0028,0x0010);
        this.columns = this.get(0x0028,0x0011);
        this.patientAge = this.get(0x0010,0x1010);
    }

    int(group:number,element:number):number|undefined{
        const is = this.getValue(group,element,"IS");
        if(typeof is === "number"){
            return is;
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

    
}

export default Dataset;