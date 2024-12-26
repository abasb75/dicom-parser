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
    pixelSpacing:any|undefined,
    rows:number|number|undefined,
    columns:number|number|undefined,
    bitsAllocated:number|undefined,
    highBit:number|undefined,
    bitsStored:number|undefined,
    samplesPerPixel:number|undefined;
    pixelDataProviderURL:any;
    pixelPaddingRangeLimit:any;
    extendedOffsetTable:any;
    extendedOffsetTableLengths:any;
    pixelAspectRatio:any;
    planarConfiguration:number|undefined;
    redPaletteColorLookupTableDescriptor:unknown;
    greenPaletteColorLookupTableDescriptor:unknown;
    bluePaletteColorLookupTableDescriptor:unknown;
    alphaPaletteColorLookupTableDescriptor:unknown;
    redPaletteColorLookupTableData:any;
    greenPaletteColorLookupTableData:any;
    bluePaletteColorLookupTableData:any;
    alphaPaletteColorLookupTableData:any;
    segmentedRedPaletteColorLookupTableData:any;
    segmentedGreenPaletteColorLookupTableData:any;
    segmentedBluePaletteColorLookupTableData:any;
    segmentedAlphaPaletteColorLookupTableData:any;
    pixelMeasuresSequence:any;
}

interface DicomScalingModule {
    rescaleSlope:number|undefined, 
    rescaleIntercept:number|undefined, 
    modality:string,
}

interface PixelDataDecodeOptions {
    pixelData:DataView;
    bitsAllocated:number;
    pixelRepresentation:number;
    littleEndian:boolean;
    dataset?:Dataset;
}

interface PaletteColorDataColor {
    data:Uint8Array[]|Uint16Array[],
    firstInputValueMapped:number,
    lutEntries:number,
    bitsPerEntry:number,
    littleEndian:boolean,
}

interface PaletteColorData {
    red:PaletteColorDataColor|undefined,
    green:PaletteColorDataColor|undefined,
    blue:PaletteColorDataColor|undefined,
    alpha:PaletteColorDataColor|undefined,
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
    DicomScalingModule,

    PixelArray,
    PixelDataDecodeOptions,

    PaletteColorData,
    PaletteColorDataColor,
    

};