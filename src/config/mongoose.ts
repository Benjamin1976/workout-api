import { connect, set } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

// connection to db
export const connectToDB = async () => {
  try {
    set("strictQuery", false);
    if (!MONGODB_URI) throw new Error("Missing connection string");
    const db = await connect(MONGODB_URI);
    console.log("MongoDB connected to", db.connection.name);
    // Emit an event when the connection is successful
  } catch (error) {
    console.error(error);
    // Emit an event when there's an error
  }
};
