import { getJwt } from "../utils";
import jwt from "jsonwebtoken";

// const config = require("config");

export default (req: any, res: any, next: any) => {
  // Get token from header
  const token = req.header("x-auth-token");
  console.log("Starting authorisation check");

  // Check if not token
  if (!token) {
    console.log("No token, authorisation denied");
    return res.status(401).json({ msg: "No token, authorisation denied" });
  }

  try {
    const secret = getJwt();

    // Read payload into json is verified (payload is just user)
    const decoded = jwt.verify(token, secret);

    // Add the decoded user to the req header
    req.user = {};
    if (typeof decoded !== "string") {
      console.log("Authorised user");
      req.user = decoded.user;
    } else {
      console.log("Not authorised user");
    }
    console.log("Finished authorisation check");
    next();
  } catch (err) {
    console.log("Token is not valie");
    res.status(401).json({ msg: "Token is not valid" });
  }
};
