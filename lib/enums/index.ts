import TransferSyntax from "./TransferSyntax";
import TagsDictionary, { TagsDictionaryEnumsType } from "./TagsDictionary";
import ValueRepresentations from "./ValueRepresentations";

interface IEnums {
    TransferSyntax:{
        [key:string]:string,
    },
    TagsDictionary:TagsDictionaryEnumsType,
    ValueRepresentations:{
        [key:string]:string,
    },
}

const AppEnums:IEnums = {
    TransferSyntax,
    TagsDictionary,
    ValueRepresentations,
}

export default AppEnums;