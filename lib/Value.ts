class Value{



    static byVr(arrayBuffer:ArrayBuffer,vr:string){

        switch(vr){
            case "UL":
            default:
                return Value.getString(arrayBuffer);
        }

    }


    static getString(bytes:Uint8Array|Int8Array|ArrayBuffer){
        const decoder = new TextDecoder();
        return decoder.decode(bytes);
    }



}



export default Value;