This project has evolved into becoming a demo/vertical slice of an upcoming project I am working on

![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)

## Screenshots
### Game Page
![localhost_3000_ (1)](https://github.com/user-attachments/assets/5899628d-421c-4a53-a44e-76108cab1df7)

### Editor Page
![localhost_3000_editor](https://github.com/user-attachments/assets/ae5b7382-7ba6-47fd-8141-2308dd7a38ef)
![localhost_3000_editor (1)](https://github.com/user-attachments/assets/7a6822b4-9f1c-481a-9a1b-3bc869abe24a)

### Getting Started
You can play with the demo [here](https://emorque.github.io/testing_meyda/)

Alternatively, you can run the demo locally:

First, clone/download the repo

Second, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to play with the demo.

## How it works

Below is the code for when the user enters their own music file
- Using the Meyda library, the [loudness](https://meyda.js.org/audio-features) feature specifically, there are four bands meant to represent frequency
- When the average loudness of a set of bands reaches above 1.5, a curve is created for the user to hit on time
- This will the original vision of the demo. However, representing flow or rhythm from a audio file is difficult as there is immense variety in what the user can input
- There is potentially to build a decent default map with Meyda, which will likely be what happens in the final version
```
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
```

Below is code from the editor -> game
- From music sheets, I thought it would be great to allow for users to map 1/16 notes. As a result, this meant that I would need a way to render 16 * (file length in seconds) elements, and a way for each element to represent a specific moment in the song
- Additionally, since I wanted to also present another view for how the map would actually appear in-game, I needed to render that same number of elements again, bringing the total number of elements to: 32 * (file length in seconds)
- To address this, I'm using [React-Window](https://github.com/bvaughn/react-window) to reduce the number of elements rendered in the DOM at once

Below is how I use it for the viewer that aligns with the song's waveform:
- "List" is used directly from React-Window on to render 16 * (file length in seconds) elements
  - 400 width and 16 item size means that only around 25 rows at rendered at once 
- HRows represents how each row should be rendered
- Since the game uses 4 note lanes, the linear gradient and onClick help to provide the illusion of more clickable/editable elements, reducing the number of actual elements rendered
```
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

  const HRows = ({ index, style }: { index: number, style: React.CSSProperties }) => {
    const gameBarStyle =(index: number) => {

    const verticalGradients = [
      songNotes[0][index] === 'T' ? "linear-gradient(to bottom, rgb(104, 61, 81) 50%, rgba(0, 0, 0, 0) 50%) no-repeat scroll 0px 0px / 99px 100% padding-box border-box" : songNotes[0][index] === 'S' ? "linear-gradient(to bottom, rgb(25, 87, 128) 50%, rgba(0, 0, 0, 0) 50%) no-repeat scroll 0px 0px / 99px 100% padding-box border-box" : "linear-gradient(to bottom, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0) 50%) no-repeat scroll 0px 0px / 99px 100% padding-box border-box",
      songNotes[1][index] === 'T' ? "linear-gradient(to bottom, rgb(104, 61, 81) 50%, rgba(0, 0, 0, 0) 50%) no-repeat scroll 100px 0px / 99px 100% padding-box border-box" : songNotes[1][index] === 'S' ? "linear-gradient(to bottom, rgb(182, 34, 34) 50%, rgba(0, 0, 0, 0) 50%) no-repeat scroll 100px 0px / 99px 100% padding-box border-box" : "linear-gradient(to bottom, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0) 50%) no-repeat scroll 100px 0px / 99px 100% padding-box border-box",
      songNotes[2][index] === 'T' ? "linear-gradient(to bottom, rgb(104, 61, 81) 50%, rgba(0, 0, 0, 0) 50%) no-repeat scroll 200px 0px / 99px 100% padding-box border-box" : songNotes[2][index] === 'S' ? "linear-gradient(to bottom, rgb(25, 87, 128) 50%, rgba(0, 0, 0, 0) 50%) no-repeat scroll 200px 0px / 99px 100% padding-box border-box" : "linear-gradient(to bottom, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0) 50%) no-repeat scroll 200px 0px / 99px 100% padding-box border-box",
      songNotes[3][index] === 'T' ? "linear-gradient(to bottom, rgb(104, 61, 81) 50%, rgba(0, 0, 0, 0) 50%) no-repeat scroll 300px 0px / 99px 100% padding-box border-box" : songNotes[3][index] === 'S' ? "linear-gradient(to bottom, rgb(182, 34, 34) 50%, rgba(0, 0, 0, 0) 50%) no-repeat scroll 300px 0px / 99px 100% padding-box border-box" : "linear-gradient(to bottom, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0) 50%) no-repeat scroll 300px 0px / 99px 100% padding-box border-box",
    ];
  
    const updatedBG = `${gameGradient}, ${verticalGradients.join(", ")}`;
  
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
```

For exporting maps:
- The songNotes list which contains every element's current note assignment is iterated upon
  - Each element represents 1/16 of a second window in the song
- Both the time and note representation of that element is pushed onto the a new structure
- It then gets set in local storage, to be avaialbe for playing in the game page
- On the final version, I play on restructuring local storage to store mulitple maps at once; and to be able to save a map, to be able to continue editing in another visit
```
  const exportMap = () => {
    const exportedMap = []
    for (let i = 0; i < songNotes[0].length; i++) {
      if (songNotes[0][i] === "S") {
        exportedMap.push([roundNote(i * 62.5), "FL"])
      }
      else if (songNotes[0][i] === "T") {
        exportedMap.push([roundNote(i * 62.5), "FT"])
      }
      if (songNotes[1][i] === "S") {
        exportedMap.push([roundNote(i * 62.5), "FR"])
      }
      if (songNotes[2][i] === "S") {
        exportedMap.push([roundNote(i * 62.5), "SL"])
      }
      else if (songNotes[2][i] === "T") {
        exportedMap.push([roundNote(i * 62.5), "ST"])
      }
      if (songNotes[3][i] === "S") {
        exportedMap.push([roundNote(i * 62.5), "SR"])
      }
    }
    localStorage.setItem("customMap", JSON.stringify(exportedMap))
    if (localStorage.getItem("customMap")) {
      alert("Map saved locally")
    }
  }
```

Now back to the game page, if the user has set an edited map, and has clicked the buttons to play it:
- First, hitsounds are played when a user successful hits a note on time
- However, creating a new audio source is not efficient, especially if there are 2000+ notes that the user successful hits
  - Instead of creating that many sources, it is more efficient to create an array (hitsoundsRef), to store 12 audio sources
    - 4 for each lane, and 4 so that enough time has passed from one hitsound to then be replayed. You cannot play an audio element if it is currently being played   
- Then, the array from local storage is obtained, and iterated, creating lists for each lane with the times the user needs to hit a note 
```
  const tempHitsounds: { play: () => void; }[] = []
  for (let i = 0; i < 12; i++) {
    const hitsound  = new Audio('/testing_meyda/hitsound.mp3'); // Needed for github pages
    // const hitsound  = new Audio('/hitsound.mp3'); // Needed for local 
    hitsound.volume = 1
    tempHitsounds.push(hitsound);
  } 
  hitsoundsRef.current = tempHitsounds;

  for (let i = 0; i < res.length; i++) {
    if (res[i][1] === "FL") {
      list1Btn.push(res[i][0] + scrollSpeed)
    }
    else if (res[i][1] === "FR") {
      list2Btn.push(res[i][0] + scrollSpeed)
    }
    else if (res[i][1] === "SL") {
      list3Btn.push(res[i][0] + scrollSpeed)
    }
    else if (res[i][1] === "SR") {
      list4Btn.push(res[i][0] + scrollSpeed)
    }
    else if (res[i][1] === "FT") {
      spinListBtn1.push(res[i][0] + scrollSpeed)
    }
    else if (res[i][1] === "ST") {
      spinListBtn2.push(res[i][0] + scrollSpeed)
    }
  }

  setFirstBtnList(list1Btn);
  setSecondBtnList(list2Btn);
  setThirdBtnList(list3Btn);
  setFourthBtnList(list4Btn);

  setFirstSpinBtnList(spinListBtn1);
  setSecondSpinBtnList(spinListBtn2);
```

### Resources
Below are some of the libraries I used for this demo that will likely transition into the full-fledged project:
- [React-Window](https://github.com/bvaughn/react-window)
- [Wavesurfer](https://github.com/katspaugh/wavesurfer.js)
- [Meyda](https://github.com/meyda/meyda)
