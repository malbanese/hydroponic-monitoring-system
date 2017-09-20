var RGBImage = require('./RaspiRGBImage');
var Overlay = require('./Overlay').Overlay;
var RGBBuffer = require('./RGBBuffer');
var HumidTemp = require('../sensor/HumidTemp');

var overlay = new Overlay();

/**
 * Returns the modulated time until the next interval, starting at epoch time.
 * @param  {Number} msInterval The millisecond interval to query
 * @return {Number}            The epoch time modulated number of ms until the
 *                             next instance of this interval.
 */
function getMSUntilNext(msInterval) {
  return msInterval - (new Date).getTime() % msInterval;
}

/**
 * Starts a callback loop that fires every hour, on the hour.
 * @param  {Number}   imageWidth  The width of the image to capture.
 * @param  {Number}   imageHeight The height of the image to capture.
 * @param {NumbeR}    intervalMS The interval at which to take pictures.
 * @param  {Function} cb          [description]
 * @return {[type]}               [description]
 */
function startPNGCaptureRoutine(imageWidth, imageHeight, intervalMS, cb) {
  setTimeout(() => {
    getPNGCapturePromise(imageWidth, imageHeight, 30).then((pngResult) => {
      cb(pngResult);
      startPNGCaptureRoutine(imageWidth, imageHeight, intervalMS, cb);
    }).catch((error) => {
      // Nothing needed here.
    });
  }, getMSUntilNext(intervalMS));
};

/**
 * [getPNGCapturePromise description]
 * @param  {Number}   imageWidth  The width of the image to capture.
 * @param  {Number}   imageHeight The height of the image to capture.
 * @return {{
 *         pngBuffer: {Buffer},
 *         brightness: {Number}
 * }}
 */
function getPNGCapturePromise(imageWidth, imageHeight) {
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

          // Resolve with the image and the calculated brightness.
          resolve({
            pngBuffer,
            brightness
          });
        });
      });
    });
  });
};

function getAverageBrightness(rgbBitmap) {
  let greyscaleValue = 0;

  for(var x=0; x < rgbBitmap.width; x++) {
    for(var y=0; y < rgbBitmap.height; y++) {
      var rgb = rgbBitmap.getPixelRGBA(x,y);
      greyscaleValue += (((0xFF000000 & rgb) >>> 24) + ((0xFF0000 & rgb) >>> 16) + ((0xFF00 & rgb) >>> 8)) / 3;
    }
  }

  return greyscaleValue / (rgbBitmap.width * rgbBitmap.height);
}

// The public module exports~
module.exports = {
  getMSUntilNext,
  startPNGCaptureRoutine,
  getPNGCapturePromise,
  getAverageBrightness
};
