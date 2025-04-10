import mongoose from "mongoose";

const connectdb = async () => {
  try {
    const connect = await mongoose.connect(`${process.env.MONGO_URI}`, {
      dbName: "fixmyride",
    });

    console.log("mogodb is connected");
  } catch (error) {
    console.log("error while connectiong with mongodb", error);
    process.exit(1); // Exit the process with failure
  }
};

export default connectdb;