const mongoose = require("mongoose");
const Admin = require("../models/Admin");

const createDefaultAdmin = async () => {
  try {
    const email = "admin@email.com";
    const password = "admin@123";

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log("✅ Default admin already exists");
      return;
    }

    const admin = new Admin({
      email,
      password,
      role: "admin",
    });

    await admin.save();
    console.log("✅ Default admin created");
  } catch (err) {
    console.error("❌ Failed to create default admin:", err.message);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    await createDefaultAdmin();
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
