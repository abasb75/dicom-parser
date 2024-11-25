class Value{

    static byVr(dataView:DataView,offset:number,len:number,vr:string,littleEndian:boolean){
        switch(vr){
            case "CS":
                return Value.CS(dataView,offset,len);
            case "US":
                return Value.US(dataView,offset,len,littleEndian);
            case "IS":
                return Value.IS(dataView,offset,len);
            case "DS":
                return Value.DS(dataView,offset,len);
            case "DA":
                return Value.DA(dataView,offset,len);
            case "TM":
                return Value.TM(dataView,offset,len);
            case "UI":
            case "SH":
            case "LO":
            default:
                return Value.getString(new Uint8Array(dataView.buffer,offset,len));
        }
    }

    static CS(dataView:DataView,offset:number,len:number){
        let value = Value.getString(new Uint8Array(dataView.buffer,offset,len));
        const values = value.split("\\");
        if(values.length === 0){
            return value;
        }else if(values.length === 1){
            return values[0];
        }else{
            return values;
        }
        
    }


    static IS(dataView:DataView,offset:number,len:number){
        const value = Value.getString(new Uint8Array(dataView.buffer,offset,len));
        if(/^[0-9]+$/.exec(value)){
            return parseInt(value);
        }
        return value;
    }

    static DA(dataView:DataView,offset:number,len:number){
        const value = Value.getString(new Uint8Array(dataView.buffer,offset,len));
        if(/^[0-9]{8}$/.exec(value)){
            return `${value.slice(0,4)}-${value.slice(4,6)}-${value.slice(6,8)}`;
        }
        return value;
    }

    static DS(dataView:DataView,offset:number,len:number){
        let value = Value.getString(new Uint8Array(dataView.buffer,offset,len));
        const values = value.split("\\").map(v=>{
            if(/^[0-9]+$/.exec(v)){
                return parseInt(v);
            }else if(/^[0-9]+\.[0-9]+$/.exec(v)){
                return parseFloat(v);
            }
            return v;
        });
        if(values.length === 0){
            return value;
        }else if(values.length === 1){
            return values[0];
        }else{
            return values;
        }
        
    }

    static TM(dataView:DataView,offset:number,len:number){
        let value = Value.getString(new Uint8Array(dataView.buffer,offset,len)).trim().split('.')[0];
        if(![2,4,6].includes(value.length)){
            return value;
        }
        if(value.length === 4){
            value += "00";
        }else if(value.length === 2){
            value += "0000";
        }
        return `${value.slice(0,2)}:${value.slice(2,4)}:${value.slice(4,6)}`;
    }

    static getString(bytes:Uint8Array|Int8Array|ArrayBuffer){
        const decoder = new TextDecoder();
        return decoder.decode(bytes).trim();
    }

    static US(dataView:DataView,offset:number,len:number,littleEndian:boolean=true){
        if(len === 2){
            return dataView.getUint16(offset,littleEndian);
        }
    }

    

}



export default Value;