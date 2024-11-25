import Tag from "./Tag";
import Value from "./Value";
import { Tags } from "./types";

class Dataset {
    tags:Tags;
    arrayBuffer:ArrayBuffer;
    transferSyntaxUID:string = "1.2.840.10008.1.2";
    constructor(tags:Tags,arrayBuffer:ArrayBuffer){
        this.tags = tags;
        this.arrayBuffer = arrayBuffer;
        
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
            if(!_group || _element) return "";
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
        const value = this.arrayBuffer.slice(offset,len);
        const formedValue = Value.byVr(value,vr);
        tag.value = formedValue;

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