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
    const scoreline = useRef<HTMLDivElement>(null);
    const gameWrapper = useRef<HTMLDivElement>(null);
    
    const circleOne = useRef<HTMLDivElement>(null);
    const circleTwo = useRef<HTMLDivElement>(null);
    const circleThree = useRef<HTMLDivElement>(null);
    const circleFour = useRef<HTMLDivElement>(null);

    const firstSection = useRef<HTMLDivElement>(null);
    const secondSection = useRef<HTMLDivElement>(null);

    const [beatBtnHold, setBeatBtnHold] = useState<boolean>(false);

    const [direction, setDirection] = useState<string>("Right");

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [scrollSpeed, setScrollSpeed] = useState<number>(1000);

    const [usingCustomMap, setCustomMap] = useState<boolean>(false);

    // stopwatch
    const [stopwatchActive, setStopwatchActive] = useState<boolean>(false);
    const [stPaused, setStPaused] = useState<boolean>(true);
    const [time, setTime] = useState<number>(0);

    const [amplitudeSpectrum, setAmplitudeSpectrum] = useState<Float32Array<ArrayBufferLike>>(new Float32Array(0));

    const [score, setScore] = useState<number>(0);
    const [highScore, setHighScore] = useState<number>(0);
    const [hitCount, setHitCount] = useState<number>(0);
    const [missCount, setMissCount] = useState<number>(0);
    const [noteCount, setNoteCount] = useState<number>(0);

    const [stageSet, setStageSet] = useState<boolean>(false);
    const [musicSet, setMusicSet] = useState<boolean>(false);

    // AutoGen Map
    const [b1Active, setB1Active] = useState<boolean>(false);
    const [b2Active, setB2Active] = useState<boolean>(false);
    const [b3Active, setB3Active] = useState<boolean>(false);
    const [b4Active, setB4Active] = useState<boolean>(false);

    // Custom Map
    const [leftBtnActive, setLeftBtnActive] = useState<boolean>(false);
    const [leftBtnHold, setLeftBtnHold] = useState<boolean>(false);

    const [rightBtnActive, setRightBtnActive] = useState<boolean>(false);
    const [rightBtnHold, setRightBtnHold] = useState<boolean>(false);

    const [leftActionBtnActive, setLeftActionBtn] = useState<boolean>(false);
    const [leftActionBtnHold, setLeftActionBtnHold] = useState<boolean>(false);
    const [rightActionBtnActive, setRightActionBtn] = useState<boolean>(false);
    const [rightActionBtnHold, setRightActionBtnHold] = useState<boolean>(false);

    const [firstList, setFirstList] = useState<number[]>([]);
    const [firstBtnList, setFirstBtnList] = useState<number[]>([]);

    const [secondList, setSecondList] = useState<number[]>([]);
    const [secondBtnList, setSecondBtnList] = useState<number[]>([]);

    const [thirdList, setThirdList] = useState<number[]>([]);
    const [thirdBtnList, setThirdBtnList] = useState<number[]>([]);

    const [fourthList, setFourthList] = useState<number[]>([]);
    const [fourthBtnList, setFourthBtnList] = useState<number[]>([]);

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

        setFirstList([])
        setSecondList([])
        setThirdList([])
        setFourthList([])
  
        setFirstBtnList([])
        setSecondBtnList([])
        setThirdBtnList([])
        setFourthList([])

        setStopwatchActive(false);
        setStPaused(true);
        setTime(0);
        
        document.querySelectorAll(".curve").forEach(e => e.remove());
       
        updateContext();
    }

    function updateContext() {
        const audioContext = new AudioContext;

        if (audioRefSetting.current) {
            // audioRefSetting.current.crossOrigin = 'anonymous' /* Needed for uploadthing audio src to be analyzed. Without this, the audio can only be heard*/
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
        case 'band1':
          return [0, 1, 2, 3, 4, 5];
        case 'band2':
          return [6, 7, 8, 9, 10, 11];
        case 'band3':
          return [12, 13, 14, 15, 16, 17];
        case 'band4':
          return [18, 19, 20, 21, 22, 23];
        default:
          return [];
      }
    };
    
    
    useEffect(() => {
      // Button states with a timeout for each key
      const buttonStates = [
        { key: 'band1', state: b1Active, setState: setB1Active, setBtnList: setFirstBtnList, circle: firstSection, curve: "curveOne", circleAnime: "blueCurveAnime"},
        { key: 'band2', state: b2Active, setState: setB2Active, setBtnList: setSecondBtnList, circle: firstSection, curve: "curveTwo", circleAnime: "redCurveAnime"},
        { key: 'band3', state: b3Active, setState: setB3Active, setBtnList: setThirdBtnList, circle: secondSection, curve: "curveThree", circleAnime: "blueCurveAnime"},
        { key: 'band4', state: b4Active, setState: setB4Active, setBtnList: setFourthBtnList, circle: secondSection, curve: "curveFour", circleAnime: "redCurveAnime"},
      ];
      buttonStates.forEach(({ key, state, setState, setBtnList, circle, curve, circleAnime }) => { 
        if (state) return;
        const spectrumRange = getAmplitudeRangeForKey(key);
        const avgAmplitude = spectrumRange.reduce((sum, idx) => sum + amplitudeSpectrum[idx], 0) / spectrumRange.length;
        if (avgAmplitude > 1.5) {
          setState(true)
          setBtnList(list => [...list, time + scrollSpeed])
          setNoteCount(count => count + 1);

          if (circle.current) {
            const newEle = document.createElement('p');
            newEle.classList.add(curve)
            newEle.classList.add("curve")
            newEle.textContent= ""
            circle.current.appendChild(newEle)
            // newEle.animate(curveAnimation, animationTiming)
            newEle.style.animation = `${circleAnime} ${scrollSpeed/1000}s linear`
            newEle.addEventListener("animationend", () => {
              circle.current?.removeChild(newEle);
            })
          }
          setTimeout(() => {
            setState(false)
          }, 500) 

        }
      });
    }, [amplitudeSpectrum, time]);

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
        if (event.key === 'j' || event.key === 'J') {
          setLeftActionBtn(true);
          if (leftActionBtnHold) return;
          setLeftActionBtnHold(true);

          const message = document.createElement('p');
          message.classList.add("message");

          if (direction === 'Left') {
            message.classList.add("leftMessage")
            if (firstBtnList.length === 0) {
            }
            else {
              if (time < firstBtnList[0] - 150) {  
                message.classList.add("earlyLeft");
                message.textContent= "early";
                if (gameWrapper.current) gameWrapper.current.appendChild(message);
                setTimeout(() => {
                  if (gameWrapper.current) gameWrapper.current.removeChild(message);  
                }, 500);
              }

              else if (firstBtnList[0] + 75 >= time && time > firstBtnList[0] - 75) {
                const hitsound  = new Audio('/public/hitsound.mp3'); // Needed for github pages
                // const hitsound  = new Audio('/hitsound.mp3'); // Needed for local 
                hitsound.volume = 0.5
                hitsound.play();
                setScore(score => score + 5);
                setHitCount(count => count + 1);
                setFirstBtnList(list => list.slice(1));
                message.textContent= "perfect";
                message.style.backgroundColor = "green";
                if (gameWrapper.current) gameWrapper.current.appendChild(message);
                setTimeout(() => {
                  if (gameWrapper.current) gameWrapper.current.removeChild(message);  
                }, 500);
              }

              else if (firstBtnList[0] + 150 >= time && time > firstBtnList[0] - 150) {
                const hitsound  = new Audio('/public/hitsound.mp3');
                // const hitsound  = new Audio('/hitsound.mp3'); // Needed for local 
                hitsound.volume = 0.5
                hitsound.play();
                setScore(score => score + 3);
                setHitCount(count => count + 1);
                setFirstBtnList(list => list.slice(1));
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
            message.classList.add("rightMessage")
            if (thirdBtnList.length === 0) {
            }
            else {
              if (time < thirdBtnList[0] - 150) {  
                message.textContent= "early";
                message.classList.add("earlyRight");
                // console.log(leftBtnList[0]);
                if (gameWrapper.current) gameWrapper.current.appendChild(message);
                setTimeout(() => {
                  if (gameWrapper.current) gameWrapper.current.removeChild(message);  
                }, 500);
              }
  
              else if (thirdBtnList[0] + 75 >= time && time > thirdBtnList[0] - 75) {
                setScore(score => score + 5);
                setHitCount(count => count + 1);
                setThirdBtnList(list => list.slice(1));
                const hitsound  = new Audio('/public/hitsound.mp3');
                // const hitsound  = new Audio('/hitsound.mp3'); // Needed for local 
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
  
  
              else if (thirdBtnList[0] + 150 >= time && time > thirdBtnList[0] - 150) {
                setScore(score => score + 3);
                setHitCount(count => count + 1);
                setThirdBtnList(list => list.slice(1));
                const hitsound  = new Audio('/public/hitsound.mp3');
                // const hitsound  = new Audio('/hitsound.mp3'); // Needed for local 
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

        if (event.key === 'l' || event.key === 'L') {
          setRightActionBtn(true);
          if (rightActionBtnHold) return;
          setRightActionBtnHold(true);

          const message = document.createElement('p');
          message.classList.add("message");

          if (direction === 'Left') {
            message.classList.add("leftMessage")
            if (secondBtnList.length === 0) {
            }
            else {
              if (time < secondBtnList[0] - 150) {  
                message.classList.add("earlyLeft");
                message.textContent= "early";
                if (gameWrapper.current) gameWrapper.current.appendChild(message);
                setTimeout(() => {
                  if (gameWrapper.current) gameWrapper.current.removeChild(message);  
                }, 500);
              }
              else if (secondBtnList[0] + 75 >= time && time > secondBtnList[0] - 75) {
                const hitsound  = new Audio('/public/hitsound.mp3');
                // const hitsound  = new Audio('/hitsound.mp3'); // Needed for local 
                hitsound.volume = 0.5
                hitsound.play();
                setScore(score => score + 5);
                setHitCount(count => count + 1);
                setSecondBtnList(list => list.slice(1));
                message.textContent= "perfect";
                message.style.backgroundColor = "green";
                if (gameWrapper.current) gameWrapper.current.appendChild(message);
                setTimeout(() => {
                  if (gameWrapper.current) gameWrapper.current.removeChild(message);  
                }, 500);
              }
              else if (secondBtnList[0] + 150 >= time && time > secondBtnList[0] - 150) {
                const hitsound  = new Audio('/public/hitsound.mp3');
                // const hitsound  = new Audio('/hitsound.mp3'); // Needed for local
                hitsound.volume = 0.5
                hitsound.play();
                setScore(score => score + 3);
                setHitCount(count => count + 1);
                setSecondBtnList(list => list.slice(1));
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
            message.classList.add("rightMessage")
            if (fourthBtnList.length === 0) {
            }
            else {
              if (time < fourthBtnList[0] - 150) {  
                message.textContent= "early";
                message.classList.add("earlyRight");
                // console.log(leftBtnList[0]);
                if (gameWrapper.current) gameWrapper.current.appendChild(message);
                setTimeout(() => {
                  if (gameWrapper.current) gameWrapper.current.removeChild(message);  
                }, 500);
              }
  
              else if (fourthBtnList[0] + 75 >= time && time > fourthBtnList[0] - 75) {
                setScore(score => score + 5);
                setHitCount(count => count + 1);
                setFourthBtnList(list => list.slice(1));
                const hitsound  = new Audio('/public/hitsound.mp3');
                // const hitsound  = new Audio('/hitsound.mp3'); // Needed for local 
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
  
  
              else if (fourthBtnList[0] + 150 >= time && time > fourthBtnList[0] - 150) {
                setScore(score => score + 3);
                setHitCount(count => count + 1);
                setFourthBtnList(list => list.slice(1));
                const hitsound  = new Audio('/public/hitsound.mp3');
                // const hitsound  = new Audio('/hitsound.mp3'); // Needed for local 
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
          if (beatBtnHold) return;
          setBeatBtnHold(true);
          console.log("First Lane", firstBtnList[0] - 1000);
          console.log("Second Lane", secondBtnList[0] - 1000);
          console.log("Third Lane", thirdBtnList[0] - 1000);
          console.log("Fourth Lane", fourthBtnList[0] - 1000);
        }

        if (event.key === 'p' || event.key === "P") {
          if (resetBtnHold) return
          setResetBtnHold(true);
          if (usingCustomMap) {
            customMap()
          }
          else {
            resetGame();
          }
        }
        if (event.key === 'q' || event.key === "Q") {
          if (toggleBtnHold) return;
          setToggleBtnHold(true);
          if (usingCustomMap) {
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
    }, [time, direction, leftBtnHold, rightBtnHold, toggleBtnHold, resetBtnHold]);

    const moveLeft = () => {
      gsap.to("#scoreline", {rotate: "45deg", duration: "0.2"}) // Duration can now be adjustable to user choice :). 0.5 seems to be the default
      setDirection("Left")
    }

    const moveRight = () => {
      gsap.to("#scoreline", {rotate: "-45deg", duration: "0.2"})
      setDirection("Right")
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
        if (event.key === 'j' || event.key === 'J') {
          setLeftActionBtn(false);
          setLeftActionBtnHold(false);
        }
        if (event.key === 'l' || event.key === 'L') {
          setRightActionBtn(false);
          setRightActionBtnHold(false);
        }
        if (event.key === 'H' || event.key === 'h') {
          setBeatBtnHold(false);
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
      setCustomMap(false);
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

      setFirstList([])
      setSecondList([])
      setThirdList([])
      setFourthList([])

      setFirstBtnList([])
      setSecondBtnList([])
      setThirdBtnList([])
      setFourthList([])

      setStopwatchActive(false);
      setStPaused(true);
      setTime(0);
      
      document.querySelectorAll(".curve").forEach(e => e.remove());
    
      setMusicStage();
    }

    const firstSectionStyle = {
      opacity: (direction === "Left")? "1": "0.3",      
      transition: 'opacity 0.2s linear'
    }
    const secondSectionStyle = {
      opacity: (direction === "Right")? "1": "0.3",
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

    const leftActionBtnStyle = {
      backgroundColor: leftActionBtnActive? "grey" : "black",
      color: leftActionBtnActive? "black" : "white",
      padding: 5,
      width: "fit-content"
    }

    const rightActionBtnStyle = {
      backgroundColor: rightActionBtnActive? "grey" : "black",
      color: rightActionBtnActive? "black" : "white",
      padding: 5,
      width: "fit-content"
    }

    const currentArea = {
      backgroundColor: (direction === 'Right')? "rgba(182, 34, 34)" : "rgba(25, 86, 128)",
      width: "fit-content",
      color: "#eaeaea",
      padding: "5px 10px",
    }

    const toggleMusic = () => {
      if (!stageSet) return;
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
        }, scrollSpeed)
      }
    }

    const customMap = () => {
      setCustomMap(true);
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
        setMusicSet(false);

        setTime(0);
        setStopwatchActive(false);
        setStPaused(true);
        setScore(0);
        // setHighScore(0);
        setHitCount(0);
        setMissCount(0);
        setNoteCount(0);

        setFirstList([])
        setSecondList([])
        setThirdList([])
        setFourthList([])
  
        setFirstBtnList([])
        setSecondBtnList([])
        setThirdBtnList([])
        setFourthList([])

        const lsit1 = [
          1430, 1740, 2070, 2420, 3690, 4040, 4370, 4690, 5030, 6240, 6580, 6880, 7190, 7500, 7820, 8130, 8450, 8750, 9060, 9390, 9710, 10050, 10370, 10670, 10940, 11260, 14120, 16660, 21290, 21940, 23230, 23860,  25060, 
          40960, 41260, 42220, 42360, 42700, 43090, 43470, 43600, 43930,  49150, 49500, 49810, 50120, 50450, 50770, 51110, 51390, 51720, 52010, 52150, 52300, 52430, 52750, 53060, 53410, 53550, 53690, 54820, 54940, 57160, 57320, 57440, 
          65660, 66010, 66120, 66440, 66770, 67110, 68870, 69200, 69510, 69840, 69980, 70230, 70530, 70820, 71280, 71600, 71880, 72190, 80030, 82570, 83220, 84500, 85140, 

          //Post "sympathy line" - samurai cut
          89690, 89830, 89990, 90660, 91090, 91230, 91480, 91910, 93150, 93450, 95000, 95370, 95540, 95890, 96230, 102830, 102990, 103570, 103730, 104060, 
          129080, 129490, 129620, 129950, 130270, 132570, 132880, 133200, 135410, 135740, 136040, 136360, 136680, 137010, 137300, 
          142270, 143270, 143630, 143790, 143980, 144160, 145150, 145470, 146110, 146750, 146900, 147310, 147650, 148460, 148650, 
          151620, 151780, 151930, 153040, 154260, 154510,  155330, 157770, 160340, 161620, 162840, 164030,

          //1:45 - 4:18,before basebal part
          166810, 167090, 167370, 168940, 169230, 169550, 170830, 171130, 171790, 171960, 172350, 173250, 173390, 173710, 174390, 178270, 178680, 178820, 179500, 179620, 180620, 
          198360, 198520, 198700, 200040, 200180, 200440, 200560, 201730, 201950, 202220, 202430, 203180, 203890, 204000,  204660, 204810, 205280, 205590, 207850, 208110, 208240, 208560, 208870, 209040, 209870, 210080, 210330, 211680, 
          228090, 228230, 228390, 228540, 228680, 228950, 229100, 229240, 229380, 231530, 231650, 231920, 232050, 232210, 233310, 233810, 234260, 234550, 234670, 234950, 235060, 235370, 235480, 235730, 235860, 236030, 236810, 236940, 
          249610, 249870, 249980, 250300, 250430, 250740, 250890, 251050, 251200, 251370, 251540, 252950, 253180, 
          
          //Last part
          259840, 260770, 262260, 264180, 266110, 268010, 269360, 270840, 271130, 271270, 
          280070, 280620, 281030, 281780, 282810, 282960, 283110, 283400, 283800, 284860, 285220, 285930, 286110, 286650, 287220, 287430, 288320, 289140, 289570, 291490, 291940, 292380, 292700, 294280, 294730, 297960, 298410, 298710, 
          299030, 299150, 299520, 299910, 300310, 300500, 314740, 315070, 315220, 315480, 315880, 316230, 316370, 316690, 317110, 317580, 
          
          352050, 352890, 353200, 354060, 354330, 355220, 355520, 356390, 356690, 357570, 357870, 358760, 359060, 359940, 360250, 
          361150, 361440, 362280, 362590, 363190
        ]

        const lsit2 = [
          44390, 44900, 45010, 45390, 45500, 45960, 46070, 46510, 46620, 46920, 47560, 47910, 48240, 48560, 48860, 54020, 54370, 54510, 54660, 55240, 55550, 55930, 56040, 56370, 56680, 57020, 62220, 62380, 62530, 62820, 63150, 67300, 

          //Post "sympathy line" - samurai cut
          92280, 92610, 92790, 93840, 94010, 94280, 94680, 103140, 103320, 104800, 105000, 105310, 105650, 107580, 107730, 108070, 108400, 109540, 109900, 110770, 
          111140, 111450, 111760, 111900, 113040, 113180, 113350, 113520, 113670, 113860, 114020, 115020, 115330, 115780, 115900, 116220, 116580, 116940, 117170, 117340, 117470, 119620, 119810, 119980, 120120, 120500, 120800, 123250, 
          130660, 131010, 131310, 131630, 131970, 132250, 133520, 133830, 134120, 134440, 134790, 135100, 137610, 137930, 138260, 138550,
          142600, 142920, 144430, 144860,  145790, 146420, 146580, 147980, 148300, 148790, 
          154920, 155080, 155550, 155780, 156440, 157110, 158370, 167710, 168060, 168370, 168710, 169890, 170050, 170330, 170650, 171430, 171610, 172730, 173080, 174230,  
        
          //1:45 - 4:18,before basebal part
          177400, 177780, 178090, 178990, 179180, 179350, 179960, 180280, 181180, 182520, 182840, 183360, 183490, 184540, 184680, 185350, 185650, 186340, 186500, 187150, 188240, 188430, 189100, 189230, 191090, 
          218530, 218930, 219200, 219320, 219600, 219720, 220010, 220140, 220390, 221320, 221560, 221700,  
          227840, 229970, 230470, 230730, 230840, 231100, 231230, 232380, 232500, 232830, 236190, 236510, 236670, 237600, 238080, 238220, 240030, 240300, 240460, 240650, 242150, 242260, 242570, 242670, 243030, 243150, 243410, 244640, 
          251930, 252250, 252500, 252690, 
          
          //Last part
          261790, 263690, 265620, 267540, 269230, 272830, 274300, 
          290370, 290870, 293180, 293880, 295090, 295560, 296250, 296600, 297010, 297130, 297500, 297800, 307080, 307540, 307990, 308270, 308590, 308720, 309140, 
          335490, 335840, 336260, 336680, 337020, 337890, 338210, 338650, 339100, 339420, 340290, 340600, 341060, 341470, 341790, 342080, 342360, 342670, 342990, 343270, 343570, 343840,

          344160, 344390, 345260, 345570, 346480, 346750, 347630, 347920, 348810, 349100, 349980, 350240, 351170, 351470, 352350, 352620, 353510, 353790, 354640, 354930
        ]

        const lsit3 = [
          25290, 26090, 26440, 26760, 27590, 27880, 28190, 28510, 28830, 29150, 29520, 29860, 30200, 30550, 30850, 35440, 35880, 36210, 36530, 36880, 37170, 37510, 37830, 38150, 38450, 38780, 39080, 39380, 39700, 39840, 40300, 40620, 
          57780, 58120, 58440, 58570, 58710, 58860, 59010, 59160, 59310, 59450, 59620, 59780, 59910, 60240, 60380, 60530, 60640, 61000, 61120, 61440, 61740, 62070, 63470, 63620, 63750, 64100, 64430, 64590, 64750, 64920, 65040, 65340,
           
          98110, 98260, 98600, 98950, 100490, 100830, 101020, 101370, 101680, 102430, 102630, 
          104410, 106010, 106180, 106400, 106610, 106860, 107200, 108740, 109020, 109200, 110270, 110400, 112460, 112620, 114240, 114520, 114660, 117800, 118120, 118510, 118650, 118960, 119290, 121260, 121610, 122010, 122420, 122590, 
          122730, 122890, 124790, 124970, 125140, 125310, 125490, 125630, 125980, 126330, 126760, 126910, 127070, 127230, 127400, 127560, 127720, 140430, 141370, 141650, 149280, 149430, 149800, 149930, 150840, 151170, 

          174540, 175580, 175740, 175850, 176640, 176840, 177030, 
          180770, 181680, 182000, 182140, 183180, 183870, 184070, 184190, 185030, 185800, 185930, 186660, 187010, 187540, 187900, 188800, 189610, 189760, 190200, 190480, 190810, 192140, 192450, 192740, 193080, 194420, 196330, 196580, 
          211940, 212070, 212400, 213720, 213900, 214020, 215100, 215370, 216550, 217540, 217850, 217990, 222760, 223010, 223130, 223410, 223520, 223830, 223960, 225190, 225300, 225480, 226130, 
          237090, 238520, 238660, 238940, 239240, 239370, 239590, 239730, 239870, 241000, 241490, 241860, 243560, 243700, 243860, 243990, 244320, 245320, 245610, 245940, 246240, 246380, 246520, 247680, 247830, 248000, 253370, 253570,

          260290, 261230, 263220, 265160, 267060, 268980, 270210, 271780, 272330, 
          275170, 275340, 275500, 275780, 276080, 278310, 278510, 278740, 279020,
          302300, 302760, 305200, 305610, 305900, 306240, 306620, 306760, 313470, 313840, 313960, 314300,  
          317880, 318140, 318270, 318680, 319060, 322050, 322630, 322990, 323370, 323550, 323850, 324210, 326740, 327160, 327490, 329840, 331000, 331420, 

          344660, 344930, 345880, 346180, 347040, 347310, 348220, 348500, 349380, 349670, 350570, 350860, 351760, 
        ]
          
        
        const lsit4 = [
          2740, 2900, 3060, 3210, 5310, 5460, 5610, 5760, 11640, 19200, 22600, 24500, 25680, 27050, 27380, 31170, 31510, 31850, 32180, 32480, 32790, 33100, 33410, 33740, 34030, 34340, 34670, 34980, 35260, 41610, 41910, 
          67460, 67640, 67770, 67940, 68260, 68560, 73710, 74340, 74960, 75620, 76260, 77810, 78060, 78310, 78470, 78770, 79380, 82260, 82880, 83540, 83850, 84200, 84840, 85450, 85770, 86060, 90340, 90510, 

          96630, 96790, 97290, 97710, 99380, 99530, 99830, 100160, 102070, 102230, 
          123390, 123560, 123960, 124110, 124290, 124440, 124600, 127890, 128050, 128220, 128370, 128740,  
          138900, 139210, 139520, 139820, 140120, 140750, 141510, 141840, 149140, 150220, 150520, 151470, 152360, 152730, 153360, 153690, 153850, 154070, 

          174920, 175250, 176200, 176350, 176490, 
          191460, 191820, 193370, 193690, 194010, 195890, 196180, 196720, 196840, 197110, 197230, 197420, 199760, 200890, 201040, 201230, 201440, 202680, 202880, 203640, 204250, 204370, 205040, 205980, 206240, 206500, 207480, 207720, 
          210580, 210870, 211290, 211550, 212520, 212740, 213060, 215490, 215760, 215880, 216190, 216300, 222280, 224230, 224490, 226600, 226890, 227000, 227260, 227360, 227690, 
          244990, 246820, 246970, 247230, 247380, 247540, 248220, 248360, 248640, 248910, 249150, 253910, 254160, 254370, 254640, 254890, 255040,

          262740, 264680, 266570, 268500, 269770, 273320, 277030,
          277290, 277420, 277680, 277990, 279920, 280270, 280800, 281360, 284710, 285020, 285560, 287960, 288810, 290080, 
          301080, 301410, 301550, 301970, 303440, 303870, 304260, 304380, 304730, 
          309500, 309860, 310060, 310360, 310670, 310950, 311080, 311490, 311880, 312340, 313010, 319360, 319650, 320200, 320440, 320660, 321110, 321460, 321790, 324480, 325080, 326230, 331810, 332210, 332830, 333390, 333990, 334580, 

          355820, 356100, 356990, 357280, 358170, 358440, 359340, 359660, 
          360550, 360850, 361720, 362010,  362880 
        ]

        const list1Btn = lsit1.map(num => num + scrollSpeed);
        const list2Btn = lsit2.map(num => num + scrollSpeed);
        const list3Btn = lsit3.map(num => num + scrollSpeed);
        const list4Btn = lsit4.map(num => num + scrollSpeed);

        setFirstList(lsit1);
        setSecondList(lsit2);

        setFirstBtnList(list1Btn);
        setSecondBtnList(list2Btn);

        setThirdList(lsit3);
        setFourthList(lsit4);

        setThirdBtnList(list3Btn);
        setFourthBtnList(list4Btn);
        
        setTimeout(() => {
          setStopwatchActive(true);
          setStPaused(false);
        }, scrollSpeed)

        setTimeout(() => {
          if (audioRefListening.current) {
            audioRefListening.current.play();
          }  
        }, scrollSpeed * 2)
        
        document.querySelectorAll(".curve").forEach(e => e.remove());
    }

    // Creating the curves of the first section
    useEffect(() => {
      if (time === firstList[0]) {
        setNoteCount(count => count + 1);
        const newEle = document.createElement('p');
        newEle.classList.add("curveOne")
        newEle.classList.add("curve")
        newEle.textContent= ""
        firstSection.current?.appendChild(newEle);
        newEle.style.animation = `blueCurveAnime ${scrollSpeed/1000}s linear`
        newEle.addEventListener("animationend", () => {
          firstSection.current?.removeChild(newEle);
        })
        setFirstList(list => list.slice(1));
      }
    }, [time, firstList])

    // Creating the curves of the second section
    useEffect(() => {
      if (time === secondList[0]) {
        setNoteCount(count => count + 1);
        const newEle = document.createElement('p');
        newEle.classList.add("curveTwo")
        newEle.classList.add("curve")
        newEle.textContent= ""
        firstSection.current?.appendChild(newEle);
        newEle.style.animation = `redCurveAnime ${scrollSpeed/1000}s linear`
        newEle.addEventListener("animationend", () => {
          firstSection.current?.removeChild(newEle);
        })
        setSecondList(list => list.slice(1));
      }
    }, [time, secondList])

    // Creating the curves of the third section
    useEffect(() => {
      if (time === thirdList[0]) {
        setNoteCount(count => count + 1);
        const newEle = document.createElement('p');
        newEle.classList.add("curveThree")
        newEle.classList.add("curve")
        newEle.textContent= ""
        secondSection.current?.appendChild(newEle);
        newEle.style.animation = `blueCurveAnime ${scrollSpeed/1000}s linear`
        newEle.addEventListener("animationend", () => {
          secondSection.current?.removeChild(newEle);
        })
        setThirdList(list => list.slice(1));
      }
    }, [time, thirdList])

    // Creating the curves of the fourth section
    useEffect(() => {
      if (time === fourthList[0]) {
        setNoteCount(count => count + 1);
        const newEle = document.createElement('p');
        newEle.classList.add("curveFour")
        newEle.classList.add("curve")
        newEle.textContent= ""
        secondSection.current?.appendChild(newEle);
        newEle.style.animation = `redCurveAnime ${scrollSpeed/1000}s linear`
        newEle.addEventListener("animationend", () => {
          secondSection.current?.removeChild(newEle);
        })
        setFourthList(list => list.slice(1));
      }
    }, [time, fourthList])

    // Checks for first List Misses
    useEffect(() => {
      if (firstBtnList.length > 0 && firstBtnList[0] < time - 150) {
        if (score > 0) {
          setScore(score => score - 1);
        }
        setMissCount(count => count + 1);
        setFirstBtnList(list => list.slice(1));
        const message = document.createElement('p');
        message.classList.add("message");
        message.classList.add("leftMessage");
        message.classList.add("missedLeft");
        message.textContent= "missed";
        if (gameWrapper.current) gameWrapper.current.appendChild(message);
        setTimeout(() => {
          if (gameWrapper.current) gameWrapper.current.removeChild(message);  
        }, 500);
      }
    }, [firstBtnList, time])
    
    // Checks for second List Misses
    useEffect(() => {
      if (secondBtnList.length > 0 && secondBtnList[0] < time - 150) {
        if (score > 0) {
          setScore(score => score - 1);
        }
        setMissCount(count => count + 1);
        setSecondBtnList(list => list.slice(1));
        const message = document.createElement('p');
        message.classList.add("message");
        message.classList.add("leftMessage");
        message.classList.add("missedLeft");
        message.textContent= "missed";
        if (gameWrapper.current) gameWrapper.current.appendChild(message);
        setTimeout(() => {
          if (gameWrapper.current) gameWrapper.current.removeChild(message);  
        }, 500);
      }
    }, [secondBtnList, time])
    
    // Checks for first List Misses
    useEffect(() => {
      if (thirdBtnList.length > 0 && thirdBtnList[0] < time - 150) {
        if (score > 0) {
          setScore(score => score - 1);
        }
        setMissCount(count => count + 1);
        setThirdBtnList(list => list.slice(1));
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
    }, [thirdBtnList, time])
    
    // Checks for first List Misses
    useEffect(() => {
      if (fourthBtnList.length > 0 && fourthBtnList[0] < time - 150) {
        if (score > 0) {
          setScore(score => score - 1);
        }
        setMissCount(count => count + 1);
        setFourthBtnList(list => list.slice(1));
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
    }, [fourthBtnList, time])


    return (
        <>
            <h1>Meyda Demo</h1>
            <div>
              <p>Press &quot;A&quot; to set the &quot;Active Area&quot; to Left</p>
              <br/>
              <p>Press &quot;D&quot; to set the &quot;Active Area&quot; to Right</p>
              <br/>
              <p>Press &quot;J&quot; to hit a Blue note reaching the edge of the current &quot;Active Area&quot;</p>
              <br/>
              <p>Press &quot;L&quot; to hit a Red note reaching the edge of the current &quot;Active Area&quot;</p>
              <br/>
              <p>Press &quot;Q&quot; to Play/Pause</p>
              <br/>
              <p>Press &quot;P&quot; to reset the track. Press after applying new Scroll Speed</p>
              <br/>
              <p>Enter your music file below and Presss &quot;Set Stage&quot; <br/> Or Play a Custom made map</p>
            </div>

            {/* <p>{time}</p> */}

            <audio src={audioURL ?? ""} controls={false} ref={audioRefListening} loop={false} />
            <audio src={audioURL ?? ""} controls={false} ref={audioRefSetting} loop={false} />
            <audio src={audioURL ?? ""} controls={false} loop={false} />

            <div style={{display: 'flex', gap: 20, flexDirection: 'column'}}>
              <input type="file" accept='audio/*' onChange={audioChange}/>
              {musicSet && <button onClick={setMusicStage} disabled={stageBtn}>Set Stage</button>}
            </div>

            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5}}>
              <div style={{display: 'flex', justifyContent: 'space-between', gap: 10}}>
                <button onClick={() => {setScrollSpeed(500)}}>500ms</button>
                <button onClick={() => {setScrollSpeed(1000)}}>1000ms</button>
                <button onClick={() => {setScrollSpeed(1500)}}>1500ms</button>
                <button onClick={() => {setScrollSpeed(2000)}}>2000ms</button>
              </div>
              <p>Current Scroll Speed: {scrollSpeed / 1000}s</p>
            </div>

            <button onClick={customMap}>Play Custom Map</button>

            <div style={currentArea}> {direction} </div>

            <div ref={gameWrapper} style={{position: "relative"}}>
              <div style={{display: 'flex', gap: 20, alignItems: 'flex-end', flexDirection: 'row', position: 'relative'}}>
                <div id='scoreline' ref={scoreline}></div>
                <div id='gamecontainer-circle' ref={gameContainer}>
                  <div className='click-Area caOne' ref={circleOne}></div>
                  <div className='click-Area caTwo' ref={circleTwo}></div>
                  <div className='click-Area caThree' ref={circleThree}></div>
                  <div className='click-Area caFour' ref={circleFour}></div>

                  <div className='curve-section' style={firstSectionStyle} ref={firstSection}></div>
                  <div className='curve-section' style={secondSectionStyle} ref={secondSection}></div>
                </div>
              </div>
              
              <div className='button-container'>
                <div style={leftBtnStyle}>A</div>
                <div style={rightBtnStyle}>D</div>
              </div>
              <div className='button-container'> 
                <div style={leftActionBtnStyle}>J</div>
                <div style={rightActionBtnStyle}>L</div>

              </div>

              
            </div>
            <div>
              <p>High Score: {highScore}</p>
              <p>Score: {score}</p>
              <p>Hit Count: {hitCount}</p>
              <p>Miss Count: {missCount}</p>
              <p>Note Count: {noteCount}</p>
            </div>

            {usingCustomMap && <button onClick={toggleMap}>Play/Pause</button>}
            
            {stageSet && <button onClick={toggleMusic}>Play/Pause</button>}
        </>
    )
}