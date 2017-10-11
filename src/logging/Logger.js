const winston = require('winston');
require('winston-daily-rotate-file');

// Add fun colors for logging.
winston.addColors({
  silly: 'magenta',
  debug: 'blue',
  verbose: 'cyan',
  info: 'green',
  warn: 'yellow',
  error: 'red'
});

// Modify the console pretty printing.
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
  level: process.env.ENV === 'development' ? 'debug' : 'info',
  prettyPrint: true,
  colorize: true,
  silent: false,
  timestamp: false
});

// Create the rotating transport
var transport = new (winston.transports.DailyRotateFile)({
  level: process.env.ENV === 'development' ? 'debug' : 'info',
  filename: './log/log',
  datePattern: 'yyyy-MM-dd.',
  prepend: true,
  timestamp: true
});

// Create the logger
var logger = new (winston.Logger)({
  transports: [
    transport,
    new winston.transports.Console()
  ]
});

// Export the logger for use
module.exports = logger;
