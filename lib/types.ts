import Dataset from "./Dataset";
import Tag from "./Tag";

interface Tags {
    [key:string]:Tag;
}

interface DicomDate {
    year:string|number,
    month:string|number,
    day:string|number,
}
interface DicomTime {
    hour:string|number,
    minute:string|number,
    second:string|number,
}

interface DicomDateTime extends DicomDate,DicomTime {}

type DicomDataset = Dataset;

type PixelArray = Int16Array|Uint16Array|Int32Array|Uint32Array|Int8Array|Uint8Array|Float32Array;

interface DicomVOILutModule{
    voiLUTFunction:string;
    windowWidth:number|undefined;
    windowCenter:number|undefined;
    voiLUTSequence:unknown;
    lutDescriptor:any;
    lutExplanation:any;
    lutData:any;
    windowCenterAndWidthExplanation:string;
}

interface DicomPatientModule{
    patientName:string;
    patientID:string;
    typeofPatientID:string,
    patientSex:string,
    patientBirthDate:string,
    patientAge:string,
    patientSize:string,
    otherPatientIDs:string,
    otherPatientNames:string,
    patientWeight:string,
}

interface DicomPixelModule{
    photometricInterpretation:string,
    numberOfFrames:number|undefined,
    pixelRepresentation:number|undefined,
    pixeSpacing:any|undefined,
    rows:number|number|undefined,
    columns:number|number|undefined,
    bitsAllocated:number|undefined,
    highBit:number|undefined,
    bitsStored:number|undefined,
    samplesPerPixel:number|undefined;
}

interface PixelDataDecodeOptions {
    pixelData:DataView;
    bitsAllocated:number;
    pixelRepresentation:number;
    littleEndian:boolean;
    dataset?:Dataset;
}


export type {
    Tags,
    DicomTime,
    DicomDate,
    DicomDateTime,
    DicomDataset,
    
    DicomVOILutModule,
    DicomPatientModule,
    DicomPixelModule,

    PixelArray,
    PixelDataDecodeOptions,

};