# DICOM Parser

A lightweight and simple DICOM parser designed for browser and Node.js environments.  
This library extracts metadata and pixel information from raw DICOM files using a clean and intuitive API.

---

## 📦 Installation

```bash
npm install @abasb75/dicom-parser
```

## 🚀 Usage

To use this library, you must provide the ArrayBuffer of a DICOM file.

```js
import { parse } from '@abasb75/dicom-parser';

const dataset = parse(dicomBuffer as ArrayBuffer);

console.log({ dataset });
```

## Get Value

```js

const metadata = dataset.metadata;
const someTag = dataset.get(0xXXXX,0xXXXX);

```

## Pixel Data

```js
const pixelData = dataset.getPixelData(frameIndex=0);
```

## Pallete Color Data

```js
const paletteDataMap = dataset.getPaletteColorData();

if(paletteDataMap){
  // apply palette color to pixels
  ...
}

````


