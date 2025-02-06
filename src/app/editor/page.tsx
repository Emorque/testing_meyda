'use client'

import { ChangeEvent, MouseEvent, useEffect, useRef, useState } from "react";
import { useWavesurfer } from '@wavesurfer/react'
import Timeline from 'wavesurfer.js/dist/plugins/timeline.esm.js'

import "./editor.css";

const barGradient = "linear-gradient(rgba(0, 0, 0, 0) 0px, rgba(0, 0, 0, 0) 29px, rgb(255, 255, 255) 30px, rgb(255, 255, 255) 30px, rgba(0, 0, 0, 0) 30px, rgba(0, 0, 0, 0) 59px, rgb(255, 255, 255) 60px, rgb(255, 255, 255) 60px, rgba(0, 0, 0, 0) 60px, rgba(0, 0, 0, 0) 89px, rgb(255, 255, 255) 90px, rgb(255, 255, 255) 90px, rgba(0, 0, 0, 0) 90px, rgba(0, 0, 0, 0) 119px) no-repeat scroll 0px 0px / 100% 100% padding-box border-box"
const gameGradient = "linear-gradient(to right, rgba(0, 0, 0, 0) 0px, rgba(0, 0, 0, 0) 99px, rgb(255, 255, 255) 100px, rgb(255, 255, 255) 100px, rgba(0, 0, 0, 0) 100px, rgba(0, 0, 0, 0) 199px, rgb(255, 255, 255) 200px, rgb(255, 255, 255) 200px, rgba(0, 0, 0, 0) 200px, rgba(0, 0, 0, 0) 299px, rgb(255, 255, 255) 300px, rgb(255, 255, 255) 300px, rgba(0, 0, 0, 0) 300px, rgba(0, 0, 0, 0) 399px) no-repeat scroll 0px 0px / 100% 100% padding-box border-box"

const formatTime = (seconds: number) => [seconds / 60, seconds % 60].map((v) => `0${Math.floor(v)}`.slice(-2)).join(':')

