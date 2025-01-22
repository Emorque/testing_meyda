"use client";

import Meyda, { MeydaFeaturesObject } from 'meyda';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import "./audiofile.css";
import gsap from 'gsap';

export function AudioFile() {    
    const [audioURL, setAudioURL] = useState<string | null>(null)
    const audioRefListening = useRef<HTMLAudioElement>(null);
    const audioRefSetting = useRef<HTMLAudioElement>(null);
    const [stageBtn, setStageBtn] = useState<boolean>(false); 

    const gameContainer = useRef<HTMLDivElement>(null);
    const gameWrapper = useRef<HTMLDivElement>(null);
    const aCircle = useRef<HTMLDivElement>(null);
    const dCircle = useRef<HTMLDivElement>(null);

    const [rotated, setRotate] = useState<boolean>(false);
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

    const [amplitudeSpectrum, setAmplitudeSpectrum] = useState<Float32Array<ArrayBufferLike>>(new Float32Array(0));

    const [aActive, setAActive] = useState<boolean>(false);
    const [dActive, setDActive] = useState<boolean>(false);

    const [score, setScore] = useState<number>(0);
    const [hitCount, setHitCount] = useState<number>(0);
    const [missCount, setMissCount] = useState<number>(0);
    const [noteCount, setNoteCount] = useState<number>(0);

    const [stageSet, setStageSet] = useState<boolean>(false);
    const [musicSet, setMusicSet] = useState<boolean>(false);

    const audioChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAudioURL(URL.createObjectURL(file));
        setMusicSet(true);
        setStageBtn(false);
        setScore(0);
        setHitCount(0);
        setMissCount(0);
        setNoteCount(0);
        setAList([]);
        setDList([]);
        updateContext();
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
              callback: (features: MeydaFeaturesObject) => {
                if (features.loudness.specific) {
                  setAmplitudeSpectrum(features.loudness.specific);
                }
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
      let aSetThisFrame = false;
      let dSetThisFrame = false;

      const buttonStates = [
        { key: 'a', state: aActive, setState: setAActive, circle: aCircle, circleClass: "aCurve", setList : setAList, oppositeList: dList },
        { key: 'd', state: dActive, setState: setDActive, circle: dCircle, circleClass: "dCurve", setList : setDList, oppositeList: aList },
        { key: 'j', state: aActive, setState: setAActive, circle: aCircle, circleClass: "aCurve", setList : setAList, oppositeList: dList },
        { key: 'l', state: dActive, setState: setDActive, circle: dCircle, circleClass: "dCurve", setList : setDList, oppositeList: aList },
      ];

      // buttonStates.forEach(({ key, state, setState, pillar, pillarClass, setList }) => {
      buttonStates.forEach(({ key, state, setState, circle, circleClass, setList, oppositeList }) => { 
      // If the button state is already set, skip the update
        if (state) return;
        if (oppositeList.length > 0 && (oppositeList[-1] + 0.30 >= ((time + 2000)/1000))) {
          return;
        }
        const spectrumRange = getAmplitudeRangeForKey(key);
        const avgAmplitude = spectrumRange.reduce((sum, idx) => sum + amplitudeSpectrum[idx], 0) / spectrumRange.length;
            
        if (avgAmplitude > 1.5) {
          if (key === 'a' || key === 'j') {
            if (!aSetThisFrame) {
              setState(true);
              setNoteCount(count => count + 1);
              setList(prevList => [...prevList, ((time + 2000) / 1000)]);
              aSetThisFrame = true; // Mark that 'a' or 'j' was activated in this frame
            }
            else {
              return
            }
          } 
          else if (key === 'd' || key === 'l') {
            if (!dSetThisFrame) {
              setNoteCount(count => count + 1);
              setState(true);
              setList(prevList => [...prevList, ((time + 2000) / 1000)]);
              dSetThisFrame = true; // Mark that 'd' or 'l' was activated in this frame
            }
            else {
              return
            }
          }
          // else if (key === 'd' || key === 'l') return;

          if (circle.current) {
            const newEle = document.createElement('p');
            newEle.classList.add(circleClass)
            newEle.classList.add("curve")
            newEle.textContent= ""
            circle.current.appendChild(newEle);
            newEle.addEventListener("animationend", () => {
              circle.current?.removeChild(newEle);
            })
          }
          // Handle the timeout for each button independently
          if (key === 'a' || key === 'j') {
            setTimeout(() => {
              setState(false);
            }, 1000);
          }
          else if (key === 'd' || key === 'l') {
            setTimeout(() => {
              setState(false);
            }, 750);
          }

        }
      });
    }, [amplitudeSpectrum, aActive, dActive, time, dList, aList]);

    useEffect(() => {
      // console.log("AList", aList);
      if (aList.length > 0 && aList[0] + 0.15 < time/1000) {
        setScore(score => score - 1);
        setMissCount(count => count + 1);
        setAList(aList => aList.slice(1));

        const message = document.createElement('p');
        message.classList.add("aMessage");
        message.classList.add("message");
        message.textContent= "missed";
        if (gameWrapper.current) gameWrapper.current.appendChild(message);
        setTimeout(() => {
          if (gameWrapper.current) gameWrapper.current.removeChild(message);  
        }, 500);
      }
    }, [aList, time])
    
    useEffect(() => {
      // console.log("DList", dList);
      if (dList.length > 0 && dList[0] + 0.20 < time/1000) {
        setScore(score => score - 1);
        setMissCount(count => count + 1);
        setDList(dList => dList.slice(1));

        const message = document.createElement('p');
        message.classList.add("dMessage");
        message.classList.add("message");
        message.textContent= "missed";
        if (gameWrapper.current) gameWrapper.current.appendChild(message);
        setTimeout(() => {
          if (gameWrapper.current) gameWrapper.current.removeChild(message);  
        }, 500);
      }
    }, [dList, time])


    useEffect(() => {
      const handleKeyDown = (event: { key: string; }) => {
        if (event.key === 'a' || event.key === 'A' ) {
          console.log('A key pressed!');
          const message = document.createElement('p');
          message.classList.add("message");
          setABtn(true);

          if (rotated) {
            message.classList.add("dMessage")
            if (dList.length === 0) {
            }
            else {
              if ((time/1000) < dList[0] - 0.25) {  
                // message.classList.add("miss");
                message.textContent= "early";
                message.classList.add("early");
                if (gameWrapper.current) gameWrapper.current.appendChild(message);
                setTimeout(() => {
                  if (gameWrapper.current) gameWrapper.current.removeChild(message);  
                }, 500);
              }
              else if (dList[0] + 0.15 >= (time/1000) && (time/1000) > dList[0] - 0.15) {
                setScore(score => score + 5);
                setHitCount(count => count + 1);
                setDList(dList => dList.slice(1));
                console.log("ex3", dList, (time/1000))
                console.log("hit")
                // message.classList.add("success");
                // message.classList.add("successD");
                message.textContent= "perfect";
                message.style.backgroundColor = "green";
                if (gameWrapper.current) gameWrapper.current.appendChild(message);
                setTimeout(() => {
                  if (gameWrapper.current) gameWrapper.current.removeChild(message);  
                }, 500);
              }
              else if (dList[0] + 0.20 >= (time/1000) && (time/1000) > dList[0] - 0.20) {
                setScore(score => score + 3);
                setHitCount(count => count + 1);
                setDList(dList => dList.slice(1));
                console.log("ex3", dList, (time/1000))
                console.log("hit")
                message.classList.add("successD");
                message.textContent= "success";
                message.style.backgroundColor = "green";
                if (gameWrapper.current) gameWrapper.current.appendChild(message);
                setTimeout(() => {
                  if (gameWrapper.current) gameWrapper.current.removeChild(message);  
                }, 500);
              }
            }
          }

          else {
            message.classList.add("aMessage")
            if (aList.length === 0) {
              console.log("ex1", aList, time)
              // setScore(score => score - 1);
              // setMissCount(count => count - 1);
              console.log("missed")
  
              // message.classList.add("miss");
              // message.textContent= "missed";
              // if (gameWrapper.current) gameWrapper.current.appendChild(message);
              // setTimeout(() => {
              //   if (gameWrapper.current) gameWrapper.current.removeChild(message);  
              // }, 500);
            }
            else {
              if ((time/1000) < aList[0] - 0.25) {
                // setScore(score => score - 1);
                // setMissCount(count => count - 1);
                console.log("ex2", aList, (time/1000))
                console.log("early")
  
                message.textContent= "early";
                message.classList.add("early");
                if (gameWrapper.current) gameWrapper.current.appendChild(message);
                setTimeout(() => {
                  if (gameWrapper.current) gameWrapper.current.removeChild(message);  
                }, 500);
              }
  
              else if (aList[0] + 0.15 >= (time/1000) && (time/1000) > aList[0] - 0.15) {
                setScore(score => score + 5);
                setHitCount(count => count + 1);
                setAList(aList => aList.slice(1));
                console.log("ex3", aList, (time/1000))
                console.log("perfect")
                
                message.classList.add("success");
                message.textContent= "perfect";
                message.style.backgroundColor = "green";
                if (gameWrapper.current) gameWrapper.current.appendChild(message);
                setTimeout(() => {
                  if (gameWrapper.current) gameWrapper.current.removeChild(message);  
                }, 500);
              }
  
  
              else if (aList[0] + 0.20 >= (time/1000) && (time/1000) > aList[0] - 0.20) {
                setScore(score => score + 3);
                setHitCount(count => count + 1);
                setAList(aList => aList.slice(1));
                console.log("ex3", aList, (time/1000))
                console.log("hit")
                
                message.classList.add("success");
                message.textContent= "success";
                message.style.backgroundColor = "green";
                if (gameWrapper.current) gameWrapper.current.appendChild(message);
                setTimeout(() => {
                  if (gameWrapper.current) gameWrapper.current.removeChild(message);  
                }, 500);
              }
            }
          }
        }

        if (event.key === 'd' || event.key === 'D' ) {
          setDBtn(true);

          if (dList.length === 0 || aList.length === 0) {
            setScore(score => score - 10);
            const message = document.createElement('p');
            message.classList.add("doubleMessage");
            message.classList.add("miss");
            message.textContent= "missed";
            if (gameWrapper.current) gameWrapper.current.appendChild(message);
            setTimeout(() => {
              if (gameWrapper.current) gameWrapper.current.removeChild(message);  
            }, 500);
          }
          else {
            if ((dList[0] + 0.15 >= (time/1000) && (time/1000) > dList[0] - 0.15) && (aList[0] + 0.15 >= (time/1000) && (time/1000) > aList[0] - 0.15) ){
              setScore(score => score + 3);
              setHitCount(score => score + 2);
              setDList(dList => dList.slice(1));
              setAList(aList => aList.slice(1));

              const messageA = document.createElement('p');
              messageA.classList.add("message");
              messageA.classList.add("aMessage")
              messageA.classList.add("success");
              messageA.style.backgroundColor = "green";
              messageA.textContent= "perfect";

              const messageD = document.createElement('p');
              messageD.classList.add("message");
              messageD.classList.add("dMessage")
              messageD.classList.add("success");
              messageD.style.backgroundColor = "green";
              messageD.textContent= "perfect";

              if (gameWrapper.current) {
                gameWrapper.current.appendChild(messageA);
                gameWrapper.current.appendChild(messageD);
              }
              setTimeout(() => {
                if (gameWrapper.current) {
                  gameWrapper.current.removeChild(messageA);  
                  gameWrapper.current.removeChild(messageD);  
                }
              }, 500);
            }
          }
        }
        
        if (event.key === 'k' || event.key === "K") {
          setKBtn(true);
          handleFlip()
        } 
      };
  
      document.addEventListener('keydown', handleKeyDown);
  
      // Cleanup the event listener on unmount
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, [aList, dList, time, rotated]);

    
    useEffect(() => {
      const handleKeyUp = (event: { key: string; }) => {
        if (event.key === 'a' || event.key === 'A') {
          setABtn(false);
        }
        if (event.key === 'd' || event.key === 'D') {
          setDBtn(false);
        }
        if (event.key === 'k' || event.key === 'K') {
          setKBtn(false);
        }
      }
      document.addEventListener('keyup', handleKeyUp);
  
      // Cleanup the event listener on unmount
      return () => {
        document.removeEventListener('keyup', handleKeyUp);
      };
    }, []);

    const handleFlip = () => {
      console.log("test");
      if (rotated) {
        gsap.to("#gamecontainer-circle", {rotate: "60deg"})
        setRotate(false);
      } 
      else {
        gsap.to("#gamecontainer-circle", {rotate: "120deg"})
        setRotate(true);
      }
    }

    const aStyle = {
      opacity: rotated? "0.3" : "1",
      transition: 'opacity 0.2s linear'
    }

    const dStyle = {
      opacity: rotated? "1" : "0.3",
      transition: 'opacity 0.2s linear'
    }

    const [aBtn, setABtn] = useState<boolean>(false);
    const [dBtn, setDBtn] = useState<boolean>(false);
    const [kBtn, setKBtn] = useState<boolean>(false); 
    
    const btnStyleA = {
      backgroundColor: aBtn? "grey" : "black",
      color: aBtn? "black" : "white",
      padding: 5,
    }
    const btnStyleD = {
      backgroundColor: dBtn? "grey" : "black",
      color: dBtn? "black" : "white",
      padding: 5,
    }
    const btnStyleK = {
      backgroundColor: kBtn? "grey" : "black",
      color: kBtn? "black" : "white",
      padding: 5,
    }
    const activeCircle = {
      backgroundColor: rotated? "rgba(182, 34, 34)" : "rgba(25, 86, 128)",
      width: "fit-content",
      color: "white",
      padding: 5,
    }

    const toggleMusic = () => {
      const curves = document.querySelectorAll('.curve');
      if (audioRefListening.current && audioRefSetting.current) {
        if (audioRefListening.current.paused && audioRefSetting.current.paused) {
          audioRefListening.current.play();
          audioRefSetting.current.play();
          setStopwatchActive(true);
          setStPaused(false);
          for (let i = 0; i < curves.length; i++) {
            (curves[i] as HTMLParagraphElement).style.animationPlayState = "running";
          }
        }
        else {
          audioRefListening.current.pause();
          audioRefSetting.current.pause();
          setStopwatchActive(false);
          setStPaused(true);
          for (let i = 0; i < curves.length; i++) {
            (curves[i] as HTMLParagraphElement).style.animationPlayState = "paused";
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
        setStageBtn(true)
        setTimeout(() => {
          if (audioRefListening.current)  audioRefListening.current.play();
          setStageSet(true);
        }, 2000)
      }
    }

    return (
        <>
            <h1>Meyda Demo</h1>
            <div>
              <p>Press &quot;A&quot; when the curve is just about to hit the edge on the current &quot;Active Area&quot;</p>
              <br/>
              <p>Press &quot;D&quot; when you want to hit both curves at once. <br/>Only works if one curve in each area are going to hit the edge near the same time</p>
              <br/>
              <p>Press &quot;K&quot; to rotate the circle <br/> The section that is highlighted is the &quot;Active Area&quot;</p>
              <br/>
              <p>Enter your music file below and Presss &quot;Set Stage&quot;</p>
            </div>
            <input type="file" accept='audio/*' onChange={audioChange}/>

            <audio src={audioURL ?? ""} controls={false} ref={audioRefListening} loop={false} />
            <audio src={audioURL ?? ""} controls={false} ref={audioRefSetting} loop={false} />
            {musicSet && <button onClick={setMusicStage} disabled={stageBtn}>Set Stage</button>}
            <div style={activeCircle}> Active </div>

            <div ref={gameWrapper} style={{position: "relative"}}>
              <div id='gamecontainer-circle' ref={gameContainer}>
                <div className='click-Area caA' style={aStyle} ref={aCircle}></div>
                <div className='click-Area caD' style={dStyle} ref={dCircle}></div>

              </div>
              <div id='button-container'>
                <div style={btnStyleA}>A</div>
                <div style={btnStyleD}>D</div>
                <div style={btnStyleK}>K</div>
              </div>
            </div>
            <div>
              <p>Score: {score}</p>
              <p>Hit Count: {hitCount}</p>
              <p>Miss Count: {missCount}</p>
              <p>Note Count: {noteCount}</p>
            </div>
            
            {stageSet && <button onClick={toggleMusic}>Play/Pause</button>}
        </>
    )
}