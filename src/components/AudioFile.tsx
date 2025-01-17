"use client";

import Meyda from 'meyda';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { js } from 'three/tsl';


import "./audiofile.css"

// function stopWatch() {

// }

export function AudioFile() {    
    const [audioURL, setAudioURL] = useState<string | null>(null)
    const audioRefListening = useRef<HTMLAudioElement>(null);
    const audioRefSetting = useRef<HTMLAudioElement>(null);

    const aPillar = useRef<HTMLDivElement>(null);
    const dPillar = useRef<HTMLDivElement>(null);
    const jPillar = useRef<HTMLDivElement>(null);
    const lPillar = useRef<HTMLDivElement>(null);

    const musicSource = useRef<MediaElementAudioSourceNode>(null);
    const [level, setLevel] = useState<number>(0);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // stopwatch
    const [stopwatchActive, setStopwatchActive] = useState<boolean>(false);
    const [stPaused, setStPaused] = useState<boolean>(true);
    const [time, setTime] = useState<number>(0);

    useEffect(() => {

      if (stopwatchActive && !stPaused) {
        intervalRef.current = setInterval(() => {
          setTime((time) => time + 10);
          console.log(time);

        }, 10)}
      else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null
        };
      }
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null
        };
      }
      }, [stopwatchActive, stPaused]);

    const [aList, setAList] = useState<number[]>([]);
    const [dList, setDList] = useState<number[]>([]);
    const [jList, setJList] = useState<number[]>([]);
    const [lList, setLList] = useState<number[]>([]);


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
            const gainNode = audioContext.createGain();
            const source = audioContext.createMediaElementSource(audioRefSetting.current); 
            source.connect(gainNode);
            gainNode.connect(audioContext.destination);
            gainNode.gain.value = 0;
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
        { key: 'a', state: aActive, successState: aSuccess, setState: setAActive, setSuccess: setASuccess, pillar: aPillar, pillarClass: "aPillar", list : aList, setList : setAList },
        { key: 'd', state: dActive, successState: dSuccess, setState: setDActive, setSuccess: setDSuccess, pillar: dPillar, pillarClass: "dPillar", list : dList, setList : setDList   },
        { key: 'j', state: jActive, successState: jSuccess, setState: setJActive, setSuccess: setJSuccess, pillar: jPillar, pillarClass: "jPillar", list : jList, setList : setJList   },
        { key: 'l', state: lActive, successState: lSuccess, setState: setLActive, setSuccess: setLSuccess, pillar: lPillar, pillarClass: "lPillar", list : lList, setList : setLList   },
      ];
    
      buttonStates.forEach(({ key, state, successState, setState, setSuccess, pillar, pillarClass, list, setList }) => {
        // If the button state is already set, skip the update
        if (state) return;
    
        const spectrumRange = getAmplitudeRangeForKey(key);
        const avgAmplitude = spectrumRange.reduce((sum, idx) => sum + amplitudeSpectrum[idx], 0) / spectrumRange.length;
    
        if (avgAmplitude > 1.5) {
          // Set the button state to true when the amplitude exceeds the threshold
          setState(true);

          setList(prevList => [...prevList, ((time + 2000)/1000)]);

          if (pillar.current) {
            const newEle = document.createElement('p');
            newEle.classList.add(pillarClass)
            newEle.classList.add("newEle")
            newEle.textContent= ""
            pillar.current.appendChild(newEle);
            newEle.addEventListener("animationend", () => {
              pillar.current?.removeChild(newEle);
            })
          }
    
          // Handle the timeout for each button independently
          setTimeout(() => {
            setState(false);
          }, 750);
        }
        else {
          setState(false);
        }
      });
    }, [amplitudeSpectrum, aActive, dActive, jActive, lActive, aSuccess, dSuccess, jSuccess, lSuccess]);

    useEffect(() => {
      console.log("AList", aList);
      if (aList.length > 0 && aList[0] + 0.15 < time/1000) {
        setScore(score => score - 1);
        setAList(aList => aList.slice(1));


        const message = document.createElement('p');
        message.classList.add("message")
        message.classList.add("messageA");
        message.classList.add("miss");
        message.textContent= "missed";
        if (aPillar.current) aPillar.current.appendChild(message);
        setTimeout(() => {
          if (aPillar.current) aPillar.current.removeChild(message);  
        }, 500);
      }
    }, [aList, time])
    
    useEffect(() => {
      console.log("DList", dList);
      if (dList.length > 0 && dList[0] + 0.15 < time/1000) {
        setScore(score => score - 1);
        setDList(dList => dList.slice(1));

        const message = document.createElement('p');
        message.classList.add("message")
        message.classList.add("messageD");
        message.classList.add("miss");
        message.textContent= "missed";
        if (dPillar.current) dPillar.current.appendChild(message);
        setTimeout(() => {
          if (dPillar.current) dPillar.current.removeChild(message);  
        }, 500);
      }
    }, [dList, time])

    useEffect(() => {
      console.log("JList", jList);
      if (jList.length > 0 && jList[0] + 0.15 < time/1000) {
        setScore(score => score - 1);
        setJList(jList => jList.slice(1));

        const message = document.createElement('p');
        message.classList.add("message")
        message.classList.add("messageJ");
        message.classList.add("miss");
        message.textContent= "missed";
        if (jPillar.current) jPillar.current.appendChild(message);
        setTimeout(() => {
          if (jPillar.current) jPillar.current.removeChild(message);  
        }, 500);
      }
    }, [jList, time])

    useEffect(() => {
      console.log("LList", lList);
      if (lList.length > 0 && lList[0] + 0.15 < time/1000) {
        setScore(score => score - 1);
        setLList(lList => lList.slice(1));

        const message = document.createElement('p');
        message.classList.add("message")
        message.classList.add("messageL");
        message.classList.add("miss");
        message.textContent= "missed";
        if (lPillar.current) lPillar.current.appendChild(message);
        setTimeout(() => {
          if (lPillar.current) lPillar.current.removeChild(message);  
        }, 500);
      }
    }, [lList, time])

    useEffect(() => {
      const handleKeyDown = (event: { key: string; }) => {
        // console.log(event.key);
        if (event.key === 'a' || event.key === 'A' ) {
          console.log('A key pressed!');
          const message = document.createElement('p');
          message.classList.add("message")
          message.classList.add("messageA");

          if (aList.length === 0) {
            console.log("ex1", aList, time)
            setScore(score => score - 1);
            console.log("missed")

            message.classList.add("miss");
            message.textContent= "missed";
            if (aPillar.current) aPillar.current.appendChild(message);
            setTimeout(() => {
              if (aPillar.current) aPillar.current.removeChild(message);  
            }, 500);
          }
          else {
            if ((time/1000) < aList[0] - 0.15) {
              setScore(score => score - 1);
              console.log("ex2", aList, (time/1000))
              console.log("early")

              message.classList.add("miss");
              message.textContent= "early";
              if (aPillar.current) aPillar.current.appendChild(message);
              setTimeout(() => {
                if (aPillar.current) aPillar.current.removeChild(message);  
              }, 500);
            }

            else if (aList[0] + 0.07 >= (time/1000) && (time/1000) > aList[0] - 0.07) {
              setScore(score => score + 1);
              setAList(aList => aList.slice(1));
              console.log("ex3", aList, (time/1000))
              console.log("perfect")
              
              message.classList.add("success");
              message.textContent= "perfect";
              if (aPillar.current) aPillar.current.appendChild(message);
              setTimeout(() => {
                if (aPillar.current) aPillar.current.removeChild(message);  
              }, 500);
            }


            else if (aList[0] + 0.15 >= (time/1000) && (time/1000) > aList[0] - 0.15) {
              setScore(score => score + 1);
              setAList(aList => aList.slice(1));
              console.log("ex3", aList, (time/1000))
              console.log("hit")
              
              message.classList.add("success");
              message.textContent= "success";
              if (aPillar.current) aPillar.current.appendChild(message);
              setTimeout(() => {
                if (aPillar.current) aPillar.current.removeChild(message);  
              }, 500);
            }
          }
        }

        if (event.key === 'd' || event.key === 'D' ) {
          console.log('D key pressed!');
          const message = document.createElement('p');
          message.classList.add("message")
          message.classList.add("messageD");
          if (dList.length === 0) {
            console.log("ex1", dList, time)
            setScore(score => score - 1);
            console.log("missed")

            message.classList.add("miss");
            message.textContent= "missed";
            if (dPillar.current) dPillar.current.appendChild(message);
            setTimeout(() => {
              if (dPillar.current) dPillar.current.removeChild(message);  
            }, 500);
          }
          else {
            if ((time/1000) < dList[0] - 0.15) {
              setScore(score => score - 1);
              console.log("ex2", dList, (time/1000))
              console.log("early")

              message.classList.add("miss");
              message.textContent= "early";
              if (dPillar.current) dPillar.current.appendChild(message);
              setTimeout(() => {
                if (dPillar.current) dPillar.current.removeChild(message);  
              }, 500);
            }
            else if (dList[0] + 0.07 >= (time/1000) && (time/1000) > dList[0] - 0.07) {
              setScore(score => score + 1);
              setDList(dList => dList.slice(1));
              console.log("ex3", dList, (time/1000))
              console.log("hit")
              message.classList.add("success");
              message.textContent= "perfect";
              if (dPillar.current) dPillar.current.appendChild(message);
              setTimeout(() => {
                if (dPillar.current) dPillar.current.removeChild(message);  
              }, 500);
            }
            else if (dList[0] + 0.15 >= (time/1000) && (time/1000) > dList[0] - 0.15) {
              setScore(score => score + 1);
              setDList(dList => dList.slice(1));
              console.log("ex3", dList, (time/1000))
              console.log("hit")
              message.classList.add("success");
              message.textContent= "success";
              if (dPillar.current) dPillar.current.appendChild(message);
              setTimeout(() => {
                if (dPillar.current) dPillar.current.removeChild(message);  
              }, 500);
            }
          }
        }
        
        if (event.key === 'j' || event.key === 'J' ) {
          console.log('J key pressed!');
          const message = document.createElement('p');
          message.classList.add("message")
          message.classList.add("messageJ");

          if (jList.length === 0) {
            console.log("ex1", jList, time)
            setScore(score => score - 1);
            console.log("missed")

            message.classList.add("miss");
            message.textContent= "missed";
            if (jPillar.current) jPillar.current.appendChild(message);
            setTimeout(() => {
              if (jPillar.current) jPillar.current.removeChild(message);  
            }, 500);
          }
          else {
            if ((time/1000) < jList[0] - 0.15) {
              setScore(score => score - 1);
              console.log("ex2", jList, (time/1000))
              console.log("early")

              message.classList.add("miss");
              message.textContent= "early";
              if (jPillar.current) jPillar.current.appendChild(message);
              setTimeout(() => {
                if (jPillar.current) jPillar.current.removeChild(message);  
              }, 500);
            }
            else if (jList[0] + 0.07 >= (time/1000) && (time/1000) > jList[0] - 0.07) {
              setScore(score => score + 1);
              setJList(jList => jList.slice(1));
              console.log("ex3", jList, (time/1000))
              console.log("hit")
              message.classList.add("success");
              message.textContent= "perfect";
              if (jPillar.current) jPillar.current.appendChild(message);
              setTimeout(() => {
                if (jPillar.current) jPillar.current.removeChild(message);  
              }, 500);
            }
            else if (jList[0] + 0.15 >= (time/1000) && (time/1000) > jList[0] - 0.15) {
              setScore(score => score + 1);
              setJList(jList => jList.slice(1));
              console.log("ex3", jList, (time/1000))
              console.log("hit")
              message.classList.add("success");
              message.textContent= "success";
              if (jPillar.current) jPillar.current.appendChild(message);
              setTimeout(() => {
                if (jPillar.current) jPillar.current.removeChild(message);  
              }, 500);
            }
          }
        }
        
        if (event.key === 'l' || event.key === 'L' ) {
          console.log('L key pressed!');
          const message = document.createElement('p');
          message.classList.add("message")
          message.classList.add("messageL");

          if (lList.length === 0) {
            console.log("ex1", lList, time)
            setScore(score => score - 1);
            console.log("missed")

            message.classList.add("miss");
            message.textContent= "missed";
            if (lPillar.current) lPillar.current.appendChild(message);
            setTimeout(() => {
              if (lPillar.current) lPillar.current.removeChild(message);  
            }, 500);
          }
          else {
            if ((time/1000) < lList[0] - 0.15) {
              setScore(score => score - 1);
              console.log("ex2", lList, (time/1000))
              console.log("early")

              message.classList.add("miss");
              message.textContent= "early";
              if (lPillar.current) lPillar.current.appendChild(message);
              setTimeout(() => {
                if (lPillar.current) lPillar.current.removeChild(message);  
              }, 500);
            }
            else if (lList[0] + 0.07 >= (time/1000) && (time/1000) > lList[0] - 0.07) {
              setScore(score => score + 1);
              setLList(lList => lList.slice(1));
              console.log("ex3", lList, (time/1000))
              console.log("hit");
              message.classList.add("success");
              message.textContent= "perfect";
              if (lPillar.current) lPillar.current.appendChild(message);
              setTimeout(() => {
                if (lPillar.current) lPillar.current.removeChild(message);  
              }, 500);
            }
            else if (lList[0] + 0.15 >= (time/1000) && (time/1000) > lList[0] - 0.15) {
              setScore(score => score + 1);
              setLList(lList => lList.slice(1));
              console.log("ex3", lList, (time/1000))
              console.log("hit");
              message.classList.add("success");
              message.textContent= "success";
              if (lPillar.current) lPillar.current.appendChild(message);
              setTimeout(() => {
                if (lPillar.current) lPillar.current.removeChild(message);  
              }, 500);
            }
          }
        }
      };
  
      document.addEventListener('keydown', handleKeyDown);
  
      // Cleanup the event listener on unmount
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, [aList, dList, jList, lList, time]);

    const toggleMusic = () => {
      const liiii = document.querySelectorAll('.newEle');
      console.log(liiii.length);
      if (audioRefListening.current && audioRefSetting.current) {
        // if ()
        // console.log("HI");
        if (audioRefListening.current.paused && audioRefSetting.current.paused) {
          audioRefListening.current.play();
          audioRefSetting.current.play();
          setStopwatchActive(true);
          setStPaused(false);
          for (let i = 0; i < liiii.length; i++) {
            (liiii[i] as HTMLParagraphElement).style.animationPlayState = "running";
          }
        }
        else {
          audioRefListening.current.pause();
          audioRefSetting.current.pause();
          setStopwatchActive(false);
          setStPaused(true);
          for (let i = 0; i < liiii.length; i++) {
            (liiii[i] as HTMLParagraphElement).style.animationPlayState = "paused";
          }
        }
      }
    }

    const setMusicStage = () => {
      if (audioRefListening.current && audioRefSetting.current) {
        audioRefSetting.current.play();
        audioRefListening.current.pause();
        setStopwatchActive(true);
        setStPaused(false);
        setTimeout(() => {
          if (audioRefListening.current)  audioRefListening.current.play();
        }, 2000)
      }
    }

    return (
        <>
            <input type="file" accept='audio/*' onChange={audioChange}/>
            <h1>Meyda Demo</h1>
            {/* <p>{level}</p>
            <p>{score}</p> */}

            {/* <div style={{display: "flex", gap: 20}}>
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
            </div> */}

            {/* <p>{time/1000}</p> */}

            <audio src={audioURL ?? ""} controls={false} ref={audioRefListening} loop={false} />
            <audio src={audioURL ?? ""} controls={false} ref={audioRefSetting} loop={false} />
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
              <div className='pilar' ref={dPillar}>hi</div>
              <div className='pilar' ref={jPillar}>hi</div>
              <div className='pilar' ref={lPillar}>hi</div>
            </div>
            <p>{score}</p>
            <button onClick={toggleMusic}>Play/Pause</button>

{/* 
            <p>{range1}</p>
            <p>{range2}</p>
            <p>{range3}</p>
            <p>{range4}</p> */}
        </>
    )
}