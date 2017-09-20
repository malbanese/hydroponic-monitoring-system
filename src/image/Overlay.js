var PImage = require('pureimage');
var fs = require('fs');
var RGBBuffer = require('./RGBBuffer');
const dateFormat = require('dateformat');

const HUMIDITY_IMAGE_PATH = './res/icon-humidity.png';
const TEMPERATURE_IMAGE_PATH = './res/icon-temperature.png';
const WATER_LEVEL_IMAGE_PATH = './res/icon-water-level.png';

const STATUS_FONT_PATH = './res/OpenSans.ttf';
const STATUS_FONT_NAME = 'Open Sans';

const ICON_Y_SPACING = 75;
const ICON_IMAGE_X_OFFSET = 50;
const ICON_TEXT_X_OFFSET = 100;

const ICON_IMAGE_Y_START = 65;
const ICON_TEXT_Y_START = 95;

const STATUS_TEXT_X_OFFSET = 30;
const STATUS_TEXT_Y_OFFSET = 30;

class Overlay {
  constructor() {
    /**
     * Humidity icon bitmap.
     * @type {Bitmap}
     */
    this.iconHumidity = null;

    /**
     * Temperature icon bitmap.
     * @type {Bitmap}
     */
    this.iconTemperature = null;

    /**
     * Water level icon bitmap.
     * @type {Bitmap}
     */
    this.iconWaterLevel = null;

    /**
     * Keeps track of whether the resources have been loaded or not.
     * @type {Boolean}
     */
    this.resourcesLoaded = false;
  }

  /**
   * Loads all necessary filesystem resources for drawing the overlay.
   * @return {Promise} Promise that resolves when all resouces have been loaded.
   */
  loadResources() {
    if(this.resourcesLoaded) {
      return true;
    }

    var humidityPromise = PImage.decodePNGFromStream( fs.createReadStream(HUMIDITY_IMAGE_PATH) )
      .then((bitmap) => {
        this.iconHumidity = bitmap;
      });

    var temperaturePromise = PImage.decodePNGFromStream( fs.createReadStream(TEMPERATURE_IMAGE_PATH) )
      .then((bitmap) => {
        this.iconTemperature = bitmap;
      });

    var waterLevelPromise = PImage.decodePNGFromStream( fs.createReadStream(WATER_LEVEL_IMAGE_PATH) )
      .then((bitmap) => {
        this.iconWaterLevel = bitmap;
      });

    var fontPromise = new Promise((resolve, reject) => {
      PImage.registerFont(STATUS_FONT_PATH, STATUS_FONT_NAME).load(() => {
        resolve();
      });
    });

    return Promise.all([humidityPromise, temperaturePromise, waterLevelPromise, fontPromise]).then(() => {
      this.resourcesLoaded = true;
    });
  };


  /**
   * Overlays one bitmap onto another, blending by alpha.
   * @param  {Bitmap} targetBitmap The bitmap to draw onto.
   * @param  {Bitmap} imageBitmap  The bitmap to draw on top of the target.
   * @param  {Number} left         The x coordinate to draw to.
   * @param  {Number} top          The y coordinate to draw to.
   */
  overlayImage(targetBitmap, imageBitmap, left, top) {
    let targetData = targetBitmap.data;
    let imageData = imageBitmap.data;

    for(var x=0; x < imageBitmap.width; x++) {
      for(var y=0; y < imageBitmap.height; y++) {
        let targetIndex = targetBitmap.calculateIndex(left + x, top + y);
        let imageIndex = imageBitmap.calculateIndex(x, y);
        let imageAlpha = imageBitmap.data[imageIndex + 3] / 0xFF;

        // Blend the colors by using a simple blending formula
        // targetColor = (imageColor * imageAlpha) + (targetColor * (1 - imageAlpha))
        targetData[targetIndex] = (imageData[imageIndex] * imageAlpha) + (targetData[targetIndex] * (1 - imageAlpha));
        targetData[targetIndex+1] = (imageData[imageIndex+1] * imageAlpha) + (targetData[targetIndex+1] * (1 - imageAlpha));
        targetData[targetIndex+2] = (imageData[imageIndex+2] * imageAlpha) + (targetData[targetIndex+2] * (1 - imageAlpha));
      }
    }
  }

  drawAnchoredIcon(targetBitmap, imageBitmap, yAnchor) {
    // Center Image
    let x = ICON_IMAGE_X_OFFSET - imageBitmap.width / 2;

    let y = yAnchor;
    this.overlayImage(targetBitmap, imageBitmap, x, y);
  }

  drawOverlay(bitmap, temperature, humidity) {
    var ctx = bitmap.getContext('2d');
    let date = new Date();
    let dateString = dateFormat(new Date(), 'dddd, mmmm dS, yyyy, h:MM:ss TT')

    let iconImageY = ICON_IMAGE_Y_START;
    let iconTextY = ICON_TEXT_Y_START;

    // Set up the font styling
    ctx.font = `24pt ${STATUS_FONT_NAME}`;
    ctx.fillStyle = '#FFFFFF';

    // Draw the date timestamp
    ctx.fillText(dateString, STATUS_TEXT_X_OFFSET, STATUS_TEXT_Y_OFFSET);

    // Draw the temperature
    this.drawAnchoredIcon(bitmap, this.iconTemperature, iconImageY);
    ctx.fillText(temperature.toFixed(2) + '°', ICON_TEXT_X_OFFSET, iconTextY);

    // Draw the humidity
    this.drawAnchoredIcon(bitmap, this.iconHumidity, (iconImageY += ICON_Y_SPACING));
    ctx.fillText(humidity.toFixed(2) + '%', ICON_TEXT_X_OFFSET, (iconTextY += ICON_Y_SPACING));

    // Draw the water level
    // this.drawAnchoredIcon(bitmap, this.iconWaterLevel, (iconImageY += ICON_Y_SPACING));
    // ctx.fillText("N/A", ICON_TEXT_X_OFFSET, (iconTextY += ICON_Y_SPACING));
  };
}

exports.Overlay = Overlay;
