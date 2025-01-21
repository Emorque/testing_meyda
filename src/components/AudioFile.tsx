"use client";

import Meyda, { MeydaFeaturesObject } from 'meyda';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import "./audiofile.css";
import gsap from 'gsap';

export function AudioFile() {    
    const [audioURL, setAudioURL] = useState<string | null>(null)
    const audioRefListening = useRef<HTMLAudioElement>(null);
    const audioRefSetting = useRef<HTMLAudioElement>(null);

    // const aPillar = useRef<HTMLDivElement>(null);
    // const dPillar = useRef<HTMLDivElement>(null);
    const jPillar = useRef<HTMLDivElement>(null);
    const lPillar = useRef<HTMLDivElement>(null);

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
    const [jList, setJList] = useState<number[]>([]);
    const [lList, setLList] = useState<number[]>([]);

    const [amplitudeSpectrum, setAmplitudeSpectrum] = useState<Float32Array<ArrayBufferLike>>(new Float32Array(0));

    const [aActive, setAActive] = useState<boolean>(false);
    const [dActive, setDActive] = useState<boolean>(false);
    // const [jActive, setJActive] = useState<boolean>(false);
    // const [lActive, setLActive] = useState<boolean>(false);

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
      console.log("AList", aList);
      if (aList.length > 0 && aList[0] + 0.15 < time/1000) {
        setScore(score => score - 1);
        setMissCount(count => count + 1);
        setAList(aList => aList.slice(1));

        const message = document.createElement('p');
        message.classList.add("message")
        message.classList.add("missed");
        message.classList.add("miss");
        message.textContent= "missed";
        if (gameWrapper.current) gameWrapper.current.appendChild(message);
        setTimeout(() => {
          if (gameWrapper.current) gameWrapper.current.removeChild(message);  
        }, 500);
      }
    }, [aList, time])
    
    useEffect(() => {
      console.log("DList", dList);
      if (dList.length > 0 && dList[0] + 0.20 < time/1000) {
        setScore(score => score - 1);
        setMissCount(count => count + 1);
        setDList(dList => dList.slice(1));

        const message = document.createElement('p');
        message.classList.add("message")
        message.classList.add("missed");
        message.classList.add("miss");
        message.textContent= "missed";
        if (gameWrapper.current) gameWrapper.current.appendChild(message);
        setTimeout(() => {
          if (gameWrapper.current) gameWrapper.current.removeChild(message);  
        }, 500);
      }
    }, [dList, time])

    useEffect(() => {
      console.log("JList", jList);
      if (jList.length > 0 && jList[0] + 0.15 < time/1000) {
        setScore(score => score - 1);
        setMissCount(count => count + 1);
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
        setMissCount(count => count + 1);
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
        if (event.key === 'a' || event.key === 'A' ) {
          console.log('A key pressed!');
          const message = document.createElement('p');
          message.classList.add("message")
          message.classList.add("messageA");

          if (rotated) {
            if (dList.length === 0) {
              console.log("ex1", dList, time)
              console.log("missed")
  
              // message.classList.add("miss");
              // message.textContent= "missed";
              // if (gameWrapper.current) gameWrapper.current.appendChild(message);
              // setTimeout(() => {
              //   if (gameWrapper.current) gameWrapper.current.removeChild(message);  
              // }, 500);
            }
            else {
              if ((time/1000) < dList[0] - 0.25) {
                // setScore(score => score - 1);
                // setMissCount(count => count - 1);
                console.log("ex2", dList, (time/1000))
                console.log("early")
  
                message.classList.add("miss");
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
                message.classList.add("success");
                message.textContent= "perfect";
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
                message.classList.add("success");
                message.textContent= "success";
                if (gameWrapper.current) gameWrapper.current.appendChild(message);
                setTimeout(() => {
                  if (gameWrapper.current) gameWrapper.current.removeChild(message);  
                }, 500);
              }
            }
          }

          else {
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
  
                message.classList.add("miss");
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
                if (gameWrapper.current) gameWrapper.current.appendChild(message);
                setTimeout(() => {
                  if (gameWrapper.current) gameWrapper.current.removeChild(message);  
                }, 500);
              }
            }
          }

          // if (aList.length === 0) {
          //   console.log("ex1", aList, time)
          //   setScore(score => score - 1);
          //   console.log("missed")

          //   message.classList.add("miss");
          //   message.textContent= "missed";
          //   if (aPillar.current) aPillar.current.appendChild(message);
          //   setTimeout(() => {
          //     if (aPillar.current) aPillar.current.removeChild(message);  
          //   }, 500);
          // }
          // else {
          //   if ((time/1000) < aList[0] - 0.25) {
          //     setScore(score => score - 1);
          //     console.log("ex2", aList, (time/1000))
          //     console.log("early")

          //     message.classList.add("miss");
          //     message.textContent= "early";
          //     if (aPillar.current) aPillar.current.appendChild(message);
          //     setTimeout(() => {
          //       if (aPillar.current) aPillar.current.removeChild(message);  
          //     }, 500);
          //   }

          //   else if (aList[0] + 0.15 >= (time/1000) && (time/1000) > aList[0] - 0.15) {
          //     setScore(score => score + 1);
          //     setAList(aList => aList.slice(1));
          //     console.log("ex3", aList, (time/1000))
          //     console.log("perfect")
              
          //     message.classList.add("success");
          //     message.textContent= "perfect";
          //     if (aPillar.current) aPillar.current.appendChild(message);
          //     setTimeout(() => {
          //       if (aPillar.current) aPillar.current.removeChild(message);  
          //     }, 500);
          //   }


          //   else if (aList[0] + 0.25 >= (time/1000) && (time/1000) > aList[0] - 0.25) {
          //     setScore(score => score + 1);
          //     setAList(aList => aList.slice(1));
          //     console.log("ex3", aList, (time/1000))
          //     console.log("hit")
              
          //     message.classList.add("success");
          //     message.textContent= "success";
          //     if (aPillar.current) aPillar.current.appendChild(message);
          //     setTimeout(() => {
          //       if (aPillar.current) aPillar.current.removeChild(message);  
          //     }, 500);
          //   }
          // }
        }

        if (event.key === 'd' || event.key === 'D' ) {
          console.log('D key pressed!');
          const message = document.createElement('p');
          message.classList.add("message")
          message.classList.add("messageD");
          if (dList.length === 0 || aList.length === 0) {
            setScore(score => score - 10);
            console.log("missed")

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
              message.classList.add("success");
              message.textContent= "perfect";
              if (gameWrapper.current) gameWrapper.current.appendChild(message);
              setTimeout(() => {
                if (gameWrapper.current) gameWrapper.current.removeChild(message);  
              }, 500);
            }
            // else if ((dList[0] + 0.25 >= (time/1000) && (time/1000) > dList[0] - 0.25) && (aList[0] + 0.25 >= (time/1000) && (time/1000) > aList[0] - 0.25) ) {
            //   setScore(score => score + 2);
            //   setDList(dList => dList.slice(1));
            //   setAList(aList => aList.slice(1));
            //   message.classList.add("success");
            //   message.textContent= "success";
            //   if (gameWrapper.current) gameWrapper.current.appendChild(message);
            //   setTimeout(() => {
            //     if (gameWrapper.current) gameWrapper.current.removeChild(message);  
            //   }, 500);
            // }
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
            setMissCount(count => count - 1);
            setHitCount(count => count + 1);
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
              message.classList.add("early")
              if (jPillar.current) jPillar.current.appendChild(message);
              setTimeout(() => {
                if (jPillar.current) jPillar.current.removeChild(message);  
              }, 500);
            }
            else if (jList[0] + 0.07 >= (time/1000) && (time/1000) > jList[0] - 0.07) {
              setScore(score => score + 1);
              setJList(jList => jList.slice(1));
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
              message.classList.add("success");
              message.textContent= "success";
              if (lPillar.current) lPillar.current.appendChild(message);
              setTimeout(() => {
                if (lPillar.current) lPillar.current.removeChild(message);  
              }, 500);
            }
          }
        }

        if (event.key === 'k' || event.key === "K") {
          handleFlip()
        } 
      };
  
      document.addEventListener('keydown', handleKeyDown);
  
      // Cleanup the event listener on unmount
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, [aList, dList, jList, lList, time, rotated]);

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

    const toggleMusic = () => {
      const liiii = document.querySelectorAll('.curve');
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
            {/* <p>{level}</p>
            <p>{score}</p> */}

            {/* <p>{time/1000}</p> */}

            <audio src={audioURL ?? ""} controls={false} ref={audioRefListening} loop={false} />
            <audio src={audioURL ?? ""} controls={false} ref={audioRefSetting} loop={false} />
            {musicSet && <button onClick={setMusicStage}>Set Stage</button>}

            {/* <div id='gamecontainer'>
              <div className='pilar' ref={aPillar}>hi</div>
              <div className='pilar' ref={dPillar}>hi</div>
              <div className='pilar' ref={jPillar}>hi</div>
              <div className='pilar' ref={lPillar}>hi</div>
            </div> */}
            {/* <p>{score}</p> */}

            <div ref={gameWrapper} style={{position: "relative"}}>
              <div id='gamecontainer-circle' ref={gameContainer}>
                <div className='click-Area caA' style={aStyle} ref={aCircle}></div>
                <div className='click-Area caD' style={dStyle} ref={dCircle}></div>
                {/* <div className='click-Area caJ' ref={jCircle}></div>
                <div className='click-Area caL' ref={lCircle}></div> */}

              </div>
            </div>
            <div>
              <p>Score: {score}</p>
              <p>Hit Count: {hitCount}</p>
              <p>Miss Count: {missCount}</p>
              <p>Note Count: {noteCount}</p>
            </div>
            
            {stageSet && <button onClick={toggleMusic}>Play/Pause</button>}
            

            {/* <div id='canvasContainer' style={{height: 500, width: 500, position: "relative"}}>
              <Canvas>
                <ambientLight />
                <TopRight/>
                {bottomLeftInstances.map((index : number) => (
                  <BottomLeft key={`bottomLeft-${index}`}/>
                ))}
                <BottomRight/>
                <TopLeft/>
              </Canvas>
            </div> */}
        </>
    )
}