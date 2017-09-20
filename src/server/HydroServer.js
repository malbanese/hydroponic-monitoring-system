const express = require('express')
const PNGCaptureRoutine = require('../image/PNGCaptureRoutine');
const RGBImage = require('../image/RaspiRGBImage');
const app = express()
const fs = require('fs');
const serveIndex = require('serve-index')

var imageWidth = 1280;
var imageHeight = 720;
var minimumSaveBrightness = 25;
var captureResult = null;
var imageCaptureInterval = 1000 * 60 * 5;
var imageSaveInterval = 1000 * 60 * 60;
var nextPictureTime = (new Date()).getTime() + PNGCaptureRoutine.getMSUntilNext(imageSaveInterval);

/**
 * PNG Capture callback to handle what needs to happen when a PNG image is ready.
 */
function pngCaptureCallback(result) {
  captureResult = result;

  let currentTime = new Date().getTime();
  console.log(`Capture | Brightness: ${result.brightness} | Time: ${currentTime} | SaveMS: ${nextPictureTime - currentTime}`);

  // Check to see if we should save this picture to the disk
  if(captureResult.brightness >= minimumSaveBrightness && currentTime >= nextPictureTime) {
    // Update the next time to take a picture
    nextPictureTime = currentTime + PNGCaptureRoutine.getMSUntilNext(imageSaveInterval);

    // Write the file to the system.
    fs.writeFile(`./bin/${currentTime}.png`, captureResult.pngBuffer, (err) => {
      console.log('Saving capture, next capture time: ' + nextPictureTime);

      if(!err) {
        lastSave = currentTime;
      }
    });
  }
}

// Start the capture process to continuously capture and save images.
PNGCaptureRoutine.getPNGCapturePromise(imageWidth, imageHeight).then(pngCaptureCallback);
PNGCaptureRoutine.startPNGCaptureRoutine(imageWidth, imageHeight, imageCaptureInterval, pngCaptureCallback);

/**
 * /history
 * Serves up a directory of past images
 */
app.use('/history', serveIndex('bin'));
app.use('/history', express.static('bin'));

/**
 * /nextPictureTime
 * Returns the amount of time until the next image is taken and saved to the disc.
 */
app.get('/nextPictureTime', (req, res) => {
  let time = PNGCaptureRoutine.getMSUntilNext(imageSaveInterval);
  let ms = Math.floor(time % 1000);
  let seconds = Math.floor((time / 1000) % 60);
  let minutes = Math.floor((time / 1000)  / 60);
  res.end(JSON.stringify({
    time,
    minutes,
    seconds,
    ms
  }));
});

/**
 * /brightness
 * Captures a picture and returns the average brightness of the image.
 */
app.get('/brightness', (req, res) => {
  if(captureResult) {
    res.end('' + captureResult.brightness);
  } else {
    res.end('Image not ready yet.');
  }
});

/**
 * /refresh
 * Updates the PNG image and writes the output as an image.
 */
app.get('/refresh', (req, res) => {
  PNGCaptureRoutine.getPNGCapturePromise(imageWidth, imageHeight).then((result) => {
    pngCaptureCallback(result);

    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': captureResult.pngBuffer.length
    });

    res.end(captureResult.pngBuffer);
  });
});

/**
 * /
 * Returns the last image taken by the camera.
 */
app.get('/', (req, res) => {
  if(captureResult) {
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': captureResult.pngBuffer.length
    });

    res.end(captureResult.pngBuffer);
  } else {
    res.end('Image not ready yet.');
  }
});

app.listen(8080, () => {})
