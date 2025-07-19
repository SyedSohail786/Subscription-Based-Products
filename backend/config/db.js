const mongoose = require("mongoose");
const Admin = require("../models/Admin");


const createDefaultAdmin = async ()=>{
  const alreadyAdmin = await Admin.findOne({email:"admin@email.com"})
  if(alreadyAdmin) return console.log("Default Admin Exist✅");
  const admin = new Admin({
    email: "admin@email.com",
    password: "admin@123",
    role: "admin",
    });
    admin.save();
    return console.log("Default Admin Created✅");
}
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    createDefaultAdmin()
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
