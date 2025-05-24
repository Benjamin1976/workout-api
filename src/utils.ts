import { DateTime } from "luxon";

// import { DebugMsgType } from "./types";

const DBL = 0;
const dp = "utils";

export type DebugMsgType = {
  msg: string;
  level: number;
  data?: string;
  DBL?: number;
};

export const getJwt = (): string => {
  const lm = dp + ".getJwt: ";
  log(1, DBL, lm + "Getting JWT");
  // const jwtSecret: string | undefined =
  //   process.env.NODE_ENV === "production"
  //     ? process.env.jwtSecret
  //     : config.get("jwtSecret");
  const jwtSecret: string | undefined = process.env.JWT_SECRET;
  return jwtSecret ?? "Secret";
};

export const log = (lvl: number, dbl: number, msg: string, data?: string) => {
  const includeTime = true;
  let dbgLevel = dbl ?? 0;
  let dtStamp = DateTime.now().toFormat("yyyy-LL-dd hh:mm:ss.SSS");
  msg = includeTime ? dtStamp + ": " + msg : msg;
  if (dbgLevel >= lvl) {
    console.log(msg);
    if (data) console.log(data);
  }
};

export const logLarge = (
  lvl: number,
  dbl: number,
  msg: string,
  data: string
) => {
  let dbgLevel = dbl === null || dbl === undefined ? 0 : dbl;
  if (dbgLevel >= lvl) {
    if (msg) console.log(msg);
    if (data) console.log(data);
  }
};
