const mongoose = require('mongoose');

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error('MONGO_URI is not defined in .env');
    process.exit(1);
  }

  let retries = 5;
  while (retries) {
    try {
      await mongoose.connect(MONGO_URI);
      console.log(`MongoDB connected: ${mongoose.connection.host}`);
      return;
    } catch (err) {
      retries -= 1;
      console.error(`MongoDB connection failed. Retries left: ${retries}. Error: ${err.message}`);
      if (!retries) {
        process.exit(1);
      }
      await new Promise((res) => setTimeout(res, 3000));
    }
  }
};

module.exports = connectDB;
