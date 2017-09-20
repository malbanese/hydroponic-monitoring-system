const PImage = require('pureimage');
const fs = require('fs');
const RGBBuffer = require('./RGBBuffer');
const dateFormat = require('dateformat');
const settings = new (require('./OverlaySettings').OverlaySettings)();

/**
 * Overlay class that processes a raw bitmap by drawing related data on top of
 * it, and outputs it in the bitmap format.
 */
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
    // If the resources have already been loaded, we can skip this.
    if(this.resourcesLoaded) {
      return true;
    }

    // Load in the humidity image.
    var humidityPromise = PImage.decodePNGFromStream( fs.createReadStream(settings.HUMIDITY_IMAGE_PATH) )
      .then((bitmap) => {
        this.iconHumidity = bitmap;
      });

    // Load in the temperature image.
    var temperaturePromise = PImage.decodePNGFromStream( fs.createReadStream(settings.TEMPERATURE_IMAGE_PATH) )
      .then((bitmap) => {
        this.iconTemperature = bitmap;
      });

    // Load in the water level image.
    var waterLevelPromise = PImage.decodePNGFromStream( fs.createReadStream(settings.WATER_LEVEL_IMAGE_PATH) )
      .then((bitmap) => {
        this.iconWaterLevel = bitmap;
      });

    // Load in the font.
    var fontPromise = new Promise((resolve, reject) => {
      PImage.registerFont(settings.STATUS_FONT_PATH, settings.STATUS_FONT_NAME).load(() => {
        resolve();
      });
    });

    // Resolve all promises.
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

    // Iterate the pixels of the image bitmap, so that we can draw an alpha
    // blended icon into the target canvas.
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

  /**
   * Draws an anchored icon bitmap, in the specified target bitmap, using a y position.
   * @param  {Bitmap} targetBitmap The target bitmap to draw the icon into.
   * @param  {Bitmap} imageBitmap  The image to draw to the target.
   * @param  {Number} yAnchor      The Y position to draw the icon at.
   */
  function drawAnchoredIcon(targetBitmap, imageBitmap, yAnchor) {
    // Center Image
    let x = settings.ICON_IMAGE_X_OFFSET - imageBitmap.width / 2;

    let y = yAnchor;
    this.overlayImage(targetBitmap, imageBitmap, x, y);
  }

  /**
   * Draws the overlay onto the provided bitmap, using the temperature and
   * humidity values.
   * @param  {Bitmap} bitmap      The bitmap to draw to.
   * @param  {Number} temperature The temperature value to draw.
   * @param  {Number} humidity    The humidity value to draw.
   */
  drawOverlay(bitmap, temperature, humidity) {
    // Get canvas instance.
    var ctx = bitmap.getContext('2d');

    // Get formatted date string.
    let dateString = dateFormat(new Date(), 'dddd, mmmm dS, yyyy, h:MM:ss TT')

    // Keep track of the current icon drawing positions.
    let iconImageY = settings.ICON_IMAGE_Y_START;
    let iconTextY = settings.ICON_TEXT_Y_START;

    // Set up the font styling
    ctx.font = `24pt ${settings.STATUS_FONT_NAME}`;
    ctx.fillStyle = '#FFFFFF';

    // Draw the date timestamp
    ctx.fillText(dateString, settings.STATUS_TEXT_X_OFFSET, settings.STATUS_TEXT_Y_OFFSET);

    // Draw the temperature
    this.drawAnchoredIcon(bitmap, this.iconTemperature, iconImageY);
    ctx.fillText(temperature.toFixed(2) + '°', settings.ICON_TEXT_X_OFFSET, iconTextY);

    // Draw the humidity
    this.drawAnchoredIcon(bitmap, this.iconHumidity, (iconImageY += settings.ICON_Y_SPACING));
    ctx.fillText(humidity.toFixed(2) + '%', settings.ICON_TEXT_X_OFFSET, (iconTextY += settings.ICON_Y_SPACING));

    // Draw the water level
    // this.drawAnchoredIcon(bitmap, this.iconWaterLevel, (iconImageY += settings.ICON_Y_SPACING));
    // ctx.fillText("N/A", settings.ICON_TEXT_X_OFFSET, (iconTextY += settings.ICON_Y_SPACING));
  };
}

exports.Overlay = Overlay;
