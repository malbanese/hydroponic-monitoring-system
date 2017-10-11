const RGBImage = require('./RaspiRGBImage');
const Overlay = require('./Overlay').Overlay;
const RGBBuffer = require('./RGBBuffer');
const HumidTemp = require('../sensor/HumidTemp');
const overlay = new Overlay();

/**
 * [getPNGCapturePromise description]
 * @param  {Number}   imageWidth  The width of the image to capture.
 * @param  {Number}   imageHeight The height of the image to capture.
 * @return {{
 *         pngBuffer: {Buffer},
 *         brightness: {Number},
 *         captureStartTime: {Number}.
 *         captureEndTime: {Number},
 *         captureDuration: {Number}
 * }}
 */
function getPNGCapturePromise(imageWidth, imageHeight) {
  let captureStartTime = (new Date()).getTime();

  return new Promise((resolve, reject) => {
    Promise.all([
      RGBImage.takeRGBPicture(imageWidth, imageHeight),
      overlay.loadResources()
    ]).then((results) => {
      // The RGB Buffer from the image capture.
      let rgbBuffer = results[0];

      // Converted RGB buffer into a bitmap.
      let rgbBitmap = RGBBuffer.getBitmapFromBuffer(rgbBuffer, imageWidth, imageHeight);

      // The brightness of the returned image.
      let brightness = getAverageBrightness(rgbBitmap);

      // Get the correct sensor information to draw our overlay.
      HumidTemp.getHumidityTemperature().then( (result) => {
        overlay.drawOverlay(rgbBitmap, result.temperature, result.humidity);
      }).then(() => {
        // Write out the overlay into a PNG buffer.
        return RGBBuffer.writeBitmapToPNGBuffer(rgbBitmap).then((pngBuffer) => {
          let captureEndTime = (new Date()).getTime();

          // Resolve with the image and the calculated brightness.
          resolve({
            pngBuffer,
            brightness,
            captureStartTime,
            captureEndTime,
            captureDuration: captureEndTime - captureStartTime
          });
        });
      });
    });
  });
};

/**
 * Returns the average brightness of an RGB bitmap. This is computed by
 * calculating the average greyscale value of the entire image.
 * @param  {Number} rgbBitmap The bitmap to iterate over.
 * @return {Number} A number between 0-255 depending on the brightness.
 */
function getAverageBrightness(rgbBitmap) {
  let greyscaleValue = 0;

  for(var x=0; x < rgbBitmap.width; x++) {
    for(var y=0; y < rgbBitmap.height; y++) {
      var rgb = rgbBitmap.getPixelRGBA(x,y);

      // Using masking, calculate the average of the three color channels.
      greyscaleValue += (((0xFF000000 & rgb) >>> 24) + ((0xFF0000 & rgb) >>> 16) + ((0xFF00 & rgb) >>> 8)) / 3;
    }
  }

  return greyscaleValue / (rgbBitmap.width * rgbBitmap.height);
}

// The public module exports~
module.exports = {
  getPNGCapturePromise,
  getAverageBrightness
};
