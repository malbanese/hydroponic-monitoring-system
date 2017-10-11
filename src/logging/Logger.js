const winston = require('winston');
require('winston-daily-rotate-file');

// Create the rotating transport
var transport = new (winston.transports.DailyRotateFile)({
  filename: './log',
  datePattern: 'yyyy-MM-dd.',
  prepend: true,
  level: process.env.ENV === 'development' ? 'debug' : 'info'
});

// Create the logger
var logger = new (winston.Logger)({
  transports: [
    transport,
    winston.transports.Console
  ]
});

// Export the logger for use
module.exports = logger;
