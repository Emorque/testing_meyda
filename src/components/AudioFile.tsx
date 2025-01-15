"use client";

import Meyda from 'meyda';
import { useSearchParams } from 'next/navigation';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export function AudioFile() {    
    const [audioURL, setAudioURL] = useState<string | null>(null)
    const audioRef = useRef<HTMLAudioElement>(null);
    const [level, setLevel] = useState<number>(0);

    const [chromaArray, setChromaArray] = useState<number[]>([0,0,0,0,0,0,0,0,0,0,0,0]);
    const [amplitudeSpectrum, setAmplitudeSpectrum] = useState<number[]>([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);


    const [aButton, setAButton] = useState<boolean | null>(false);
    const [sButton, setSButton] = useState<boolean | null >(false);
    const [dButton, setDButton] = useState<boolean | null>(false);
    const [fButton, setFButton] = useState<boolean | null>(false);

    const [aSuccess, setASuccess] = useState<string | null>(null);
    const [sSuccess, setSSuccess] = useState<string | null>(null);
    const [dSuccess, setDSuccess] = useState<string | null>(null);
    const [fSuccess, setFSuccess] = useState<string | null>(null);

    const [score, setScore] = useState<number>(0);


    const audioChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAudioURL(URL.createObjectURL(file));
        updateContext();
    }

    // const styleOne = {
    //   backgroundColor: ((amplitudeSpectrum[0] + amplitudeSpectrum[1] + amplitudeSpectrum[2] + amplitudeSpectrum[3] + amplitudeSpectrum[4] + amplitudeSpectrum[5]) / 6) > 1.5? "green": "red",
    //   padding: 10
    // }

    const styleOne = {
      backgroundColor: aButton? "green": "red",
      padding: 10
    }
    const styleTwo = {
      backgroundColor: sButton? "green": "red",
      padding: 10
    }

    const styleThree = {
      backgroundColor: dButton? "green": "red",
      padding: 10
    }

    const styleFour = {
      backgroundColor: fButton? "green": "red",
      padding: 10
    }


    // const styleTwo = {
    //   backgroundColor: ((amplitudeSpectrum[6] + amplitudeSpectrum[7] + amplitudeSpectrum[8] + amplitudeSpectrum[9] + amplitudeSpectrum[10] + amplitudeSpectrum[11]) / 6) > 1.5? "green": "red",
    //   padding: 10
    // }

    // const styleThree = {
    //   backgroundColor: ((amplitudeSpectrum[12] + amplitudeSpectrum[13] + amplitudeSpectrum[14] + amplitudeSpectrum[15] + amplitudeSpectrum[16] + amplitudeSpectrum[17]) / 6) > 1.5? "green": "red",
    //   padding: 10
    // }

    // const styleFour = {
    //   backgroundColor: ((amplitudeSpectrum[18] + amplitudeSpectrum[19] + amplitudeSpectrum[20] + amplitudeSpectrum[21] + amplitudeSpectrum[22] + amplitudeSpectrum[23]) / 6) > 1.5? "green": "red",
    //   padding: 10
    // }

    function updateContext() {
        const audioContext = new AudioContext;

        if (audioRef.current) {
            const source = audioContext.createMediaElementSource(audioRef.current); 
            source.connect(audioContext.destination);
            if (typeof Meyda === "undefined") {
                console.log("Meyda could not be found! Have you included it?");
                return;
              } 
            const analyzer = Meyda.createMeydaAnalyzer({
              audioContext: audioContext,
              source: source,
              bufferSize: 512,
              featureExtractors: ["rms", "chroma", "amplitudeSpectrum", "spectralFlatness", "spectralKurtosis","mfcc","perceptualSharpness", "loudness", "perceptualSpread"],
              callback: (features: any) => {
                // console.log(features.chroma);
                setLevel(features.rms);
                setChromaArray(features.chroma);
                // setAmplitudeSpectrum(features.amplitudeSpectrum)
                setAmplitudeSpectrum(features.loudness.specific);
                // callABtn()
                // console.log(features.loudness.specific)
              },
            });
            analyzer.start();

            return () => {
              analyzer.stop();
            }
        }
    }

    const getAmplitudeRangeForKey = (key: string): number[] => {
      switch (key) {
        case 'a':
          return [0, 1, 2, 3, 4, 5];
        case 's':
          return [6, 7, 8, 9, 10, 11];
        case 'd':
          return [12, 13, 14, 15, 16, 17];
        case 'f':
          return [18, 19, 20, 21, 22, 23];
        default:
          return [];
      }
    };
  
    // useEffect(() => {
    //   const buttonStates = [
    //     { key: 'a', state: aButton, successState: aSuccess, setState: setAButton, setSuccess: setASuccess },
    //     { key: 's', state: sButton, successState: sSuccess, setState: setSButton, setSuccess: setSSuccess },
    //     { key: 'd', state: dButton, successState: dSuccess, setState: setDButton, setSuccess: setDSuccess },
    //     { key: 'f', state: fButton, successState: fSuccess, setState: setFButton, setSuccess: setFSuccess },
    //   ];
  
    //   buttonStates.forEach(({ key, state, successState, setState, setSuccess }) => {
    //     if (state) return;
  
    //     const spectrumRange = getAmplitudeRangeForKey(key);
    //     const avgAmplitude = spectrumRange.reduce((sum, idx) => sum + amplitudeSpectrum[idx], 0) / spectrumRange.length;
  
    //     if (avgAmplitude > 1.5) {
    //       setState(true);
    //       setTimeout(() => {
    //         if (!successState) {
    //           setScore(score - 1);
    //         }
    //         setState(null);
    //         setSuccess(null);
    //       }, 500);
    //     }
    //   });
    // }, [amplitudeSpectrum]);

    useEffect(() => {
      // Button states with a timeout for each key
      const buttonStates = [
        { key: 'a', state: aButton, successState: aSuccess, setState: setAButton, setSuccess: setASuccess },
        { key: 's', state: sButton, successState: sSuccess, setState: setSButton, setSuccess: setSSuccess },
        { key: 'd', state: dButton, successState: dSuccess, setState: setDButton, setSuccess: setDSuccess },
        { key: 'f', state: fButton, successState: fSuccess, setState: setFButton, setSuccess: setFSuccess },
      ];
    
      buttonStates.forEach(({ key, state, successState, setState, setSuccess }) => {
        // If the button state is already set, skip the update
        if (state) return;
    
        const spectrumRange = getAmplitudeRangeForKey(key);
        const avgAmplitude = spectrumRange.reduce((sum, idx) => sum + amplitudeSpectrum[idx], 0) / spectrumRange.length;
    
        if (avgAmplitude > 1.5) {
          // Set the button state to true when the amplitude exceeds the threshold
          setState(true);
    
          // Handle the timeout for each button independently
          setTimeout(() => {
            console.log(successState);
            if (!successState || successState == "false") {
              setScore((prevScore) => prevScore - 1); // Decrement the score independently for each key
            }
            // Reset the state and success after timeout
            setState(null);
            setSuccess(null);
          }, 500);
        }
      });
    }, [amplitudeSpectrum, aButton, sButton, dButton, fButton, aSuccess, sSuccess, dSuccess, fSuccess]);

    useEffect(() => {
      const handleKeyDown = (event: { key: string; }) => {
        // console.log(event.key);
        if (event.key === 'a' || event.key === 'A' ) {
          console.log('A key pressed!');
          if (aButton) {
            setASuccess("true");
            setScore((prevScore) => prevScore + 1); // Decrement the score independently for each key
          }
          else {
            setASuccess("false");
            setScore((prevScore) => prevScore - 1); // Decrement the score independently for each key
          }
        }

        if (event.key === 's' || event.key === 's' ) {
          console.log('S key pressed!');
          if (sButton) {
            setSSuccess("true");
            setScore((prevScore) => prevScore + 1); // Decrement the score independently for each key
          }
          else {
            setSSuccess("false");
            setScore((prevScore) => prevScore - 1); // Decrement the score independently for each key
          }
        }
        
        if (event.key === 'd' || event.key === 'D' ) {
          console.log('D key pressed!');
          if (dButton) {
            setDSuccess("true");
            setScore((prevScore) => prevScore + 1); // Decrement the score independently for each key
          }
          else {
            setDSuccess("false");
            setScore((prevScore) => prevScore - 1); // Decrement the score independently for each key
          }
        }
        
        if (event.key === 'f' || event.key === 'F' ) {
          console.log('F key pressed!');
          if (fButton) {
            setFSuccess("true");
            setScore((prevScore) => prevScore + 1); // Decrement the score independently for each key
          }
          else {
            setFSuccess("false");
            setScore((prevScore) => prevScore - 1); // Decrement the score independently for each key
          }
        }
      };
  
      document.addEventListener('keydown', handleKeyDown);
  
      // Cleanup the event listener on unmount
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, [aButton, sButton, dButton, fButton]);


    return (
        <>
            <input type="file" accept='audio/*' onChange={audioChange}/>
            <h1>Meyda Demo</h1>
            <p>{level}</p>
            <p>{score}</p>
            {/* <p>{(chromaArray[0]>0.5)? 1111 : 2}</p>
            <p>{(chromaArray[1]>0.5)? 1111 : 2}</p>
            <p>{(chromaArray[2]>0.5)? 1111 : 2}</p>
            <p>{(chromaArray[3]>0.5)? 1111 : 2}</p>
            <p>{(chromaArray[4]>0.5)? 1111 : 2}</p>
            <p>{(chromaArray[5]>0.5)? 1111 : 2}</p>
            <p>{(chromaArray[6]>0.5)? 1111 : 2}</p>
            <p>{(chromaArray[7]>0.5)? 1111 : 2}</p>
            <p>{(chromaArray[8]>0.5)? 1111 : 2}</p>
            <p>{(chromaArray[9]>0.5)? 1111 : 2}</p>
            <p>{(chromaArray[10]>0.5)? 1111 : 2}</p>
            <p>{(chromaArray[11]>0.5)? 1111 : 2}</p> */}
            {/* <p>{amplitudeSpectrum}</p> */}
{/* 
            <p>{chromaArray[1]}   {amplitudeSpectrum[0]}</p>
            <p>{chromaArray[1]}   {amplitudeSpectrum[1]}</p>
            <p>{chromaArray[2]}   {amplitudeSpectrum[1]}</p>
            <p>{chromaArray[3]}   {amplitudeSpectrum[1]}</p>
            <p>{chromaArray[4]}   {amplitudeSpectrum[1]}</p>
            <p>{chromaArray[5]}   {amplitudeSpectrum[1]}</p>
            <p>{chromaArray[6]}   {amplitudeSpectrum[1]}</p>
            <p>{chromaArray[7]}   {amplitudeSpectrum[1]}</p>
            <p>{chromaArray[8]}   {amplitudeSpectrum[1]}</p>
            <p>{chromaArray[9]}   {amplitudeSpectrum[1]}</p>
            <p>{chromaArray[10]}   {amplitudeSpectrum[1]}</p>
            <p>{chromaArray[11]}   {amplitudeSpectrum[1]}</p>
            <p>{chromaArray[12]}   {amplitudeSpectrum[1]}</p> */}

            <div style={{display: "flex", gap: 20}}>
              <div style={{display: "flex", flexDirection: "column"}}>
                <p style={styleOne}>A</p>
                <p>{aSuccess}</p>
              </div>

              <div style={{display: "flex", flexDirection: "column"}}>
                <p style={styleTwo}>S</p>
                <p>{sSuccess}</p>
              </div>

              <div style={{display: "flex", flexDirection: "column"}}>
                <p style={styleThree}>D</p>
                <p>{dSuccess}</p>
              </div>

              <div style={{display: "flex", flexDirection: "column"}}>
                <p style={styleFour}>F</p>
                <p>{fSuccess}</p>
              </div>
            </div>
            
            {/* <p style={styleOne}>{(amplitudeSpectrum[0] + amplitudeSpectrum[1] + amplitudeSpectrum[2] + amplitudeSpectrum[3] + amplitudeSpectrum[4] + amplitudeSpectrum[5]) / 6}</p>
            <br/>
            <p style={styleTwo}>{(amplitudeSpectrum[6] + amplitudeSpectrum[7] + amplitudeSpectrum[8] + amplitudeSpectrum[9] + amplitudeSpectrum[10] + amplitudeSpectrum[11]) / 6}</p>
            <br/>
            <p style={styleThree}>{(amplitudeSpectrum[12] + amplitudeSpectrum[13] + amplitudeSpectrum[14] + amplitudeSpectrum[15] + amplitudeSpectrum[16] + amplitudeSpectrum[17]) / 6}</p>
            <br/>
            <p style={styleFour}>{(amplitudeSpectrum[18] + amplitudeSpectrum[19] + amplitudeSpectrum[20] + amplitudeSpectrum[21] + amplitudeSpectrum[22] + amplitudeSpectrum[23]) / 6}</p>
            <br/> */}

            
            {/* <p>{(amplitudeSpectrum[0] + amplitudeSpectrum[1] + amplitudeSpectrum[2] + amplitudeSpectrum[3] + amplitudeSpectrum[4] + amplitudeSpectrum[5]) / 6}</p> */}
            {/* <p>{amplitudeSpectrum[1]}</p>
            <p>{amplitudeSpectrum[2]}</p>
            <p>{amplitudeSpectrum[3]}</p>
            <p>{amplitudeSpectrum[4]}</p>
            <p>{amplitudeSpectrum[5]}</p>
            <p>{amplitudeSpectrum[6]}</p>
            <p>{amplitudeSpectrum[7]}</p>
            <p>{amplitudeSpectrum[8]}</p>
            <p>{amplitudeSpectrum[9]}</p>
            <p>{amplitudeSpectrum[10]}</p>
            <p>{amplitudeSpectrum[11]}</p>
            <p>{amplitudeSpectrum[12]}</p> */}
            

            <audio src={audioURL ?? ""} controls={true} ref={audioRef} loop={true} />
        </>
    )
}