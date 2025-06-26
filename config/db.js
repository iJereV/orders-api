import mongoose from "mongoose";

export const conectDB = async () => {
  try {
    console.log(process.env.DB_URL)
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.log(error)
    process.exit(1); // mata la app si no conecta
  }
};