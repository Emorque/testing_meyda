"use client";

import Meyda from 'meyda';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { js } from 'three/tsl';

import "./audiofile.css"

function TempP() {
  return (
    <h1>TESTING</h1>
  )
}

export function AudioFile() {    
    const [audioURL, setAudioURL] = useState<string | null>(null)
    const audioRefListening = useRef<HTMLAudioElement>(null);
    const audioRefSetting = useRef<HTMLAudioElement>(null);

    const aPillar = useRef<HTMLDivElement>(null);
    const bPillar = useRef<HTMLDivElement>(null);
    const cPillar = useRef<HTMLDivElement>(null);
    const dPillar = useRef<HTMLDivElement>(null);

    const musicSource = useRef<MediaElementAudioSourceNode>(null);
    const [level, setLevel] = useState<number>(0);

    const [chromaArray, setChromaArray] = useState<number[]>([0,0,0,0,0,0,0,0,0,0,0,0]);
    const [amplitudeSpectrum, setAmplitudeSpectrum] = useState<number[]>([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
    const [powerSpectrum, setPowerSpectrum] = useState<number[]>([]);

    const [aActive, setAActive] = useState<boolean>(false);
    const [dActive, setDActive] = useState<boolean>(false);
    const [jActive, setJActive] = useState<boolean>(false);
    const [lActive, setLActive] = useState<boolean>(false);

    const [aSuccess, setASuccess] = useState<string | null>(null);
    const [dSuccess, setDSuccess] = useState<string | null>(null);
    const [jSuccess, setJSuccess] = useState<string | null>(null);
    const [lSuccess, setLSuccess] = useState<string | null>(null);

    const [score, setScore] = useState<number>(0);

    const [range1, setRange1] = useState<number>(0);
    const [range2, setRange2] = useState<number>(0);
    const [range3, setRange3] = useState<number>(0);
    const [range4, setRange4] = useState<number>(0);

    const audioChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAudioURL(URL.createObjectURL(file));
        updateContext();
    }

    const styleOne = {
      backgroundColor: aActive? "green": "red",
      padding: 10
    }
    const styleTwo = {
      backgroundColor: dActive? "green": "red",
      padding: 10
    }
    const styleThree = {
      backgroundColor: jActive? "green": "red",
      padding: 10
    }
    const styleFour = {
      backgroundColor: lActive? "green": "red",
      padding: 10
    }

    function updateContext() {
        const audioContext = new AudioContext;

        if (audioRefSetting.current) {
            const source = audioContext.createMediaElementSource(audioRefSetting.current); 
            source.connect(audioContext.destination);
            if (typeof Meyda === "undefined") {
                console.log("Meyda could not be found! Have you included it?");
                return;
              } 
            const analyzer = Meyda.createMeydaAnalyzer({
              audioContext: audioContext,
              source: source,
              bufferSize: 512,
              featureExtractors: ["rms", "chroma", "amplitudeSpectrum", "spectralFlatness", "spectralKurtosis","mfcc","perceptualSharpness", "loudness", "perceptualSpread", "powerSpectrum"],
              callback: (features: any) => {
                // console.log(features.chroma);
                // setLevel(features.rms);
                // setChromaArray(features.chroma);
                // setPowerSpectrum(features.powerSpectrum);
                // setChromaArray(features.mfcc)
                setAmplitudeSpectrum(features.loudness.specific);
                // callABtn()
                // const avgAmplitude = spectrumRange.reduce((sum, idx) => sum + amplitudeSpectrum[idx], 0) / spectrumRange.length;
                // console.log(features.powerSpectrum.subarray(0,2))
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
        case 'd':
          return [6, 7, 8, 9, 10, 11];
        case 'j':
          return [12, 13, 14, 15, 16, 17];
        case 'l':
          return [18, 19, 20, 21, 22, 23];
        default:
          return [];
      }
    };
    
    useEffect(() => {
      // Button states with a timeout for each key
      const buttonStates = [
        { key: 'a', state: aActive, successState: aSuccess, setState: setAActive, setSuccess: setASuccess, pillar: aPillar, pillarClass: "aPillar" },
        { key: 'd', state: dActive, successState: dSuccess, setState: setDActive, setSuccess: setDSuccess, pillar: bPillar, pillarClass: "bPillar"  },
        { key: 'j', state: jActive, successState: jSuccess, setState: setJActive, setSuccess: setJSuccess, pillar: cPillar, pillarClass: "cPillar"  },
        { key: 'l', state: lActive, successState: lSuccess, setState: setLActive, setSuccess: setLSuccess, pillar: dPillar, pillarClass: "dPillar"  },
      ];
    
      buttonStates.forEach(({ key, state, successState, setState, setSuccess, pillar, pillarClass }) => {
        // If the button state is already set, skip the update
        if (state) return;
    
        const spectrumRange = getAmplitudeRangeForKey(key);
        const avgAmplitude = spectrumRange.reduce((sum, idx) => sum + amplitudeSpectrum[idx], 0) / spectrumRange.length;
    
        if (avgAmplitude > 1.5) {
          // Set the button state to true when the amplitude exceeds the threshold
          setState(true);
          // console.log(key + "made true");
          if (pillar.current) {
            const newEle = document.createElement('p');
            newEle.classList.add(pillarClass)
            newEle.classList.add("newEle")
            newEle.textContent= ""
            pillar.current.appendChild(newEle);
            setTimeout(() => {
              pillar.current?.removeChild(newEle);
            }, 2000)
          }
    
          // Handle the timeout for each button independently
          setTimeout(() => {
            if (!successState || successState == "false") {
              setScore((prevScore) => prevScore - 1); // Decrement the score independently for each key
            }
            // Reset the state and success after timeout
            setState(false);
            // setSuccess(null);
          }, 1000);
        }
        else {
          setState(false);
        }
      });
    }, [amplitudeSpectrum, aActive, dActive, jActive, lActive, aSuccess, dSuccess, jSuccess, lSuccess]);

    // const getPowerRangeForKey = (key: string): number[] => {
    //   switch (key) {
    //     case 'a':
    //       return Array.from({ length: 64 }, (_, index) => index);
    //     case 'd':
    //       return Array.from({ length: 64 }, (_, index) => index + 64);
    //     case 'j':
    //       return Array.from({ length: 64 }, (_, index) => index + 128);
    //     case 'l':
    //       return Array.from({ length: 64 }, (_, index) => index + 192);
    //     default:
    //       return [];
    //   }
    // };
    
    // useEffect(() => {
    //   // Button states with a timeout for each key
    //   const buttonStates = [
    //     { key: 'a', state: range1, successState: aSuccess, setState: setRange1, setSuccess: setASuccess },
    //     { key: 'd', state: range2, successState: dSuccess, setState: setRange2, setSuccess: setDSuccess },
    //     { key: 'j', state: range3, successState: jSuccess, setState: setRange3, setSuccess: setJSuccess },
    //     { key: 'l', state: range1, successState: lSuccess, setState: setRange4, setSuccess: setLSuccess },
    //   ];
    
    //   buttonStates.forEach(({ key, state, successState, setState, setSuccess }) => {
    //     // If the button state is already set, skip the update
    //     // if (state) return;
    
    //     const spectrumRange = getPowerRangeForKey(key);
    //     const avgAmplitude = spectrumRange.reduce((sum, idx) => sum + powerSpectrum[idx], 0) / spectrumRange.length;
        
    //     // console.log(key, avgAmplitude)
    //     setState(avgAmplitude);
    //   });
    // }, [powerSpectrum, range1, range2, range3, range4, aSuccess, dSuccess, jSuccess, lSuccess]);




    useEffect(() => {
      const handleKeyDown = (event: { key: string; }) => {
        // console.log(event.key);
        if (event.key === 'a' || event.key === 'A' ) {
          console.log('A key pressed!');
          if (aActive) {
            setASuccess("true");
            setScore((prevScore) => prevScore + 1); // Decrement the score independently for each key
          }
          else {
            setASuccess("false");
            setScore((prevScore) => prevScore - 1); // Decrement the score independently for each key
          }
        }

        if (event.key === 'd' || event.key === 'D' ) {
          console.log('D key pressed!');
          if (dActive) {
            setDSuccess("true");
            setScore((prevScore) => prevScore + 1); // Decrement the score independently for each key
          }
          else {
            setDSuccess("false");
            setScore((prevScore) => prevScore - 1); // Decrement the score independently for each key
          }
        }
        
        if (event.key === 'j' || event.key === 'J' ) {
          console.log('J key pressed!');
          if (jActive) {
            setJSuccess("true");
            // setScore((prevScore) => prevScore + 1); // Decrement the score independently for each key
          }
          else {
            setJSuccess("false");
            // setScore((prevScore) => prevScore - 1); // Decrement the score independently for each key
          }
        }
        
        if (event.key === 'l' || event.key === 'L' ) {
          console.log('L key pressed!');
          if (lActive) {
            setLSuccess("true");
            // setScore((prevScore) => prevScore + 1); // Decrement the score independently for each key
          }
          else {
            setLSuccess("false");
            // setScore((prevScore) => prevScore - 1); // Decrement the score independently for each key
          }
        }
      };
  
      document.addEventListener('keydown', handleKeyDown);
  
      // Cleanup the event listener on unmount
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, [aActive, dActive, jActive, lActive, aSuccess, dSuccess, jSuccess, lSuccess]);

    const toggleMusic = () => {
      if (audioRefListening.current && audioRefSetting.current) {
        // if ()
        // console.log("HI");
        if (audioRefListening.current.paused && audioRefSetting.current.paused) {
          audioRefListening.current.play();
          audioRefSetting.current.play();
        }
        else {
          audioRefListening.current.pause();
          audioRefSetting.current.pause();
        }
      }
    }

    const setMusicStage = () => {
      if (audioRefListening.current && audioRefSetting.current) {
        audioRefSetting.current.play();
        setTimeout(() => {
          if (audioRefSetting.current) audioRefSetting.current.pause();
        }, 2000)
      }
    }

    return (
        <>
            <input type="file" accept='audio/*' onChange={audioChange}/>
            <h1>Meyda Demo</h1>
            <p>{level}</p>
            <p>{score}</p>

            <div style={{display: "flex", gap: 20}}>
              <div style={{display: "flex", flexDirection: "column"}}>
                <p style={styleOne}>A</p>
                <p>{aSuccess}</p>
              </div>

              <div style={{display: "flex", flexDirection: "column"}}>
                <p style={styleTwo}>D</p>
                <p>{dSuccess}</p>
              </div>

              <div style={{display: "flex", flexDirection: "column"}}>
                <p style={styleThree}>J</p>
                <p>{jSuccess}</p>
              </div>

              <div style={{display: "flex", flexDirection: "column"}}>
                <p style={styleFour}>L</p>
                <p>{lSuccess}</p>
              </div>
            </div>

            <audio src={audioURL ?? ""} controls={false} ref={audioRefListening} loop={false} />
            <audio src={audioURL ?? ""} controls={false} ref={audioRefSetting} loop={false} />
            <button onClick={toggleMusic}>Play/Pause</button>
            <button onClick={setMusicStage}>Set Stage</button>


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
            <p>{(chromaArray[11]>0.5)? 1111 : 2}</p>  */}


            <div id='gamecontainer'>
              <div className='pilar' ref={aPillar}>hi</div>
              <div className='pilar' ref={bPillar}>hi</div>
              <div className='pilar' ref={cPillar}>hi</div>
              <div className='pilar' ref={dPillar}>hi</div>
            </div>


            <p>{range1}</p>
            <p>{range2}</p>
            <p>{range3}</p>
            <p>{range4}</p>
{/* 
            <p>{chromaArray[0].toFixed(2)}</p>
            <p>{chromaArray[1].toFixed(2)}</p>
            <p>{chromaArray[2].toFixed(2)}</p>
            <p>{chromaArray[3].toFixed(2)}</p>
            <p>{chromaArray[4].toFixed(2)}</p>
            <p>{chromaArray[5].toFixed(2)}</p>
            <p>{chromaArray[6].toFixed(2)}</p>
            <p>{chromaArray[7].toFixed(2)}</p>
            <p>{chromaArray[8].toFixed(2)}</p>
            <p>{chromaArray[9].toFixed(2)}</p>
            <p>{chromaArray[10].toFixed(2)}</p>
            <p>{chromaArray[11].toFixed(2)}</p>  */}
        </>
    )
}



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