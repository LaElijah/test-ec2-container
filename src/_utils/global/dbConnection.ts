import mongoose from "mongoose";
import dotenv from "dotenv"
dotenv.config()


const MONGODB_URI = process.env.MONGODB_URI || "";
let newGlobal: {[key: string | number | symbol]: any} = global;
let cached = newGlobal.mongoose;

if (!cached) {
  cached = newGlobal.mongoose = { conn: null, promise: null };
}

async function dbConnection() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // const opts = {
    //   useNewUrlParser: true
    // };

    cached.promise = mongoose.connect(MONGODB_URI, {}).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnection;
