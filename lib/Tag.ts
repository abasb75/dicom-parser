import TagsDictionaryEnums from "./enums/TagsDictionary";

class Tag {

    name:string;
    vr:string;
    group:number;
    element:number;
    value:unknown;
    valueLength:number;
    offset:number;
    
   
    constructor(group:number,element:number,vr:string,valueLength:number,offset:number,value?:ArrayBuffer,name?:string|null){
        this.group = group;
        this.element = element;
        this.vr = vr;
        this.name = name || Tag.getTagNameFromDictionary(this.group,this.element) || '';
        this.value = value || undefined;
        this.valueLength = valueLength;
        this.offset = offset;

        if(this.name === '') {
            
        }
    }

    generateKey(){
        const group = Tag.intTo4digitString(this.group);
        const element = Tag.intTo4digitString(this.element);
        return `0x${group}${element}`;

    }

    static getTagNameFromDictionary(groupInt:number,elementInt:number):string{
        const group = Tag.intTo4digitString(groupInt);
        const element = Tag.intTo4digitString(elementInt);
        const groupItems = TagsDictionaryEnums[group];
        if(!groupItems) return "";
        const elementItem = groupItems[element];
        if(!elementItem) return "";

        return elementItem[1];
    }

    static getTagVRFromDictionary(group:number|string,element:number|string):string{
        let _group,_element;
        if(typeof group === "number"){
            _group = Tag.intTo4digitString(group);
        }
        if(typeof element === "number"){
            _element = Tag.intTo4digitString(element);
        }
        const groupItems = TagsDictionaryEnums[_group || group];
        if(!groupItems) return "";
        const elementItem = groupItems[_element || element];
        if(!elementItem) return "";

        return elementItem[0];
    }

    static intTo4digitString (int:number):string{
        return ('0000' + int.toString(16).toUpperCase()).slice(-4); 
    }

    static int8digitString (int:number):string{
        return ('00000000' + int.toString(16).toUpperCase()).slice(-8); 
    }

    getValue(){

    }
    
}

export default Tag;