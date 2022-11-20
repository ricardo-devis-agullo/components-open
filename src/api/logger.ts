import { green, red, yellow } from 'std/fmt/colors.ts';

const colors = { green, red, yellow };
type Color = keyof typeof colors;

const log = (msg: string, color: Color | null) => {
  console.log(color ? colors[color](msg) : msg);
};

export interface Logger {
  err: (msg: string) => void;
  log: (msg: string) => void;
  ok: (msg: string) => void;
  warn: (msg: string) => void;
}

export const logger: Logger = {
  err: (msg: string) => log(msg, 'red'),
  log: (msg: string) => log(msg, null),
  ok: (msg: string) => log(msg, 'green'),
  warn: (msg: string) => log(msg, 'yellow'),
};
