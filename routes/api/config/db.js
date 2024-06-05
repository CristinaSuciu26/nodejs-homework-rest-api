import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      "mongodb+srv://csuciu:-egfKnQF2FfA!9P@cluster0.5bk1fud.mongodb.net/db-contacts",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log("MongoDB connection state:", mongoose.connection.readyState);
    console.log("MongoDB connected:", conn.connection.host);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export default connectDB;
