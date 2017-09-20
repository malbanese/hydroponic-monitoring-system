var PImage = require('pureimage');
var fs = require('fs');
var streamBuffers = require('stream-buffers');


/**
 * Generates a filled RGB buffer provided color and dimensions.
 * @param  {Number} w Width
 * @param  {Number} h Height
 * @param  {Number} r Red
 * @param  {Number} g Green
 * @param  {Number} b Blue
 * @return {Buffer} Buffer filled with the provided parameters.
 */
exports.getFilledBuffer = function(w, h, r, g, b) {
  const length = Math.floor(w * h * 3);
  var rgbBuffer = Buffer.alloc(length);

  for(var i=0; i < length; i++) {
    let index = i * 3;
    rgbBuffer[index] = r;      // Red
    rgbBuffer[index + 1] = g;  // Green
    rgbBuffer[index + 2] = b;  // Blue
  }

  return rgbBuffer;
}

/**
 * Converts a Buffer into a Bitmap instance.
 * @param  {Buffer} rgbBuffer Buffer filled with RGB data.
 * @param  {Number} width     The width of the image represented by the buffer.
 * @param  {Number} height    The height of the image represented by the buffer.
 * @return {Bitmap}           The Bitmap represented by the buffer.
 */
exports.getBitmapFromBuffer = function(rgbBuffer, width, height) {
  var image = PImage.make(width, height);

  for(var y=0; y<height; y++) {
      for (var x=0; x < width; x++) {
          let index = (x + width*y) * 3;
          image.setPixelRGBA_i(x, y, rgbBuffer[index], rgbBuffer[index+1], rgbBuffer[index+2], 0xFF);
      }
  }

  return image;
}

/**
 * Writes the provided Bitmap to a file as a PNG encoded image.
 * @param  {Bitmap} bitmap   The bitmap.
 * @param  {String} filename The filepath to save the image at.
 * @return {Promise}          Promise that returns when the image has been saved.
 */
exports.writeBitmapToFile = function(bitmap, filename) {
  return new Promise((resolve, reject) => {
    fs.unlink(filename, () => {
      var outstream = fs.createWriteStream(filename, {'flags': 'a'});
      return PImage.encodePNGToStream(bitmap, outstream).then(() => {
        resolve();
      });
    });
  });
};

/**
 * Converts a Bitmap into a PNG image, and writes the data to a buffer.
 * @param  {Bitmap} bitmap [description]
 * @return {[type]}        [description]
 */
exports.writeBitmapToPNGBuffer = function(bitmap) {
  var writeStream = new streamBuffers.WritableStreamBuffer({
      initialSize: (100 * 1024),   // start at 100 kilobytes.
      incrementAmount: (10 * 1024) // grow by 10 kilobytes each time buffer overflows.
  });

  // Write the png into the stream
  return new Promise((resolve, reject) => {
    PImage.encodePNGToStream(bitmap, writeStream).then(() => {
      resolve( writeStream.getContents() );
    });
  });
};
