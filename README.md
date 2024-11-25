# @abasb75/dicom-parser

```sh
npm i @abasb75/dicom-parser pako --save
npm i @types/pako --save-dev
```

# Demo

<a href="https://abasb75.github.io/dicom-parser/">demo link</a>

# Usage

1. For Download dicom and parse from url:

```javascript
import { loadAndParseFromUrl } from "@abasb75/dicom-parser";

...
const url = "....dcm";
loadAndParseFromUrl(url)
.then(dataset=>{
  console.log(dataset);
})
.catch(err=>{
  console.log(error);
})

```


2. For parse dataset from local files:

```javascript
import { loadAndParseFromFiles } from "@abasb75/dicom-parser";

...

loadAndParseFromFiles(file)
.then(dataset=>{
  console.log(dataset);
})
.catch(err=>{
  console.log(error);
});

```

3. For parsing arrayBuffer:

```javascript
import { parse } from "@abasb75/dicom-parser";

...

const dataset = parse(arrayBuffer);

```


4. Getting value for dicom tag

```javascript

...

const transferSyntaxUID = dataset.get(0x0002,0x0010);
const transferSyntaxUID = dataset.string(0x0002,0x0010);

...

```
