var sensor = require('node-dht-sensor');

exports.getHumidityTemperature = function() {
    return new Promise( (resolve, reject) => {
      sensor.read(22, 4, (err, temperature, humidity) => {
          if(err) {
            console.log("Error reading HT sensor.");
            console.log(err);

            return resolve({
              temperature: 0,
              humidity: 0});
          }

          resolve({
            temperature: temperature * 1.8 + 32,
            humidity: humidity});
          });
    });
}
