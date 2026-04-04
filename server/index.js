require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const serviceRoutes = require("./routes/services");
const adminRoutes = require("./routes/admin");
const integrationRoutes = require("./routes/integrations");
const User = require("./models/User");
const Service = require("./models/Service");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Express Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/integrations", integrationRoutes);

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("FATAL ERROR: MONGODB_URI is not defined in .env file.");
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB successfully!");
    
    // Seed initial admin user if not exists
    const adminExists = await User.findOne({ email: 'admin@smsonline.com' });
    if (!adminExists) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        const adminUser = new User({
            displayName: "Super Admin",
            email: "admin@smsonline.com",
            phone: "+10000000000",
            password: hashedPassword,
            role: "admin",
            balance: 99999
        });
        await adminUser.save();
        console.log("Default Admin Account Created -> Email: admin@smsonline.com | Password: admin123");
    }
    // Seed services if not exists
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      const defaultServices = [
        { name: "Zara", code: "bqp", price: "1,320" },
        { name: "Binance", code: "aon", price: "3,000" },
        { name: "OKX", code: "aor", price: "3,000" },
        { name: "Geekay", code: "aow", price: "2,280" },
        { name: "SNKRDUNK", code: "bai", price: "2,160" },
        { name: "eToro", code: "apb", price: "2,280" },
        { name: "Redbubble", code: "baq", price: "360" },
        { name: "Factory", code: "cct", price: "1,680" },
        { name: "RedBook", code: "qf", price: "240" },
        { name: "LeoList", code: "bav", price: "2,160" },
        { name: "Damai", code: "apg", price: "1,680" },
        { name: "Indeed", code: "brk", price: "1,440" },
        { name: "Sideline", code: "apl", price: "600" },
        { name: "Moneylion", code: "qo", price: "2,040" },
        { name: "ClassPass", code: "app", price: "2,280" },
        { name: "SwitchUp", code: "bba", price: "1,800" },
        { name: "Tencent QQ", code: "qq", price: "240" },
        { name: "DoorDash", code: "ac", price: "360" },
        { name: "Capital One", code: "apr", price: "2,280" },
        { name: "LemFi", code: "brr", price: "1,440" },
        { name: "Badoo", code: "qv", price: "600" },
        { name: "Square", code: "bbg", price: "2,160" },
        { name: "EscapeFromTarkov", code: "ah", price: "240" },
        { name: "WorldRemit", code: "qx", price: "1,224" },
        { name: "OnePay", code: "bbj", price: "1,200" },
        { name: "Amazon", code: "am", price: "288" },
        { name: "Autodesk", code: "bbl", price: "1,272" },
        { name: "Chime", code: "bbq", price: "360" },
        { name: "Skype", code: "rc", price: "720" },
        { name: "WalletHub", code: "bbr", price: "2,160" },
        { name: "Coinbase", code: "re", price: "936" },
        { name: "InternationalCupid", code: "bbu", price: "1,272" },
        { name: "inDriver", code: "rl", price: "2,160" },
        { name: "Wolt", code: "rr", price: "96" },
        { name: "hily", code: "rt", price: "720" },
        { name: "Skrill", code: "aqt", price: "120" },
        { name: "McDonalds", code: "ry", price: "600" },
        { name: "Air Miles", code: "bsy", price: "1,680" },
        { name: "BIGO LIVE", code: "bl", price: "192" },
        { name: "Wise", code: "bo", price: "2,880" },
      ];
      await Service.insertMany(defaultServices);
      console.log(`Seeded ${defaultServices.length} default services`);
    }  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Basic Route
app.get("/", (req, res) => {
  res.send("SMSOnline Backend API is running...");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
