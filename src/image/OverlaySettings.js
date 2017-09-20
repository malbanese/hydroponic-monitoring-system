/**
 * Simple settings class designed to work with the primary Overlay class.
 * Provides different measurements and image links in a configurable way.
 */
class OverlaySettings {
  constructor() {
    /**
     * The path to the humidity icon image.
     * @type {String}
     */
    this.HUMIDITY_IMAGE_PATH = './res/icon-humidity.png';

    /**
     * The path to the temperature icon image.
     * @type {String}
     */
    this.TEMPERATURE_IMAGE_PATH = './res/icon-temperature.png';

    /**
     * The path to the water level icon image.
     * @type {String}
     */
    this.WATER_LEVEL_IMAGE_PATH = './res/icon-water-level.png';

    /**
     * The path to the status font.
     * @type {String}
     */
    this.STATUS_FONT_PATH = './res/OpenSans.ttf';

    /**
     * The identifiable name of the status font.
     * @type {String}
     */
    this.STATUS_FONT_NAME = 'Open Sans';

    /**
     * The amount of Y spacing between each icon.
     * @type {Number}
     */
    this.ICON_Y_SPACING = 75;

    /**
     * The X offset of each icon.
     * @type {Number}
     */
    this.ICON_IMAGE_X_OFFSET = 50;

    /**
     * The X offset of the text.
     * @type {Number}
     */
    this.ICON_TEXT_X_OFFSET = 100;

    /**
     * The starting Y position of the icons.
     * @type {Number}
     */
    this.ICON_IMAGE_Y_START = 65;

    /**
     * The starting Y position of the text.
     * @type {Number}
     */
    this.ICON_TEXT_Y_START = 95;

    /**
     * The X offset of the status text.
     * @type {Number}
     */
    this.STATUS_TEXT_X_OFFSET = 30;

    /**
     * The Y offset of the status text.
     * @type {Number}
     */
    this.STATUS_TEXT_Y_OFFSET = 30;
  }
}

exports.OverlaySettings = OverlaySettings;
