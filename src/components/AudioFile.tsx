"use client";

import Meyda, { MeydaFeaturesObject } from 'meyda';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import "./audiofile.css";
import gsap from 'gsap';

export function AudioFile() {    
    const [audioURL, setAudioURL] = useState<string | null>(null)
    const audioRefListening = useRef<HTMLAudioElement>(null);
    const audioRefSetting = useRef<HTMLAudioElement>(null);
    const mapRef = useRef<HTMLAudioElement>(null);
    const [stageBtn, setStageBtn] = useState<boolean>(false); 

    const gameContainer = useRef<HTMLDivElement>(null);
    const gameWrapper = useRef<HTMLDivElement>(null);
    const aCircle = useRef<HTMLDivElement>(null);
    const dCircle = useRef<HTMLDivElement>(null);
    const sCircle = useRef<HTMLDivElement>(null);
    const barRef = useRef<HTMLDivElement>(null);
    const barContainerRef = useRef<HTMLDivElement>(null);

    const [rotated, setRotate] = useState<boolean>(true);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // stopwatch
    const [stopwatchActive, setStopwatchActive] = useState<boolean>(false);
    const [stPaused, setStPaused] = useState<boolean>(true);
    const [time, setTime] = useState<number>(0);

    const [aList, setAList] = useState<number[]>([]);
    const [aListBtn, setAListBtn] = useState<number[]>([])

    const [dList, setDList] = useState<number[]>([]);
    const [dListBtn, setDListBtn] = useState<number[]>([])
  
    const [sList, setSList] = useState<number[]>([]);

    const [amplitudeSpectrum, setAmplitudeSpectrum] = useState<Float32Array<ArrayBufferLike>>(new Float32Array(0));

    const [aActive, setAActive] = useState<boolean>(false);
    const [dActive, setDActive] = useState<boolean>(false);
    const [sActive, setSActive] = useState<boolean>(false);

    const [aHold, setAHold] = useState<boolean>(false);
    const [dHold, setDHold] = useState<boolean>(false);
    const [jHold, setJHold] = useState<boolean>(false);
    const [kHold, setKHold] = useState<boolean>(false);

    const [beatBtn, setBeatBtn] = useState<boolean>(false);
    const [beatBtnHold, setBeatBtnHold] = useState<boolean>(false);

    const [score, setScore] = useState<number>(0);
    const [highScore, setHighScore] = useState<number>(0);
    const [hitCount, setHitCount] = useState<number>(0);
    const [missCount, setMissCount] = useState<number>(0);
    const [noteCount, setNoteCount] = useState<number>(0);

    const [stageSet, setStageSet] = useState<boolean>(false);
    const [musicSet, setMusicSet] = useState<boolean>(false);


    const [leftBtnActive, setLeftBtnActive] = useState<boolean>(false);
    const [leftBtnHold, setLeftBtnHold] = useState<boolean>(false);

    const [rightBtnActive, setRightBtnActive] = useState<boolean>(false);
    const [rightBtnHold, setRightBtnHold] = useState<boolean>(false);

    const [actionBtnActive, setActionBtnActive] = useState<boolean>(false);
    const [actionBtnHold, setActionBtnHold] = useState<boolean>(false);

    const [leftList, setLeftList] = useState<number[]>([]);
    const [leftBtnList, setLeftBtnList] = useState<number[]>([]);

    const [rightList, setRightList] = useState<number[]>([]);
    const [rightBtnList, setRightBtnList] = useState<number[]>([]);

    const [toggleBtnHold, setToggleBtnHold] = useState<boolean>(false);
    const [resetBtnHold, setResetBtnHold] = useState<boolean>(false);

    const audioChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAudioURL(URL.createObjectURL(file));
        // setAudioURL('https://9boushb4a7.ufs.sh/f/9Jv1QVILGRy4BnZDzY7GTJ0cX8hyuefiOLVSvntDKg5EZ1dl');

        setTimeout(() => {
          setMusicSet(true);
        }, 500)

        if (audioRefSetting.current) {
          audioRefSetting.current.pause();
          audioRefSetting.current.currentTime = 0;
        }        
        if (audioRefListening.current) {
          audioRefListening.current.pause();
          audioRefListening.current.currentTime = 0;
        }
        setStageBtn(false);
        setStageSet(false);

        setScore(0);
        setHighScore(0);
        setHitCount(0);
        setMissCount(0);
        setNoteCount(0);

        // setAList([]);
        // setDList([]);
        setLeftList([]);
        setRightList([]);

        setStopwatchActive(false);
        setStPaused(true);
        setTime(0);
        
        document.querySelectorAll(".curveHold").forEach(e => e.remove());
        document.querySelectorAll(".curve").forEach(e => e.remove());
        if (barRef.current) barRef.current.style.height = '0px';
        if (barContainerRef.current) barContainerRef.current.style.border = '10px solid rgb(250, 238, 223)';

        updateContext();
    }

    function updateContext() {
        const audioContext = new AudioContext;

        if (audioRefSetting.current) {
            audioRefSetting.current.crossOrigin = 'anonymous' /* Needed for uploadthing audio src to be analyzed. Without this, the audio can only be heard*/
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

    useEffect(() => {

      if (stopwatchActive && !stPaused) {
        intervalRef.current = setInterval(() => {
          setTime((time) => time + 10);
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

    const getAmplitudeRangeForKey = (key: string): number[] => {
      switch (key) {
        case 'a':
          return [0, 1, 2, 3, 4, 5, 6, 7];
        case 'd':
          return [8, 9, 10, 11, 12, 13, 14, 15];
        case 's':
          return [16, 17, 18, 19, 20, 21, 22, 23];
        default:
          return [];
      }
    };
    
    
    useEffect(() => {
      // Button states with a timeout for each key
      const buttonStates = [
        { key: 'a', state: aActive, setState: setAActive, circle: aCircle, circleClass: "aCurve", setList : setAList},
        { key: 'd', state: dActive, setState: setDActive, circle: dCircle, circleClass: "dCurve", setList : setDList},
        { key: 's', state: sActive, setState: setSActive, circle: sCircle, circleClass: "wCurve", setList : setSList},
      ];
      buttonStates.forEach(({ key, state, setState, circle, circleClass, setList }) => { 
        if (state) return;
        const spectrumRange = getAmplitudeRangeForKey(key);
        const avgAmplitude = spectrumRange.reduce((sum, idx) => sum + amplitudeSpectrum[idx], 0) / spectrumRange.length;
        if (avgAmplitude > 1.5) {
          setState(true)
          setNoteCount(count => count + 1);
          setList(prevList => [...prevList, ((time + 2000) / 1000)]);
          if (circle.current) {
            if (circle === sCircle) {
              barContainerRef.current?.classList.add('pulsing');
              barContainerRef.current?.addEventListener("animationend", () => {
                barContainerRef.current?.classList.remove('pulsing');
              })

              barRef.current?.classList.add("heightChange"); 
              barRef.current?.addEventListener("animationend", () => {
                barRef.current?.classList.remove('heightChange');
              })
            }
            else {
              const newEle = document.createElement('p');
              newEle.classList.add(circleClass)
              newEle.classList.add("curve")
              newEle.textContent= ""
              circle.current.appendChild(newEle);
              newEle.addEventListener("animationend", () => {
                circle.current?.removeChild(newEle);
              })
            }
          }
          if (key === 'a' || key === 'd') {
            setTimeout(() => {
              setState(false)
            }, 500)  
          }
          else {
            setTimeout(() => {
              setState(false)
            }, 2500)
          }
        }
      });
    }, [amplitudeSpectrum, aActive, dActive, time, dList, aList, sList, sActive]);

    useEffect(() => {
      if (aList.length > 0 && aList[0] + 0.15 < time/1000) {
        setScore(score => score - 1);
        setMissCount(count => count + 1);
        console.log(aList[0])
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
      if (sList.length > 0 && sList[0] + 0.40 < time/1000) {
        setScore(score => score - 1);
        setMissCount(count => count + 1);
        setSList(sList => sList.slice(1));

        const message = document.createElement('p');
        message.classList.add("message");
        message.classList.add("sMessage");
        message.textContent= "missed";
        if (gameWrapper.current) gameWrapper.current.appendChild(message);
        setTimeout(() => {
          if (gameWrapper.current) gameWrapper.current.removeChild(message);  
        }, 500);
      }
    }, [sList, time])


    // useEffect(() => {
    //   const handleKeyDown = (event: { key: string; }) => {
    //     if (event.key === 'a' || event.key === 'A' ) {
    //       if (aHold) {
    //         return;
    //       }
    //       setAHold(true);
    //       const message = document.createElement('p');
    //       message.classList.add("message");
    //       setABtn(true);

    //       if (rotated) {
    //         message.classList.add("dMessage")
    //         if (dList.length === 0) {
    //         }
    //         else {
    //           if ((time/1000) < dList[0] - 0.25) {  
    //             // message.classList.add("miss");
    //             message.textContent= "early";
    //             message.classList.add("early");
    //             if (gameWrapper.current) gameWrapper.current.appendChild(message);
    //             setTimeout(() => {
    //               if (gameWrapper.current) gameWrapper.current.removeChild(message);  
    //             }, 500);
    //           }
    //           else if (dList[0] + 0.15 >= (time/1000) && (time/1000) > dList[0] - 0.15) {
    //             setScore(score => score + 5);
    //             setHitCount(count => count + 1);
    //             setDList(dList => dList.slice(1));
    //             message.textContent= "perfect";
    //             message.style.backgroundColor = "green";
    //             if (gameWrapper.current) gameWrapper.current.appendChild(message);
    //             setTimeout(() => {
    //               if (gameWrapper.current) gameWrapper.current.removeChild(message);  
    //             }, 500);
    //           }
    //           else if (dList[0] + 0.20 >= (time/1000) && (time/1000) > dList[0] - 0.20) {
    //             setScore(score => score + 3);
    //             setHitCount(count => count + 1);
    //             setDList(dList => dList.slice(1));
    //             message.classList.add("successD");
    //             message.textContent= "success";
    //             message.style.backgroundColor = "green";
    //             if (gameWrapper.current) gameWrapper.current.appendChild(message);
    //             setTimeout(() => {
    //               if (gameWrapper.current) gameWrapper.current.removeChild(message);  
    //             }, 500);
    //           }
    //         }
    //       }

    //       else {
    //         message.classList.add("aMessage")
    //         if (aList.length === 0) {
    //         }
    //         else {
    //           if ((time/1000) < aList[0] - 0.25) {  
    //             message.textContent= "early";
    //             message.classList.add("early");
    //             if (gameWrapper.current) gameWrapper.current.appendChild(message);
    //             setTimeout(() => {
    //               if (gameWrapper.current) gameWrapper.current.removeChild(message);  
    //             }, 500);
    //           }
  
    //           else if (aList[0] + 0.15 >= (time/1000) && (time/1000) > aList[0] - 0.15) {
    //             setScore(score => score + 5);
    //             setHitCount(count => count + 1);
    //             setAList(aList => aList.slice(1));

    //             message.classList.add("success");
    //             message.textContent= "perfect";
    //             message.style.backgroundColor = "green";
    //             if (gameWrapper.current) gameWrapper.current.appendChild(message);
    //             setTimeout(() => {
    //               if (gameWrapper.current) gameWrapper.current.removeChild(message);  
    //             }, 500);
    //           }
  
  
    //           else if (aList[0] + 0.20 >= (time/1000) && (time/1000) > aList[0] - 0.20) {
    //             setScore(score => score + 3);
    //             setHitCount(count => count + 1);
    //             setAList(aList => aList.slice(1));

    //             message.classList.add("success");
    //             message.textContent= "success";
    //             message.style.backgroundColor = "green";
    //             if (gameWrapper.current) gameWrapper.current.appendChild(message);
    //             setTimeout(() => {
    //               if (gameWrapper.current) gameWrapper.current.removeChild(message);  
    //             }, 500);
    //           }
    //         }
    //       }
    //     }

    //     if (event.key === 'j' || event.key === 'J' ) {
    //       if (jHold) {
    //         return;
    //       }
    //       setJHold(true);
    //       setJBtn(true);
    //       const message = document.createElement('p');
    //       message.classList.add("message");
    //       if (sList.length === 0) {
    //       }
    //       else {
    //         if ((time/1000) < sList[0] - 0.20) {  
    //           message.textContent= "early";
    //           message.classList.add("sMessageEarly");
    //           if (gameWrapper.current) gameWrapper.current.appendChild(message);
    //           setTimeout(() => {
    //             if (gameWrapper.current) gameWrapper.current.removeChild(message);  
    //           }, 500);
    //         }
    //         else if (sList[0] + 0.10 >= (time/1000) && (time/1000) > sList[0] - 0.10) {
    //           setScore(score => score + 5);
    //           setHitCount(count => count + 1);
    //           setSList(sList => sList.slice(1));

    //           message.classList.add("sMessage");
    //           message.textContent= "perfect";
    //           message.style.backgroundColor = "green";
    //           if (gameWrapper.current) gameWrapper.current.appendChild(message);
    //           setTimeout(() => {
    //             if (gameWrapper.current) gameWrapper.current.removeChild(message);  
    //           }, 500);
    //         }
    //         else if (sList[0] + 0.20 >= (time/1000) && (time/1000) > sList[0] - 0.20) {
    //           setScore(score => score + 3);
    //           setHitCount(count => count + 1);
    //           setSList(sList => sList.slice(1));
    //           message.classList.add("sMessage");
    //           message.textContent= "success";
    //           message.style.backgroundColor = "green";
    //           if (gameWrapper.current) gameWrapper.current.appendChild(message);
    //           setTimeout(() => {
    //             if (gameWrapper.current) gameWrapper.current.removeChild(message);  
    //           }, 500);
    //         }
    //       }
    //     }

    //     if (event.key === 'd' || event.key === 'D' ) {
    //       if (dHold) {
    //         return;
    //       }
    //       setDHold(true);
    //       setDBtn(true);

    //       if (dList.length === 0 || aList.length === 0) {
    //         setScore(score => score - 10);
    //         const message = document.createElement('p');
    //         message.classList.add("doubleMessage");
    //         message.classList.add("miss");
    //         message.textContent= "missed";
    //         if (gameWrapper.current) gameWrapper.current.appendChild(message);
    //         setTimeout(() => {
    //           if (gameWrapper.current) gameWrapper.current.removeChild(message);  
    //         }, 500);
    //       }
    //       else {
    //         if ((dList[0] + 0.15 >= (time/1000) && (time/1000) > dList[0] - 0.15) && (aList[0] + 0.15 >= (time/1000) && (time/1000) > aList[0] - 0.15) ){
    //           setScore(score => score + 3);
    //           setHitCount(score => score + 2);
    //           setDList(dList => dList.slice(1));
    //           setAList(aList => aList.slice(1));

    //           const messageA = document.createElement('p');
    //           messageA.classList.add("message");
    //           messageA.classList.add("aMessage")
    //           messageA.classList.add("success");
    //           messageA.style.backgroundColor = "green";
    //           messageA.textContent= "perfect";

    //           const messageD = document.createElement('p');
    //           messageD.classList.add("message");
    //           messageD.classList.add("dMessage")
    //           messageD.classList.add("success");
    //           messageD.style.backgroundColor = "green";
    //           messageD.textContent= "perfect";

    //           if (gameWrapper.current) {
    //             gameWrapper.current.appendChild(messageA);
    //             gameWrapper.current.appendChild(messageD);
    //           }
    //           setTimeout(() => {
    //             if (gameWrapper.current) {
    //               gameWrapper.current.removeChild(messageA);  
    //               gameWrapper.current.removeChild(messageD);  
    //             }
    //           }, 500);
    //         }
    //       }
    //     }
        
    //     if (event.key === 'k' || event.key === "K") {
    //       setKBtn(true);
    //       handleFlip()
    //     } 
    //     if (event.key === 'p' || event.key === "P") {
    //       resetGame();
    //     }
    //     if (event.key === 'q' || event.key === "Q") {
    //       toggleMusic();
    //     }
    //   };
  
    //   document.addEventListener('keydown', handleKeyDown);
  
    //   return () => {
    //     document.removeEventListener('keydown', handleKeyDown);
    //   };
    // }, [aList, dList, sList, time, rotated, dHold, aHold, jHold]);


    useEffect(() => {
      const handleKeyDown = (event: { key: string; }) => {
        if (event.key === 'a' || event.key === 'A') {
          setLeftBtnActive(true);
          setLeftBtnHold(true);
          moveLeft();
        }
        if (event.key === 'd' || event.key === 'D') {
          setRightBtnActive(true);
          setRightBtnHold(true);
          moveRight();
        }
        if (event.key === 'k' || event.key === 'K') {
          setActionBtnActive(true)
          if (actionBtnHold) return
          setActionBtnHold(true);
          const message = document.createElement('p');
          message.classList.add("message");
          if (!rotated) {
            message.classList.add("rightMessage")
            if (rightBtnList.length === 0) {
            }
            else {
              if (time < rightBtnList[0] - 250) {  
                message.classList.add("earlyRight");
                message.textContent= "early";
                console.log(rightBtnList[0]);
                if (gameWrapper.current) gameWrapper.current.appendChild(message);
                setTimeout(() => {
                  if (gameWrapper.current) gameWrapper.current.removeChild(message);  
                }, 500);
              }
              else if (rightBtnList[0] + 150 >= time && time > rightBtnList[0] - 150) {
                const hitsound  = new Audio('/bass-dry.wav');
                hitsound.volume = 0.5
                hitsound.play();
                setScore(score => score + 5);
                setHitCount(count => count + 1);
                setRightBtnList(rightList => rightList.slice(1));
                message.textContent= "perfect";
                message.style.backgroundColor = "green";
                if (gameWrapper.current) gameWrapper.current.appendChild(message);
                setTimeout(() => {
                  if (gameWrapper.current) gameWrapper.current.removeChild(message);  
                }, 500);
              }
              else if (rightBtnList[0] + 200 >= time && time > rightBtnList[0] - 200) {
                const hitsound  = new Audio('/bass-dry.wav');
                hitsound.volume = 0.5
                hitsound.play();
                setScore(score => score + 3);
                setHitCount(count => count + 1);
                setRightBtnList(rightList => rightList.slice(1));
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
            message.classList.add("leftMessage")
            if (leftBtnList.length === 0) {
            }
            else {
              if (time < leftBtnList[0] - 250) {  
                message.textContent= "early";
                message.classList.add("earlyLeft");
                console.log(leftBtnList[0]);
                if (gameWrapper.current) gameWrapper.current.appendChild(message);
                setTimeout(() => {
                  if (gameWrapper.current) gameWrapper.current.removeChild(message);  
                }, 500);
              }
  
              else if (leftBtnList[0] + 150 >= time && time > leftBtnList[0] - 150) {
                setScore(score => score + 5);
                setHitCount(count => count + 1);
                setLeftBtnList(leftList => leftList.slice(1));
                const hitsound  = new Audio('/bass-dry.wav');
                hitsound.volume = 0.5
                hitsound.play();
                message.classList.add("success");
                message.textContent= "perfect";
                message.style.backgroundColor = "green";
                if (gameWrapper.current) gameWrapper.current.appendChild(message);
                setTimeout(() => {
                  if (gameWrapper.current) gameWrapper.current.removeChild(message);  
                }, 500);
              }
  
  
              else if (leftBtnList[0] + 200 >= time && time > leftBtnList[0] - 200) {
                setScore(score => score + 3);
                setHitCount(count => count + 1);
                setLeftBtnList(leftList => leftList.slice(1));
                const hitsound  = new Audio('/bass-dry.wav');
                hitsound.volume = 0.5
                hitsound.play();
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

        // Used for helping to map songs
        if (event.key === 'h' || event.key === 'H') {
          setBeatBtn(true);
          if (beatBtnHold) return;
          setBeatBtnHold(true);
          console.log("leftSide: ", leftList[0]);
          console.log("rightSide: ", rightList[0]);
        }

        if (event.key === 'p' || event.key === "P") {
          if (resetBtnHold) return
          setResetBtnHold(true);
          if (leftList.length > 0 || rightList.length > 0) {
            customMap()
          }
          else {
            resetGame();
          }
        }
        if (event.key === 'q' || event.key === "Q") {
          if (toggleBtnHold) return;
          setToggleBtnHold(true);
          if (leftList.length > 0 || rightList.length > 0) {
            toggleMap();
          }
          else {
            toggleMusic(); // Play/pause
          }
        }
      }
      document.addEventListener('keydown', handleKeyDown);
  
      // Cleanup the event listener on unmount
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, [leftList, rightList, time, rotated, leftBtnHold, rightBtnHold, beatBtnHold, toggleBtnHold, resetBtnHold]);

    const moveLeft = () => {
      gsap.to("#gamecontainer-circle", {rotate: "160deg", duration: "0.5"}) // Duration can now be adjustable to user choice :). 0.5 seems to be the default
      setRotate(true);
    }

    const moveRight = () => {
      gsap.to("#gamecontainer-circle", {rotate: "200deg"})
      setRotate(false);
    }


    useEffect(() => {
      const handleKeyUp = (event: { key: string; }) => {
        if (event.key === 'a' || event.key === 'A') {
          setLeftBtnActive(false);
          setLeftBtnHold(false);
        }
        if (event.key === 'd' || event.key === 'D') {
          setRightBtnActive(false);
          setRightBtnHold(false);
        }
        if (event.key === 'k' || event.key === 'K') {
          setActionBtnActive(false);
          setActionBtnHold(false)
        }
        if (event.key === 'H' || event.key === 'h') {
          setBeatBtnHold(false);
          setBeatBtn(false);
        }
        if (event.key === 'q' || event.key === "Q") {
          setToggleBtnHold(false);
        }
        if (event.key === 'p' || event.key === "P") {
          setResetBtnHold(false);
        }
      }
      document.addEventListener('keyup', handleKeyUp);
  
      // Cleanup the event listener on unmount
      return () => {
        document.removeEventListener('keyup', handleKeyUp);
      };
    }, []);

    useEffect(() => {
      if (score > highScore) {
        setHighScore(score);  
      }
    }, [score, highScore]);

    const resetGame = () => {
      if (!musicSet || !stageSet) {
        return;
      }
      if (audioRefSetting.current) {
        audioRefSetting.current.pause();
        audioRefSetting.current.currentTime = 0;
      }        
      if (audioRefListening.current) {
        audioRefListening.current.pause();
        audioRefListening.current.currentTime = 0;
      }
      setStageBtn(false);
      setStageSet(false);

      setScore(0);
      setHitCount(0);
      setMissCount(0);
      setNoteCount(0);

      setLeftList([]);
      setRightList([]);

      setStopwatchActive(false);
      setStPaused(true);
      setTime(0);
      
      document.querySelectorAll(".curveHold").forEach(e => e.remove());
      document.querySelectorAll(".curve").forEach(e => e.remove());
      if (barRef.current) {
        barRef.current.classList.remove('heightChange');
        barRef.current.style.height = '0px';
      }
      if (barContainerRef.current) {
        barContainerRef.current.classList.remove('pulsing');
        barContainerRef.current.style.border = '10px solid rgb(250, 238, 223)';
      }
      setMusicStage();
    }

    const aStyle = {
      opacity: rotated? "0.3" : "1",
      transition: 'opacity 0.2s linear'
    }

    const dStyle = {
      opacity: rotated? "1" : "0.3",
      transition: 'opacity 0.2s linear'
    }

    const leftBtnStyle = {
      backgroundColor: leftBtnActive? "grey" : "black",
      color: leftBtnActive? "black" : "white",
      padding: 5,
    }

    const rightBtnStyle = {
      backgroundColor: rightBtnActive? "grey" : "black",
      color: rightBtnActive? "black" : "white",
      padding: 5,
    }
    const actionBtnStyle = {
      backgroundColor: actionBtnActive? "grey" : "black",
      color: actionBtnActive? "black" : "white",
      padding: 5,
      width: "fit-content"
    }
    // const btnStyleK = {
    //   backgroundColor: kBtn? "grey" : "black",
    //   color: kBtn? "black" : "white",
    //   padding: 5,
    // }
    // const holdBtnStyle = {
    //   backgroundColor: beatBtn? "grey" : "black",
    //   color: beatBtn? "black" : "white",
    //   padding: 5,
    // }
    const currentArea = {
      backgroundColor: rotated? "rgba(182, 34, 34)" : "rgba(25, 86, 128)",
      width: "fit-content",
      color: "white",
      padding: 5,
    }

    const toggleMusic = () => {
      if (!stageSet) return;
      const curves = document.querySelectorAll('.curve');
      const heightAnimation = document.querySelector('.heightChange');
      const borderAnimation = document.querySelector('.pulsing');
      if (audioRefListening.current && audioRefSetting.current) {
        if (audioRefListening.current.paused && audioRefSetting.current.paused) {
          audioRefListening.current.play();
          audioRefSetting.current.play();
          setStopwatchActive(true);
          setStPaused(false);
          for (let i = 0; i < curves.length; i++) {
            (curves[i] as HTMLParagraphElement).style.animationPlayState = "running";
          }
          (heightAnimation as HTMLDivElement).style.animationPlayState = "running";
          (borderAnimation as HTMLDivElement).style.animationPlayState = "running";
        }
        else {
          audioRefListening.current.pause();
          audioRefSetting.current.pause();
          setStopwatchActive(false);
          setStPaused(true);
          for (let i = 0; i < curves.length; i++) {
            (curves[i] as HTMLParagraphElement).style.animationPlayState = "paused";
          }
          (heightAnimation as HTMLDivElement).style.animationPlayState = "paused";
          (borderAnimation as HTMLDivElement).style.animationPlayState = "paused";
        }
      }
    }

    const toggleMap = () => {
      const curves = document.querySelectorAll('.curve');
      if (audioRefListening.current) {
        if (audioRefListening.current.paused) {
          audioRefListening.current.play();
          setStopwatchActive(true);
          setStPaused(false);
          for (let i = 0; i < curves.length; i++) {
            (curves[i] as HTMLParagraphElement).style.animationPlayState = "running";
          }
        }
        else {
          audioRefListening.current.pause();
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

    const customMap = () => {
        setAudioURL('https://9boushb4a7.ufs.sh/f/9Jv1QVILGRy4BnZDzY7GTJ0cX8hyuefiOLVSvntDKg5EZ1dl');

        if (audioRefSetting.current) {
          audioRefSetting.current.pause();
          audioRefSetting.current.currentTime = 0;
        }        
        if (audioRefListening.current) {
          audioRefListening.current.pause();
          audioRefListening.current.currentTime = 0;
        }

        setStageBtn(false);
        setStageSet(false);

        setTime(0);
        setStopwatchActive(false);
        setStPaused(true);
        setScore(score => 0);
        // setHighScore(0);
        setHitCount(count => 0);
        setMissCount(count => 0);
        setNoteCount(count => 0);

        setLeftList([]);
        setLeftBtnList([]);
        setRightList([]);
        setRightBtnList([]);
        // setAList([1000, 1250, 1500, 1750]);
        // setAListBtn([3000, 3250, 3500, 3750]);
        const rList = [1430, 1740, 2070, 2420, 3690, 4040, 4370, 4690, 5030, 6240, 6580, 6880, 7190, 7500, 7820, 8130, 8450, 8750, 9060, 9390, 9710, 10050, 10370, 10670, 10940, 11260, 14120, 16660, 21290, 21940, 23230, 23860,  25060, 25290, 26090, 26440, 26760, 27590, 27880, 28190, 28510, 28830, 29150, 29520, 29860, 30200, 30550, 30850, 
          35440, 35880, 36210, 36530, 36880, 37170, 37510, 37830, 38150, 38450, 38780, 39080, 39380, 39700, 39840, 40300, 40620, 40960, 41260, 42220, 42360, 42700, 43090, 43470, 43600, 43930,  49150, 49500, 49810, 50120, 50450, 50770, 51110, 51390, 51720, 52010, 52150, 52300, 52430, 52750, 53060, 53410, 53550, 53690, 54820, 54940, 57160, 
          57320, 57440, 57780, 58120, 58440, 58570, 58710, 58860, 59010, 59160, 59310, 59450, 59620, 59780, 59910, 60240, 60380, 60530, 60640, 61000, 61120, 61440, 61740, 62070, 63470, 63620, 63750, 64100, 64430, 64590, 64750, 64920, 65040, 65340, 65660, 66010, 66120, 66440, 66770, 67110, 68870, 69200, 69510, 69840, 69980, 70230, 70530, 70820, 71280, 71600, 71880, 72190, 80030, 82570, 83220, 84500, 85140, 

          //Post "sympathy line" - samurai cut
          89690, 89990, 90510, 90660, 91090, 91230, 91480, 91910, 93150, 93450, 95000, 95370, 95540, 95890, 96230, 98110, 98260, 98600, 98950, 100490, 100830, 101020, 101370, 101680, 102070, 102230, 102430, 102630, 102830, 102990, 103140, 103320, 103570, 103730, 104060, 104410, 104800, 105000, 105310, 105650, 106010, 106180, 106400, 
          106610, 106860, 107210, 107580, 107730, 108070, 108400, 108740, 109020, 109210, 110270, 110400, 110770, 111140, 111450, 111760, 111900, 112460, 112620, 113050, 113180, 113350, 113520, 113670, 113860, 114020, 114240, 114520, 114660, 129080, 129490, 129620, 129950, 130270, 130660, 131010, 131310, 131630, 131970, 132250, 132570, 
          132880, 133200, 133520, 133830, 134120, 134440, 134790, 135100, 135410, 135740, 136040, 136360, 136680, 137010, 137300, 143270, 143630, 143790, 143980, 144160, 144430, 144860, 145150, 145470, 146110, 146750, 146900, 147310, 147650, 147980, 148300, 148460, 148650, 
          148790, 149140, 149280, 149430, 149800, 149930, 151620, 151780, 151930, 152360, 152730, 153040, 154260, 154510, 154920, 155080, 155330, 160340, 161620, 162840, 164030,

          //1:45 - 4:18,before basebal part
          166810, 167090, 167370, 167710, 168060, 168370, 168710, 168940, 169230, 169550, 173250, 173390, 173710, 174230, 174390, 174540, 174920, 175250, 175580, 175740, 175850, 178270, 178680, 178820, 178990, 179180, 179350, 179500, 179620, 179960, 180280, 180620, 180770, 181180, 181680, 182000, 182140, 185030, 185350, 185650, 185800, 
          185930, 186340, 186500, 186660, 187010, 187150, 187540, 187900, 189610, 189760, 190200, 190480, 190810, 192140, 192450, 192740, 193080, 193370, 193690, 194010, 194420, 196330, 196580, 196720, 196840, 197110, 197230, 197420, 198360, 198520, 198700, 199760, 200040, 200180, 200440, 200560, 200890, 201040, 201230, 201440, 201730, 
          201950, 202220, 202430, 202680, 202880, 203180, 203640, 203890, 204000, 204250, 204370, 204660, 204810, 205040, 205280, 205590, 207850, 208110, 208240, 208560, 208870, 209040, 209870, 210080, 210330,  211680, 211940, 212070, 212400, 212520, 212740, 213060, 213720, 213900, 214020, 215100, 215370, 216550, 217540, 217850, 217990, 
          218530, 218930, 219200, 220390, 221320, 222760, 223010, 223130, 223410, 223520, 223830, 223960, 225190, 225300, 225480, 226130, 226600, 226890, 227000, 227260, 227360, 227690, 227840, 228090, 228230, 228390, 228540, 228680, 228950, 229100, 229240, 229380, 233310, 233810, 234260, 234550, 234670, 
          234950, 235060, 235370, 235480, 235730, 235860, 236030, 238520, 238660, 238940, 239240, 239370, 239590, 239730, 239870, 240030, 240300, 240460, 240650, 241000, 241490, 241860, 245320, 245610, 245940, 246240, 246380, 246520, 246820, 246970, 247230, 247380, 247540, 247680, 247830, 248000, 248220, 248360, 248640, 248910, 249150, 249610, 249870, 249980, 250300, 250430, 250740, 250890, 251050, 251200, 251370, 251540, 251930, 252250, 252500, 252690, 252950, 253180, 253370, 253570,

          //Last part
          259840, 260290, 260770, 261230, 262260, 263220, 264180, 265160, 266110, 267060, 268010, 268980, 269360, 270210, 270840, 271130, 271270, 271780, 272330, 272830, 273320, 274300, 275170, 275340, 275500, 275780, 276080, 278310, 278510, 278740, 279030, 279920, 280070, 280270, 280620, 280800, 281030, 281360, 281780, 282810, 282960, 
          283110, 283400, 283800, 284860, 285220, 285930, 286110, 286650, 287220, 287430, 288320, 289140, 289570, 290080, 290370, 290870, 291490, 291940, 292380, 292700, 293180, 293880, 294280, 294730, 297960, 298410, 298710, 299030, 299150, 299520, 299910, 300310, 300500, 301080, 301410, 301550, 301970, 302300, 302760, 305200, 305610, 
          305900, 306240, 306620, 306760, 313470, 313840, 313960, 314300, 314740, 315070, 315220, 315480, 315880, 316230, 316370, 316690, 317110, 317580, 317880, 318140, 318270, 318680, 319060, 322050, 322630, 322990, 323370, 323550, 323850, 324210, 326740, 327160, 327490, 329840, 331000, 331420, 346480, 346750, 347040, 347310, 347630, 
          347920, 348220, 348500, 348810, 349100, 349380, 349670, 349980, 350240, 350570, 350860, 355220, 355520, 355820, 356100, 356390, 356690, 356990, 357280, 357570, 357870, 358170, 358440, 358760, 359060, 359340, 359660, 359940, 360250, 360550, 360850, 361150, 361440, 361720, 362010, 362280, 362590, 362880, 363170          
        ];
        const rBtnList = rList.map(num => num + 2000);

        setRightList(rList);
        setRightBtnList(rBtnList);

        const lList = [2740, 2900, 3060, 3210, 5310, 5460, 5610, 5760, 11640, 19200, 22600, 24500, 25680, 27050, 27380, 31170, 31510, 31850, 32180, 32480, 32790, 33100, 33410, 33740, 34030, 34340, 34670, 34980, 35260, 41610, 41910, 44390, 44900, 45010, 45390, 45500, 45960, 46070, 46510, 46620, 46920, 47560, 47910, 48240, 48560, 48860, 54020, 
          54370, 54510, 54660, 55240, 55550, 55930, 56040, 56370, 56680, 57020, 62220, 62380, 62530, 62820, 63150, 67300, 67460, 67640, 67770, 67940, 68260, 68560, 73710, 74340, 74960, 75620, 76260, 77810, 78060, 78310, 78470, 78770, 79380, 82260, 82880, 83540, 83850, 84200, 84840, 85450, 85770, 86060, 89830, 90340, 

          92280, 92610, 92790, 93840, 94010, 94280, 94680, 96630, 96790, 97290, 97710, 99380, 99530, 99830, 100160, 109540, 109900, 115020, 115330, 115780, 115900, 116220, 116580, 116940, 117170, 117350, 117470, 117800, 118120, 118510, 118650, 118960, 119290, 119620, 119810, 119980, 120120, 120500, 120800, 121260, 121610, 122010, 122420, 122590, 
          122730, 122890, 123250, 123390, 123560, 123960, 124110, 124290, 124440, 124600, 124790, 124970, 125140, 125310, 125490, 125630, 125980, 126330, 126760, 126910, 127070, 127230, 127400, 127560, 127720, 127890, 128050, 128220, 128370, 128740, 137610, 137930, 138260, 138550, 138900, 139210, 139520, 139820, 140120, 140430, 140750, 141370, 141510, 141650, 141840, 142270, 142600, 142920, 145790, 146420, 
          146580, 150220, 150520, 150840, 151170, 151470, 153360, 153690, 153850, 154070, 155550, 155780, 156440, 157110, 157770, 158370, 169890, 170050, 170330, 170650, 170830, 171130, 171430, 171610, 171790, 171960, 172350, 172730, 173080, 
        
          176200, 176350, 176490, 176640, 176840, 177030, 177400, 177780, 178090, 182520, 182840, 183180, 183360, 183490, 183870, 184070, 184190, 184540, 184680, 188240, 188430, 188800, 189100, 189230, 191090, 191460, 191820, 195890, 196180, 205980, 206240, 206500, 207480, 207720, 210580, 210870, 211290, 211550, 215490, 215760, 215880, 216190, 
          216300, 219320, 219600, 219720, 220010, 220140, 221560, 221700, 222280, 224230, 224490, 229970, 230470, 230730, 230840, 231100, 231230, 231530, 231650, 231920, 232050, 232210, 232380, 232500, 232830, 236190, 236510, 236670, 236810, 236940, 237090, 237600, 238080, 238220, 242150, 242260, 242570, 242670, 243030, 243150, 243410, 243560, 243700, 243860, 243990, 244320, 244640, 244990, 253910, 254160, 254370, 254640, 254890, 255040,

          261790, 262740, 263690, 264680, 265620, 266570, 267540, 268500, 269230, 269770, 277030, 277290, 277420, 277680, 277990, 284710, 285020, 285560, 287960, 288810, 295090, 295560, 296250, 296600, 297010, 297130, 297500, 297800, 303440, 303870, 304260, 304380, 304730, 307080, 307540, 307990, 308270, 308590, 308720, 309140, 309500, 309860, 
          310060, 310360, 310670, 310950, 311080, 311490, 311880, 312340, 313010, 319360, 319650, 320200, 320440, 320660, 321110, 321460, 321790, 324480, 325080, 326230, 331810, 332210, 332830, 333390, 333990, 334580, 335490, 335840, 336260, 336680, 337020, 337890, 338210, 338650, 339100, 339420, 340290, 340600, 341060, 341470, 341790, 342080, 
          342360, 342670, 342990, 343270, 343570, 343840, 344160, 344390, 344660, 344930, 345260, 345570, 345880, 346180, 351170, 351470, 351760, 352050, 352350, 352620, 352890, 353200, 353510, 353790, 354060, 354330, 354640, 354930
        ]
        const lBtnList = lList.map(num => num + 2000);
        setLeftList(lList);
        setLeftBtnList(lBtnList);

        setTimeout(() => {
          setStopwatchActive(true);
          setStPaused(false);
        }, 2000)

        setTimeout(() => {
          if (audioRefListening.current) {
            audioRefListening.current.play();
          }  
        }, 4000)
        
        document.querySelectorAll(".curveHold").forEach(e => e.remove());
        document.querySelectorAll(".curve").forEach(e => e.remove());
    }

    // Creates the curves
    useEffect(() => {
      if (time === rightList[0]) {
        setNoteCount(count => count + 1);
        const newEle = document.createElement('p');
        newEle.classList.add("aCurve")
        newEle.classList.add("curve")
        newEle.textContent= ""
        aCircle.current?.appendChild(newEle);
        newEle.addEventListener("animationend", () => {
          aCircle.current?.removeChild(newEle);
        })
        // setTimeout(() => {
        //   console.log(aList[0])
        // }, 2000)
        setRightList(rList => rList.slice(1));
        // console.log(aList);
      }
    }, [time, rightList])

    useEffect(() => {
      if (time === leftList[0]) {
        setNoteCount(count => count + 1);
        const newEle = document.createElement('p');
        newEle.classList.add("dCurve")
        newEle.classList.add("curve")
        newEle.textContent= ""
        dCircle.current?.appendChild(newEle);
        newEle.addEventListener("animationend", () => {
          dCircle.current?.removeChild(newEle);
        })
        // setTimeout(() => {
        //   console.log(leftList)
        // }, 2000)
        setLeftList(lList => lList.slice(1));
      }
    }, [time, leftList])

    // Checks for misses
    useEffect(() => {
      if (rightBtnList.length > 0 && rightBtnList[0] < time) {
        if (score > 0) {
          setScore(score => score - 1);
        }
        setMissCount(count => count + 1);
        setRightBtnList(rList => rList.slice(1));
        const message = document.createElement('p');
        message.classList.add("message");
        message.classList.add("rightMessage");
        message.classList.add("missedRight");
        message.textContent= "missed";
        if (gameWrapper.current) gameWrapper.current.appendChild(message);
        setTimeout(() => {
          if (gameWrapper.current) gameWrapper.current.removeChild(message);  
        }, 500);
      }
    }, [rightBtnList, time])

    useEffect(() => {
      if (leftBtnList.length > 0 && leftBtnList[0] < time) {
        if (score > 0) {
          setScore(score => score - 1);
        }
        setMissCount(count => count + 1);
        setLeftBtnList(lList => lList.slice(1));

        const message = document.createElement('p');
        message.classList.add("message");
        message.classList.add("leftMessage");
        message.classList.add("missedLeft");
        message.textContent= "missed";
        // console.log(aListBtn[0] - 2000)
        if (gameWrapper.current) gameWrapper.current.appendChild(message);
        setTimeout(() => {
          if (gameWrapper.current) gameWrapper.current.removeChild(message);  
        }, 500);
      }
    }, [leftBtnList, time])

    return (
        <>
            <h1>Meyda Demo</h1>
            <div>
              <p>Press &quot;A&quot; to rotate Left and set the &quot;Active Area&quot; to Red</p>
              <br/>
              <p>Press &quot;D&quot; to rotate Left and set the &quot;Active Area&quot; to Blue</p>
              <br/>
              <p>Press &quot;K&quot; to hit a note reaching the edge of the current &quot;Active Area&quot;</p>
              <br/>
              {/* <p>Press &quot;J&quot; when the right bar reaches the top <br/> Follow the beat</p>
              <br/> */}
              <p>Press &quot;Q&quot; to Play/Pause</p>
              <br/>
              <p>Press &quot;P&quot; to reset the track</p>
              <br/>
              {/* <button>Press Here to change keybinds</button>
              <br/> */}
              <p>Enter your music file below and Presss &quot;Set Stage&quot; <br/> Or Play a Custom made map</p>
            </div>

            <p>{time}</p>

            <audio src={audioURL ?? ""} controls={false} ref={audioRefListening} loop={false} />
            <audio src={audioURL ?? ""} controls={false} ref={audioRefSetting} loop={false} />
            <audio src={audioURL ?? ""} controls={false} loop={false} />

            <div style={{display: 'flex', gap: 20, flexDirection: 'column'}}>
              <input type="file" accept='audio/*' onChange={audioChange}/>
              {musicSet && <button onClick={setMusicStage} disabled={stageBtn}>Set Stage</button>}
            </div>

            <button onClick={customMap} disabled={stageBtn}>Play Custom Map</button>

            <div style={currentArea}> Active </div>

            <div ref={gameWrapper} style={{position: "relative"}}>
              <div style={{display: 'flex', gap: 20, alignItems: 'flex-end', flexDirection: 'row'}}>
                <div id='gamecontainer-circle' ref={gameContainer}>
                  <div className='caWhole' ref={sCircle}></div>
                  <div className='click-Area caA' style={aStyle} ref={aCircle}></div>
                  <div className='click-Area caD' style={dStyle} ref={dCircle}></div>
                </div>
                {/* <div className='bar-container' ref={barContainerRef}>
                  <div className='bar' ref={barRef}></div>
                </div> */}

              </div>
              
              <div id='button-container'>
                <div style={leftBtnStyle}>A</div>
                <div style={rightBtnStyle}>D</div>
                {/* <div style={btnStyleJ}>J</div> */}
                {/* <div style={holdBtnStyle}>H</div> */}
              </div>
              <div style={{display: 'flex',  justifyContent: 'center'}}> 
                <div style={actionBtnStyle}>K</div>
              </div>

              
            </div>
            <div>
              <p>High Score: {highScore}</p>
              <p>Score: {score}</p>
              <p>Hit Count: {hitCount}</p>
              <p>Miss Count: {missCount}</p>
              <p>Note Count: {noteCount}</p>
            </div>

            {rightList.length > 0 && <button onClick={toggleMap}>Play/Pause</button>}
            
            {stageSet && <button onClick={toggleMusic}>Play/Pause</button>}
        </>
    )
}