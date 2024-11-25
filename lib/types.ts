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

export type {
    Tags,
    DicomTime,
    DicomDate,
    DicomDateTime,
    DicomDataset,
};