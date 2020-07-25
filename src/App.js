import React, { useEffect, useRef, createRef } from "react";
import logo from "./logo.svg";
import "./App.css";
import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

const App = () => {

  const styles = {
    position: 'fixed',
    top: 150,
    left: 150,
  };

  const videoElement = createRef(null);
  const canvasElement = createRef();

   const detectFromVideoFrame = (model, video) => {
    model.detect(video).then(predictions => {
      showDetections(predictions);

      requestAnimationFrame(() => {
        detectFromVideoFrame(model, video);
      });
    }, (error) => {
      console.log("Couldn't start the webcam")
      console.error(error)
    });
  };

   const showDetections = predictions => {
    const ctx = canvasElement.current.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const font = "24px helvetica";
    ctx.font = font;
    ctx.textBaseline = "top";

    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      const width = prediction.bbox[2];
      const height = prediction.bbox[3];
      // Draw the bounding box.
      ctx.strokeStyle = "#2fff00";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, width, height);
      // Draw the label background.
      ctx.fillStyle = "#2fff00";
      const textWidth = ctx.measureText(prediction.class).width;
      const textHeight = parseInt(font, 10);
      // draw top left rectangle
      ctx.fillRect(x, y, textWidth + 10, textHeight + 10);
      // draw bottom left rectangle
      ctx.fillRect(x, y + height - textHeight, textWidth + 15, textHeight + 10);

      // Draw the text last to ensure it's on top.
      ctx.fillStyle = "#000000";
      ctx.fillText(prediction.class, x, y);
      ctx.fillText(prediction.score.toFixed(2), x, y + height - textHeight);
    });
  }

  useEffect(() => {
    async function prepare() {
      let net = cocoSsd.load();
      console.log("loaded model");
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        
          const stream = navigator.mediaDevices.getUserMedia({
            audio: false,
            video: true,
          })
            .then(stream => {
              window.stream = stream;
              videoElement.current.srcObject = stream;
              return new Promise(resolve => {
                videoElement.current.onloadedmetadata = () => {
                  resolve();
                };
              });
            }, (error => {
              console.log('there was an error starting the webcam');
            }))
          let webcamElement = document.getElementById("blah");
          // const webcam = await tf.data.webcam(webcamElement);
          Promise.all([net, stream])
            .then(values => {
              detectFromVideoFrame(values[0], videoElement.current);
            })
            .catch(err => {
              console.error(err);
            });
        }
      }
      prepare();
    }
  ,[])
    // prepare();

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <video
          id="blah"
          ref={videoElement}
          width="720"
          height="600"
          autoPlay
          muted
        />
        <canvas style={styles} ref={canvasElement} width="720" height="650" />
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
