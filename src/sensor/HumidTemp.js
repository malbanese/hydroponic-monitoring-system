var sensor = require('node-dht-sensor');

/**
 * Reads pin 4 of the raspberry PI to obtain temperature and humidity information.
 * @return {Promise} A promise that will resolve with the results. In the
 * case where there was an error reading, will return a zero filled object,
 * with an additional error field.
 * { temperature: Number,
 *   humidity: Number,
 *   error: Error|undefined }
 */
exports.getHumidityTemperature = function() {
    return new Promise( (resolve, reject) => {
      sensor.read(22, 4, (err, temperature, humidity) => {
          if(err) {
            console.log("Error reading HT sensor.");
            console.log(err);

            return resolve({
              temperature: 0,
              humidity: 0,
              error: err});
            }

          resolve({
            temperature: temperature * 1.8 + 32,
            humidity: humidity});
          });
    });
}
