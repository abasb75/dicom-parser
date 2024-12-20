// import Dataset from "./Dataset";
import Dataset from "./Dataset";
import Loader from "./Loader";
import Parser from "./Parser";

export function loadAndParseFromUrl(url:string){
    return new Promise<Dataset>((resolve,reject)=>{
        const loader = new Loader();
        loader.load(url).then((dicomBuffer:ArrayBuffer|undefined)=>{
            if(!dicomBuffer){
                reject('Error on loading file!');
                return;
            }
            const parser = new Parser(dicomBuffer);
            const dataset = parser.getDataset();
            if(!dataset){
                reject('Error on parsing data')
                return;
            }
            resolve(dataset);
        });
    });
}

export function loadAndParseFromFiles(file:File){
    return new Promise<Dataset>((resolve,reject)=>{
        const loader = new Loader();
        loader.load(file)
            .then((dicomBuffer:ArrayBuffer|undefined)=>{
            if(!dicomBuffer){
                reject('Error on loading file!');
                return;
            }
            const parser = new Parser(dicomBuffer);
            const dataset = parser.getDataset();
            if(!dataset){
                reject('Error on parsing data')
                return;
            }
            resolve(dataset);
        });
    });
}

export function parse(dicomBuffer:ArrayBuffer){
    const parser = new Parser(dicomBuffer);
    const dataset = parser.getDataset();
    return dataset;
}

export default {
    parse,
    loadAndParseFromFiles,
    loadAndParseFromUrl,
}