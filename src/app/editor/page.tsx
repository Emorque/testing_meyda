'use client'

import { ChangeEvent, MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWavesurfer } from '@wavesurfer/react'
import { FixedSizeList as List } from 'react-window';
import Timeline from 'wavesurfer.js/dist/plugins/timeline.esm.js'

import "./editor.css";

const barGradient = "linear-gradient(rgba(0, 0, 0, 0) 0px, rgba(0, 0, 0, 0) 29px, rgba(255, 255, 255, 0.50) 30px, rgba(255, 255, 255, 0.50) 30px, rgba(0, 0, 0, 0) 30px, rgba(0, 0, 0, 0) 59px, rgba(255, 255, 255, 0.50) 60px, rgba(255, 255, 255, 0.50) 60px, rgba(0, 0, 0, 0) 60px, rgba(0, 0, 0, 0) 89px, rgba(255, 255, 255, 0.50) 90px, rgba(255, 255, 255, 0.50) 90px, rgba(0, 0, 0, 0) 90px, rgba(0, 0, 0, 0) 119px) no-repeat scroll 0px 0px / 100% 100% padding-box border-box"
const gameGradient = "linear-gradient(to right, rgba(0, 0, 0, 0) 0px, rgba(0, 0, 0, 0) 99px, rgba(255, 255, 255, 0.25) 100px, rgba(255, 255, 255, 0.25) 100px, rgba(0, 0, 0, 0) 100px, rgba(0, 0, 0, 0) 199px, rgba(255, 255, 255, 0.25) 200px, rgba(255, 255, 255, 0.25)200px, rgba(0, 0, 0, 0) 200px, rgba(0, 0, 0, 0) 299px, rgba(255, 255, 255, 0.25) 300px, rgba(255, 255, 255, 0.25) 300px, rgba(0, 0, 0, 0) 300px, rgba(0, 0, 0, 0) 399px) no-repeat scroll 0px 0px / 100% 100% padding-box border-box"
const formatTime = (seconds: number) => [seconds / 60, seconds % 60, (seconds % 1) * 100].map((v) => `0${Math.floor(v)}`.slice(-2)).join(':')

export default function Editor() {
  const [audioURL, setAudioURL] = useState<string>("")
  const [songLength, setSongLength] = useState<number>(0);    
  const [btn, setBtn] = useState<string>("Single Note");
  const [songNotes, setSongNotes] = useState<string[][]>([]);

  const waveformRef = useRef<HTMLDivElement>(null);

  const { wavesurfer, isReady, isPlaying, currentTime } = useWavesurfer({
    container: waveformRef,
    url: audioURL,
    waveColor: 'purple',
    height: 100,
    autoCenter: true,
    autoScroll: true,
    minPxPerSec: 256,
    width: 1000,
    hideScrollbar: false,
    dragToSeek: true,
    // plugins: useMemo(() => [Timeline.create()], []),
  })

  const audioChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioURL(URL.createObjectURL(file));
  }, []);


  const onPlayPause = useCallback(() => {
    wavesurfer && wavesurfer.playPause()
  }, [wavesurfer])

  useEffect(() => {
    if (wavesurfer) {
      const onScroll = () => {
        const scroll = wavesurfer.getScroll();
        if (vListRef.current) {
          vListRef.current.scrollToItem(scroll/16, 'start')
        }
      };

      wavesurfer.on('timeupdate', onScroll); // Update on playback
      wavesurfer.on('scroll', onScroll); // Update on manual scroll

      return () => {
        wavesurfer.un('timeupdate', onScroll);
        wavesurfer.un('scroll', onScroll);
      };
    }
  }, [wavesurfer]);

  const listRef = useRef<List>(null);
  const vListRef = useRef<List>(null);

  useEffect(() => {
    if (wavesurfer){
      const duration = wavesurfer.getDuration()
      setSongLength((duration * 16) + 1);
      setSongNotes(Array.from({ length: 4 }, () => new Array(Math.floor(((duration) * 16) + 1)).fill("")));
      }
  }, [isReady])
  
  const itemIndex = useMemo(() => {
    return Math.floor(currentTime * 16);
  }, [currentTime]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollToItem(itemIndex, 'start');
    }
  }, [itemIndex]);

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
  };

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

  const HRows = ({ index, style }: { index: number, style: React.CSSProperties }) => {
    const gameBarStyle =(index: number) => {
    let updatedBG: string;

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
      <p
        className="v-bar"
        onClick={(event) => changeNoteVer(index, event)}
        style={{ ...style, ...gameBarStyle(index) }} 
      >
      </p>
    );
  };

  const VRow = ({ index, style }: { index: number, style: React.CSSProperties }) => {
    const barStyle = (index: number) => {
      let updatedBG : string;
      
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
  
    return (
      <p
        className="i-bar"
        onClick={(event) => changeNoteHor(index, event)}
        style={{ ...style, ...barStyle(index) }} 
      >
      </p>
    );
  };

  const updatePBRate = (rate: number) => {
    if (wavesurfer) {
      wavesurfer.setPlaybackRate(rate);
    }
  }

  const exportMap = () => {
    console.log(songNotes)
    const exportedMap = []
    for (let i = 0; i < songNotes[0].length; i++) {
      if (songNotes[0][i] === "S") {
        exportedMap.push([i * 0.0625, "FL", i])
      }
      else if (songNotes[0][i] === "T") {
        exportedMap.push([i * 0.0625, "FT", i])
      }
      if (songNotes[1][i] === "S") {
        exportedMap.push([i * 0.0625, "FR", i])
      }
      if (songNotes[2][i] === "S") {
        exportedMap.push([i * 0.0625, "SL", i])
      }
      else if (songNotes[2][i] === "T") {
        exportedMap.push([i * 0.0625, "ST", i])
      }
      if (songNotes[3][i] === "S") {
        exportedMap.push([i * 0.0625, "SR", i])
      }
    }
    console.log(exportedMap)
  }
  
  return (
    <div>
      <div style={{display: 'flex', gap: 20, flexDirection: 'column'}}>
          <input type="file" accept='audio/*' onChange={audioChange}/>
      </div>
      <div id="editor-container">
          <p>{songLength}</p>
      </div>


      <div id="topbar-container">
        <div id="waveform-Container" ref={waveformRef}>
        </div>

        <div id="vBars-Container">
          <List
            ref={vListRef}
            className="hideScrollbar"
            height={128} 
            itemCount={songLength} 
            itemSize={16} 
            layout="horizontal"
            width={1000} 
            >
            {VRow}
          </List>
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
      <div id="gameContainer" >
        <List
          ref={listRef}
          className="scrollbar"
          height={500}
          itemCount={songLength}
          itemSize={16} 
          width={400} 
        >
          {HRows}
        </List>
      </div>

      <div style={{display: 'flex', gap: 10}}>
        <button onClick={() => {updatePBRate(0.25)}}>0.25</button>
        <button onClick={() => {updatePBRate(0.50)}}>0.50</button>
        <button onClick={() => {updatePBRate(0.75)}}>0.75</button>
        <button onClick={() => {updatePBRate(1)}}>1</button>
      </div>      
      <br/>
      {isReady &&
      <div style={{display: 'flex', gap: 10}}>
        <button onClick={exportMap}>Export Map</button>
      </div>
      }
    </div>
  );
}