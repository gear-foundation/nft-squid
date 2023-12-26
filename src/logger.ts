import { createLogger, format, transports } from 'winston';

const TIMESTAMP_FORMAT = 'YY-MM-DD HH:mm:ss';

const LOG_LEVEL = process.env.NODE_ENV === 'dev' ? 'debug' : 'info';

export const logger = createLogger({
  format: format.combine(
    format.timestamp({ format: TIMESTAMP_FORMAT }),
    format.printf(({ level, message, timestamp, ...meta }) => {
      const msg = { message, ...meta };

      return JSON.stringify({ ts: timestamp.toString(), level, ...msg });
    }),
  ),
  transports: [new transports.Console()],
  level: LOG_LEVEL,
});
