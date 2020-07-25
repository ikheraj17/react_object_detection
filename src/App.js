import React, { useEffect, useRef, createRef } from "react";
import logo from "./logo.svg";
import "./App.css";
import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";

function App() {
  const videoElement = createRef(null);

  useEffect(() => {
    async function prepare() {
      let net = await mobilenet.load();
      console.log("loaded model");
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
          });
          window.stream = stream;
          videoElement.current.srcObject = stream;
          let webcamElement = document.getElementById("blah");
          const webcam = await tf.data.webcam(webcamElement);
          while (true) {
            const img = await webcam.capture();
            const result = await net.classify(img);

            console.log(`prediction: ${result[0].className}\n
              probability: ${result[0].probability}
            `);
            img.dispose();

            await tf.nextFrame();
          }
        } catch (error) {
          console.error(error);
        }
      }
    }
    prepare();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        {/* <Cam /> */}
        <img
          id="img"
          src={"https://i.imgur.com/JlUvsxa.jpg"}
          crossOrigin="anonymous"
          width="227"
          height="227"
          alt="pic"
        />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <video
          id="blah"
          ref={videoElement}
          width="640"
          height="640"
          autoPlay
          muted
        />
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