export default function Editor() {
  const [audioURL, setAudioURL] = useState<string>("")
  const audioRefListening = useRef<HTMLAudioElement>(null);
  const [songLength, setSongLength] = useState<number>(0);    
  const waveformRef = useRef<HTMLDivElement>(null);
  const [btn, setBtn] = useState<string>("Single Note");
  const [scroll, setScroll] = useState<number>(0)
  const [songNotes, setSongNotes] = useState<string[][]>([]);
  const [audioR, setAudioRate] = useState<number>(1);

  const audioChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioURL(URL.createObjectURL(file));

    if (audioRefListening.current) {
      audioRefListening.current.pause();
      audioRefListening.current.currentTime = 0;
      audioRefListening.current.onloadedmetadata = function() {
        setSongLength(((audioRefListening.current?.duration as number) * 16) + 1);
        setSongNotes(Array.from({ length: 4 }, () => new Array(Math.floor(((audioRefListening.current?.duration as number) * 16) + 1)).fill("")));
      }
    }
  }


  const onPlayPause = () => {
    wavesurfer && wavesurfer.playPause()
  }

  const { wavesurfer, isPlaying, currentTime } = useWavesurfer({
    container: waveformRef,
    url: audioURL,
    waveColor: 'purple',
    height: 100,
    audioRate: audioR,
    autoCenter: true,
    autoScroll: true,
    minPxPerSec: 256,
    hideScrollbar: true,
    dragToSeek: true,
    // plugins: useMemo(() => [Timeline.create()], []),
  })

  useEffect(() => {
    if (wavesurfer) {
      const onScroll = () => {
        const scroll = wavesurfer.getScroll();
        setScroll(scroll);
      };

      wavesurfer.on('timeupdate', onScroll); // Update on playback
      wavesurfer.on('scroll', onScroll); // Update on manual scroll

      return () => {
        wavesurfer.un('timeupdate', onScroll);
        wavesurfer.un('scroll', onScroll);
      };
    }
  }, [wavesurfer]);

  const translationStyle = {
    transform: `translateX(-${scroll}px)`,
    width: songLength * 16 + 1,
  }

  const verticalBarStyle = {
    transform: `translateY(-${currentTime * 256}px)`,
  }

  useEffect(() => {
    const handleKeyDown = (event: { key: string; }) => {
      if (isPlaying) return; // If spamming keys while play, big lag spike as the rerenders hurt transformations
      if (event.key === 's' || event.key === 'S') {
        setBtn("Single Note")
      }      
      // Used for helping to map songs
      if (event.key === 'k' || event.key === 'K') {
        // console.log(songNotes);
        setBtn("Turn Note");
      }
    }
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup the event listener on unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying]);

  const changeNoteHor = (index: number, event: MouseEvent<HTMLParagraphElement>) => {
    if (140 < event.clientY && event.clientY <= 170) { // First Bar
      if (btn === "Turn Note") {
        setDoubleNote(0, 1, index)
      }
      else {
        setNewNote(0, 1, index, "S");
      }
    }
    else if (170 < event.clientY && event.clientY <= 200) { // Second Bar
      console.log("bar2")
      if (btn === "Turn Note") {
        setDoubleNote(0, 1, index)
      }
      else {
        setNewNote(1, 0, index, "S");
      }
    }
    else if (200 < event.clientY && event.clientY <= 230) { // Third Bar
      if (btn === "Turn Note") {
        setDoubleNote(2, 3, index)
      }
      else {
        setNewNote(2, 3, index, "S");
      }
    }
    else if (230 < event.clientY && event.clientY <= 260) { // Fourth Bar
      console.log("bar4")
      if (btn === "Turn Note") {
        setDoubleNote(2, 3, index)
      }
      else {
        setNewNote(3, 2, index, "S");
      }
    }
  }

  const changeNoteVer = (index: number, event: MouseEvent<HTMLParagraphElement>) => {
    const mousePlacement = event.clientX - (document.getElementById('gameContainer')?.getBoundingClientRect().left as number)

    if (0 < mousePlacement && mousePlacement <= 100) { // First Bar
      if (btn === "Turn Note") {
        setDoubleNote(0, 1, index)
      }
      else {
        setNewNote(0, 1, index, "S");
      }
    }
    else if (100 < mousePlacement && mousePlacement <= 200) { // Second Bar
      console.log("bar2")
      if (btn === "Turn Note") {
        setDoubleNote(0, 1, index)
      }
      else {
        setNewNote(1, 0, index, "S");
      }
    }
    else if (200 < mousePlacement && mousePlacement <= 300) { // Third Bar
      if (btn === "Turn Note") {
        setDoubleNote(2, 3, index)
      }
      else {
        setNewNote(2, 3, index, "S");
      }
    }
    else if (300 < mousePlacement && mousePlacement <= 400) { // Fourth Bar
      console.log("bar4")
      if (btn === "Turn Note") {
        setDoubleNote(2, 3, index)
      }
      else {
        setNewNote(3, 2, index, "S");
      }
    }
  }

  const setDoubleNote = (firstBar: number, secondBar: number, index: number) => {
    const newNotes = songNotes.map((songBar, barIndex) => {
      if (barIndex === firstBar || barIndex === secondBar) {
        return songBar.map((n, nIndex) => {
          if (nIndex === index) {
            if (n === "T") {
              return ""
            }
            else {
              return "T"
            }
          }
          else {
            return n
          }
        })
      }
      else {
        return songBar
      }
    })
    setSongNotes(newNotes)
  }  

  const setNewNote = (bar : number, otherBar: number, index:number, note:string) => {
    const newNotes = songNotes.map((songBar, barIndex) => {
      if (barIndex === bar) {
        return songBar.map((n, nIndex) => {
          if (nIndex === index) {
            if (n === note) {
              return ""
            }
            else {
              return note
            }
          }
          else {
            return n
          }
        })
      }
      if (barIndex === otherBar) {
        return songBar.map((n, nIndex) => {
          if (nIndex === index) {
            if (n === "T") {
              return ""
            }
            else {
              return n
            }
          }
          else {
            return n
          }
        })
      }
      else {
        return songBar
      }
    })
    setSongNotes(newNotes)
  }

  const barStyle = (index: number) => {
    // Base vertical gradient
    let updatedBG : string;
    
    // Dynamically add horizontal gradients based on songNotes
    const horizontalGradients = [
      songNotes[0][index] === 'T' ? "linear-gradient(to right, rgb(225, 0, 255) 50%, rgba(0, 0, 0, 0) 50%) no-repeat scroll 0px 0px / 100% 29px padding-box border-box" : songNotes[0][index] === 'S' ? "linear-gradient(to right, rgb(255, 0, 0) 50%, rgba(0, 0, 0, 0) 50%) no-repeat scroll 0px 0px / 100% 29px padding-box border-box" : "linear-gradient(to right, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0) 50%) no-repeat scroll 0px 0px / 100% 29px padding-box border-box",
      songNotes[1][index] === 'T' ? "linear-gradient(to right, rgb(225, 0, 255) 50%, rgba(0, 0, 0, 0) 50%) no-repeat scroll 0px 30px / 100% 29px padding-box border-box" : songNotes[1][index] === 'S' ? "linear-gradient(to right, rgb(0, 0, 255) 50%, rgba(0, 0, 0, 0) 50%) no-repeat scroll 0px 30px / 100% 29px padding-box border-box" : "linear-gradient(to right, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0) 50%) no-repeat scroll 0px 30px / 100% 29px padding-box border-box",
      songNotes[2][index] === 'T' ? "linear-gradient(to right, rgb(255, 0, 225) 50%, rgba(0, 0, 0, 0) 50%) no-repeat scroll 0px 60px / 100% 29px padding-box border-box" : songNotes[2][index] === 'S' ? "linear-gradient(to right, rgb(255, 0, 0) 50%, rgba(0, 0, 0, 0) 50%) no-repeat scroll 0px 60px / 100% 29px padding-box border-box" : "linear-gradient(to right, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0) 50%) no-repeat scroll 0px 60px / 100% 29px padding-box border-box",
      songNotes[3][index] === 'T' ? "linear-gradient(to right, rgb(225, 0, 255) 50%, rgba(0, 0, 0, 0) 50%) no-repeat scroll 0px 90px / 100% 29px padding-box border-box" : songNotes[3][index] === 'S' ? "linear-gradient(to right, rgb(0, 0, 255) 50%, rgba(0, 0, 0, 0) 50%) no-repeat scroll 0px 90px / 100% 29px padding-box border-box" : "linear-gradient(to right, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0) 50%) no-repeat scroll 0px 90px / 100% 29px padding-box border-box",
    ];
  
    updatedBG = `${barGradient}, ${horizontalGradients.join(", ")}`;
  
    return {
      background: updatedBG,
    };
  };

  const gameBarStyle = (index: number) => {
    // Base vertical gradient
    let updatedBG: string;

    // Dynamically add horizontal gradients based on songNotes
    const verticalGradients = [
      songNotes[0][index] === 'T' ? "linear-gradient(to bottom, rgb(225, 0, 255) 50%, rgba(0, 0, 0, 0) 50%) no-repeat scroll 0px 0px / 99px 100% padding-box border-box" : songNotes[0][index] === 'S' ? "linear-gradient(to bottom, rgb(255, 0, 0) 50%, rgba(0, 0, 0, 0) 50%) no-repeat scroll 0px 0px / 99px 100% padding-box border-box" : "linear-gradient(to bottom, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0) 50%) no-repeat scroll 0px 0px / 99px 100% padding-box border-box",
      songNotes[1][index] === 'T' ? "linear-gradient(to bottom, rgb(225, 0, 255) 50%, rgba(0, 0, 0, 0) 50%) no-repeat scroll 100px 0px / 99px 100% padding-box border-box" : songNotes[1][index] === 'S' ? "linear-gradient(to bottom, rgb(0, 0, 255) 50%, rgba(0, 0, 0, 0) 50%) no-repeat scroll 100px 0px / 99px 100% padding-box border-box" : "linear-gradient(to bottom, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0) 50%) no-repeat scroll 100px 0px / 99px 100% padding-box border-box",
      songNotes[2][index] === 'T' ? "linear-gradient(to bottom, rgb(225, 0, 255) 50%, rgba(0, 0, 0, 0) 50%) no-repeat scroll 200px 0px / 99px 100% padding-box border-box" : songNotes[2][index] === 'S' ? "linear-gradient(to bottom, rgb(255, 0, 0) 50%, rgba(0, 0, 0, 0) 50%) no-repeat scroll 200px 0px / 99px 100% padding-box border-box" : "linear-gradient(to bottom, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0) 50%) no-repeat scroll 200px 0px / 99px 100% padding-box border-box",
      songNotes[3][index] === 'T' ? "linear-gradient(to bottom, rgb(225, 0, 255) 50%, rgba(0, 0, 0, 0) 50%) no-repeat scroll 300px 0px / 99px 100% padding-box border-box" : songNotes[3][index] === 'S' ? "linear-gradient(to bottom, rgb(0, 0, 255) 50%, rgba(0, 0, 0, 0) 50%) no-repeat scroll 300px 0px / 99px 100% padding-box border-box" : "linear-gradient(to bottom, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0) 50%) no-repeat scroll 300px 0px / 99px 100% padding-box border-box",
    ];
  
    updatedBG = `${gameGradient}, ${verticalGradients.join(", ")}`;
  
    return {
      background: updatedBG,
    };
  }
  

  return (
    <div>
      <div style={{display: 'flex', gap: 20, flexDirection: 'column'}}>
          <input type="file" accept='audio/*' onChange={audioChange}/>
      </div>
      <audio src={audioURL ?? ""} controls={false} ref={audioRefListening} loop={false} />
      <div id="editor-container">
          <p>{songLength}</p>
      </div>


      <div id="topbar-container">
        <div ref={waveformRef}>
        </div>

        <div id="bar" style={translationStyle}>
          {Array.from({length: songLength}, (_, index) => (
            <p className="i-bar" key={index} onClick={(event) => changeNoteHor(index, event)} style={barStyle(index)}></p>
          ))}
        </div>
      </div>
      <br/>
      <div style={{ margin: '1em 0', display: 'flex', gap: '1em' }}>
        <p>Current time: {formatTime(currentTime)}</p>
        <button onClick={onPlayPause} style={{ minWidth: '5em' }}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      </div>
      <p>Current Button: {btn}</p>
      <div id="gameContainer">
        <div className="bar-vertical" style={verticalBarStyle}>
          {Array.from({length: songLength}, (_, index) => (
            <p className="v-bar" key={("fL" + index)} onClick={(event) => changeNoteVer(index, event)} style={gameBarStyle(index)}></p>
          ))}
        </div>

      </div>

      <div style={{display: 'flex', gap: 10}}>
        <button onClick={() => {setAudioRate(0.25)}}>0.25</button>
        <button onClick={() => {setAudioRate(0.50)}}>0.50</button>
        <button onClick={() => {setAudioRate(0.75)}}>0.75</button>
        <button onClick={() => {setAudioRate(1)}}>1</button>
        <button onClick={() => {setAudioRate(2)}}>2</button>
      </div>

      <br/>
      {/* <div>Please mind the hectic mess, this is still very much a work in progress</div> */}

    </div>
  );
}