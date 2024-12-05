import Dataset from "../Dataset";
import JPEG2000 from "./JPEG2000";
import JPEGBaselineLossyProcess1_8bit from "./JPEGBaselineLossyProcess1_8bit";
import UncompressDecoderr from "./Uncompressed";

class Decoder {

    static async decode(pixelData:DataView,dataset:Dataset){
        const transferSyntaxUID = dataset.transferSyntaxUID;
        switch(transferSyntaxUID){
            case "1.2.840.10008.1.2.4.50":
                return await JPEGBaselineLossyProcess1_8bit.decode(pixelData,dataset);
            case "1.2.840.10008.1.2.4.90":
                return await JPEG2000.decode(pixelData,dataset);
            case "1.2.840.10008.1.2":
            case "1.2.840.10008.1.2.1":
            case "1.2.840.10008.1.2.2":
            case "1.2.840.10008.1.2.1.99":
            default:
                return UncompressDecoderr.decode(pixelData,dataset);
        }
    }
}

export default Decoder;