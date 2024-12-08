
import { ChangeEvent, Suspense, useEffect, useRef, useState, useTransition } from 'react';
//@ts-ignore
import ReactJson from 'react-json-view';

// import { loadAndParseFromFiles, loadAndParseFromUrl } from '@lib/index'; //devlop
// import { loadAndParseFromFiles, loadAndParseFromUrl } from '@package/index'; //test  package
import { loadAndParseFromFiles, loadAndParseFromUrl } from '@package/index'; // test after deploy




function App() {

  const [dcmData,setDcmData] = useState({});
  const [loading,setLoading] = useState(false);
  const [errorMessage,setErrorMessage] = useState('');
  const [inputHasText,setInputHasText] = useState(false);
  const [isPending, startTransition] = useTransition();

  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const parseInputUrl = ()=>{
    const url = inputRef.current?.value;
    if(!url){
      setErrorMessage('Please insert valid url!');
      return;
    }
    setLoading(true);
    setDcmData({});
    setErrorMessage("");
    loadAndParseFromUrl(url).then((dataset)=>{

      setLoading(false);
      setErrorMessage('');
      setDcmData(dataset);
      
    }).catch((error)=>{
      setLoading(false);
      if(typeof error === "string"){
        setErrorMessage(error);
      }else{
        setErrorMessage("Error ...");
      }
    });
  }

  const fileInputChange = (event:ChangeEvent<HTMLInputElement>)=>{
    
    if (event.target.files && event.target.files[0] ) {
      const dcmFile = event.target.files[0];
      loadAndParseFromFiles(dcmFile).then((dataset)=>{
          // if(dataset && canvasRef.current){
          //   // dataset.draw(canvasRef.current);
          // }
          startTransition(()=>{
            setDcmData(dataset);
            setErrorMessage("");
          })
          
      });

        
    }

  }
  useEffect(()=>{
    console.log("dcm dataset",dcmData);
    
  },[dcmData]);


  return (
    <>
      <div className='w-full h-[100vh] bg-slate-950 flex items-center justify-center flex-col'>
        <div className='w-full max-w-[768px] bg-white rounded border-slate-600 border-2 h-full max-h-[420px] flex flex-row'>
          {/* <div className='bg-black w-1/3 flex items-center justify-center'>
            <canvas id="xac" ref={canvasRef} className='max-w-full max-h-full' />
          </div> */}
          <div className='w-full'>
            <div className='h-[50px] w-full bg-black flex'>
                <input 
                  type='text' 
                  className='flex-1 h-full w-full bg-slate-700 text-gray-400 font-semibold px-4 '
                  placeholder='Paste Your Dicom Url ...'
                  ref={inputRef}
                  onChange={(e)=>setInputHasText( ()=>(e.target.value)!=='' )}
                />
                {inputHasText ? (<button 
                  className='bg-slate-800 text-white px-2'
                  onClick={parseInputUrl}
                >
                  Parse Dicom
                </button>) : (<>
                  <input 
                    type='file' 
                    ref={fileInputRef} 
                    id="file-input" 
                    accept='' 
                    className='hidden' 
                    onChange={fileInputChange}
                  />
                  <label 
                  className='bg-slate-800 text-white px-2 leading-[50px] cursor-pointer'
                  htmlFor='file-input'
                  
                  >
                    Use Local File
                  </label>

                </>)}
            </div>
            <div className=' h-[calc(100%_-_50px)] bg-slate-50 overflow-auto relative'>
              <Suspense fallback={<Loading />}>
                <ReactJson src={dcmData} style={{width:'100%',height:'100%'}} />
              </Suspense>
              {(isPending || loading) && <Loading />}
              {errorMessage && <div className='absolute top-0 left-0 opacity-50 z-50 bg-slate-800 w-full h-full flex items-center justify-center font-semibold text-red-300'>{errorMessage}</div>}
            </div>
          </div>
        </div>
        <div className='text-center py-2'>
          <a href='https://abasbagheri.ir' className='opacity-50 transition-all hover:opacity-90 underline text-xs font-light text-yellow-50' >Abbas Bagheri</a>
        </div>
      </div>
    </>
  );

}

const Loading = ()=>(<div className='absolute top-0 left-0 opacity-50 z-50 bg-slate-800 w-full h-full flex items-center justify-center font-semibold text-gray-300'>Loading ...</div>);

export default App
