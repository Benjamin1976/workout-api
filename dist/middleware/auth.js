"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// const config = require("config");
exports.default = (req, res, next) => {
    // Get token from header
    const token = req.header("x-auth-token");
    console.log("Starting authorisation check");
    // Check if not token
    if (!token) {
        console.log("No token, authorisation denied");
        return res.status(401).json({ msg: "No token, authorisation denied" });
    }
    try {
        const secret = (0, utils_1.getJwt)();
        // Read payload into json is verified (payload is just user)
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        // Add the decoded user to the req header
        req.user = {};
        if (typeof decoded !== "string") {
            console.log("Authorised user");
            req.user = decoded.user;
        }
        else {
            console.log("Not authorised user");
        }
        console.log("Finished authorisation check");
        next();
    }
    catch (err) {
        console.log("Token is not valie");
        res.status(401).json({ msg: "Token is not valid" });
    }
};
