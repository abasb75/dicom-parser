class Loader {

    private dicomSrc:string|undefined;
    private xhr:XMLHttpRequest;

    constructor(dicomSrc?:string){
        this.dicomSrc = dicomSrc;
        this.xhr = new XMLHttpRequest();
    }

    async load(dicomSrc?:string|File){
        if(typeof dicomSrc === "string"){
            const dicom = dicomSrc || this.dicomSrc;
            if(!dicom) return;
            return new Promise<ArrayBuffer>((resolve,reject)=>{
                this.xhr.onload = ()=>{
                    resolve(this.xhr.response);
                }
                this.xhr.onerror = ()=>{
                    reject(this.xhr);
                }
                this.xhr.responseType = 'arraybuffer'
                this.xhr.open('GET',dicom,true);
                this.xhr.send();
            });
        }else if(dicomSrc instanceof File){
            return new Promise<ArrayBuffer>((resolve,reject)=>{
                dicomSrc.arrayBuffer().then((arrayBuffer)=>{
                    resolve(arrayBuffer);
                }).catch(
                    reason=>reject(reason)
                )
            });
        }
        return  new Promise<ArrayBuffer>((resolve,reject)=>{
            if(false) resolve(new ArrayBuffer(1));
            reject("dicom source is not valid")
        });
        
    }

    cancel(){
        this.xhr.abort();
    }

}


export default Loader;