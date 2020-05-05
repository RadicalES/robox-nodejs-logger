/* (C) 2020 Radical Electronic Systems CC */
const {transports, createLogger, format} = require('winston');
const { combine, timestamp, label, printf } = format;
const moment = require('moment-timezone');

const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp}: ${message}`;
  });

const appendTimestamp = format((info) => {
    info.timestamp = moment().tz('Africa/Johannesburg').format('YYYY-MM-DD hh:mm:ss');
    return info;
  });

const prefixFilename = moment().tz('Africa/Johannesburg').format('YYYY-MM-DD-hh-mm-ss');
const eventFilename = `logs/${prefixFilename}-events.log`;
const errorFilename = `logs/${prefixFilename}-errors.log`;
const warnFilename = `logs/${prefixFilename}-warns.log`;

const filter = (level) => {
  return format((info) => {
    if (info.level === level) {
      return info;
    }
  })();
}

const logger = createLogger({
    format: combine(
        appendTimestamp(),
        myFormat
    ),
    transports: [
        new transports.Console(),
        new transports.File({filename: errorFilename, level: 'error', format: filter('error')}),
        new transports.File({filename: eventFilename, level: 'info', format: filter('info')}),
        new transports.File({filename: warnFilename, level:'warn', format: filter('warn')}),
    ]
  });

module.exports = logger;