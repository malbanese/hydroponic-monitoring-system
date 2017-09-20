var fs = require('fs');
var spawn = require('child_process').spawn;

/**
 * Takes a raw RGB format picture, and returns it in a promise.
 * @param  {Number} width  The width of the picture.
 * @param  {Number} height The height of the picture.
 * @return {Promise}        A promise that resolves with the RGB pixel data.
 */
exports.takeRGBPicture = function(width, height) {
  return new Promise((resolve, reject) => {
    var cmd = `raspistill --raw -w ${width} -h ${height} -o -`;
    var buffer = [];

    var raspiProcess = spawn('raspiyuv', ['-rgb', '-w', width, '-h', height, '-o', '-']);

    raspiProcess.stdout.on('data', (data) => {
      buffer.push(data);
    });

    raspiProcess.stdout.on('end', () => {
      resolve(Buffer.concat(buffer));
    });

    raspiProcess.stdout.on('error', (error) => {
      reject(error);
    });
  });
};
