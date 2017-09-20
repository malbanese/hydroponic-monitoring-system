var RGBImage = require('./src/image/RaspiRGBImage');
var Overlay = require('./src/image/Overlay').Overlay;
var RGBBuffer = require('./src/image/RGBBuffer');

var overlay = new Overlay();
var imageWidth = 1280;
var imageHeight = 720;

Promise.all([
  RGBImage.takeRGBPicture(imageWidth, imageHeight),
  overlay.loadResources()
]).then((results) => {
  var rgbBuffer = results[0];
  var rgbBitmap = RGBBuffer.getBitmapFromBuffer(rgbBuffer, imageWidth, imageHeight);

  overlay.drawOverlay(rgbBitmap);
  RGBBuffer.writeBitmapToFile(rgbBitmap, 'out.png');
});
