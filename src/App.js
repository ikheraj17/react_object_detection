import React, { useEffect, createRef } from "react";
import "./App.css";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

const App = () => {

  const styles = {
    position: 'fixed',
    top: 300
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
    const context = canvasElement.current.getContext("2d");
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    const font = "24px helvetica";
    context.font = font;
    context.textBaseline = "top";

    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      const width = prediction.bbox[2];
      const height = prediction.bbox[3];
      // Draw box
      context.strokeStyle = "#2fff00";
      context.lineWidth = 1;
      context.strokeRect(x, y, width, height);
      // Draw label with background
      context.fillStyle = "#2fff00";
      const textWidth = context.measureText(prediction.class).width;
      const textHeight = parseInt(font, 10);
      // draw top left rectangle
      context.fillRect(x, y, textWidth + 10, textHeight + 10);
      // draw bottom left rectangle
      context.fillRect(x, y + height - textHeight, textWidth + 15, textHeight + 10);

      // Draw text last to ensure it's on top.
      context.fillStyle = "#000000";
      context.fillText(prediction.class, x, y);
      context.fillText(prediction.score.toFixed(2), x, y + height - textHeight);
    });
  }

  useEffect(() => {
    async function prepare() {
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
            }));
        let net = cocoSsd.load();
        console.log("loaded model");
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
  )

  return (
    <div className="App">
      <div className="title">
        <p>This application uses tensorflow.js and  the pretrained coco-ssd model to make predictions about the type of object on the screen. The numbers that are part of each green prediction box are the model's prediction confidence level for the object in frame.</p>
        <p>When prompted, give the application access to your webcam and the live predictions will begin!</p>
        </div> 
      <header className="App-header">
        <video
          id="blah"
          style={styles}
          ref={videoElement}
          width="420"
          height="500"
          autoPlay
          muted
        />
        <canvas style={styles} ref={canvasElement} width="420" height="550" />
      </header>
    </div>
  );
}

export default App;
