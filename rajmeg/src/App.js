// https://github.com/ffmpegwasm/ffmpeg.wasm/issues/245

import React, { useState, useEffect } from 'react';
import './App.css';

import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
const ffmpeg = createFFmpeg({ log: true });

function App() {
  const [ready, setReady] = useState(false);
  const [video, setVideo] = useState();
  const [gif, setGif] = useState();
  const [image, setImage] = useState();
  const [images, setImages] = useState();

  const load = async () => {
    await ffmpeg.load();
    setReady(true);
  }

  useEffect(() => {
    load();
  }, [])  // only called once

  const convertToGif = async () => {
    ffmpeg.FS('writeFile', 'test.mp4', await fetchFile(video));

    await ffmpeg.run('-i', 'test.mp4', '-t', '10', '-ss', '0.0', '-f', 'gif', 'out.gif');

    const data = ffmpeg.FS('readFile', 'out.gif');
    const url = URL.createObjectURL(new Blob([data.buffer], { type: 'image/gif' }));
    setGif(url);
  }

  const convertToFrames = async () => {
    ffmpeg.FS('writeFile', 'test.mp4', await fetchFile(video));

    await ffmpeg.run('-i', 'test.mp4', '-vf', 'fps=30', 'output%0d.png');

    // console.log(ffmpeg.FS);
    var listOfUrls = [];
    for (var i = 1; i < 30 * 18; ++i) {
      const data = ffmpeg.FS('readFile', `output${i}.png`);
      const url = URL.createObjectURL(new Blob([data.buffer], { type: 'image/png' }));
      listOfUrls = [...listOfUrls, url];
    }
    setImages(listOfUrls);
  }

  return ready ? (
    <div className="App">
      {video && <video
        controls
        width="250"
        src={URL.createObjectURL(video)}>
      </video>}


      <input type="file" onChange={(e) => { setVideo(e.target.files?.item(0)) }} />

      <h3>Result</h3>
      <button onClick={convertToFrames}>
        Convert
      </button>

      {gif && <img src={gif} width="250" />}
      {image && <img src={image} width="250" />}
      {images && [...images].map((image) => <img src={image} width="250" />)}
    </div>
  ) : (
    <p>Loading...</p>
  );
}

export default App;
