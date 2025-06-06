"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logLarge = exports.log = exports.getJwt = void 0;
const luxon_1 = require("luxon");
// import { DebugMsgType } from "./types";
const DBL = 0;
const dp = "utils";
const getJwt = () => {
    const lm = dp + ".getJwt: ";
    (0, exports.log)(1, DBL, lm + "Getting JWT");
    // const jwtSecret: string | undefined =
    //   process.env.NODE_ENV === "production"
    //     ? process.env.jwtSecret
    //     : config.get("jwtSecret");
    const jwtSecret = process.env.JWT_SECRET;
    return jwtSecret !== null && jwtSecret !== void 0 ? jwtSecret : "Secret";
};
exports.getJwt = getJwt;
const log = (lvl, dbl, msg, data) => {
    const includeTime = true;
    let dbgLevel = dbl !== null && dbl !== void 0 ? dbl : 0;
    let dtStamp = luxon_1.DateTime.now().toFormat("yyyy-LL-dd hh:mm:ss.SSS");
    msg = includeTime ? dtStamp + ": " + msg : msg;
    if (dbgLevel >= lvl) {
        console.log(msg);
        if (data)
            console.log(data);
    }
};
exports.log = log;
const logLarge = (lvl, dbl, msg, data) => {
    let dbgLevel = dbl === null || dbl === undefined ? 0 : dbl;
    if (dbgLevel >= lvl) {
        if (msg)
            console.log(msg);
        if (data)
            console.log(data);
    }
};
exports.logLarge = logLarge;
