import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function timestamp() {
  return new Date().toISOString().replace('T', ' ').slice(0, 23);
}

function dailyFile() {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return path.join(LOG_DIR, `${date}.log`);
}

function write(level, message, data) {
  ensureLogDir();

  const header = `[${timestamp()}] [${level}] ${message}`;
  const extra = data ? '\n' + JSON.stringify(data, null, 2) : '';
  const entry = header + extra + '\n\n';

  // Always write to daily log
  fs.appendFileSync(dailyFile(), entry, 'utf8');

  // Errors also go to a persistent errors.log
  if (level === 'ERROR') {
    fs.appendFileSync(path.join(LOG_DIR, 'errors.log'), entry, 'utf8');
  }
}

const logger = {
  info(message, data) {
    console.log(`[INFO] ${message}`, data ?? '');
    write('INFO', message, data);
  },

  warn(message, data) {
    console.warn(`[WARN] ${message}`, data ?? '');
    write('WARN', message, data);
  },

  error(message, errOrData) {
    const isError = errOrData instanceof Error;
    const data = isError
      ? { message: errOrData.message, stack: errOrData.stack }
      : errOrData;
    console.error(`[ERROR] ${message}`, data ?? '');
    write('ERROR', message, data);
  },
};

export default logger;
