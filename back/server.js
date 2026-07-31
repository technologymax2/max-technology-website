const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();
app.use(express.json());

// የ CORS አደረጃጀት
app.use(
  cors({
    origin: "*",
    methods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// MongoDB የግንኙነት መስመር
const MONGO_URI = process.env.MONGO_URI;
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB በስኬት ተገናኝቷል!");
    seedFirstAdmin();
  })
  .catch((err) => console.error("❌ የዳታቤዝ ግንኙነት ስህተት:", err));

// ==========================================
// 1. የዳታቤዝ ሞዴሎች (SCHEMAS & MODELS)
// ==========================================

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "normal" }, // 'normal', 'admin', 'hr'
  isBlocked: { type: Boolean, default: false },
});
const User = mongoose.model("User", userSchema);

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  reply: { type: String, default: "" },
  status: { type: String, default: "በጥበቃ ላይ" },
  date: { type: Date, default: Date.now },
});
const Contact = mongoose.model("Contact", contactSchema);

const employeeSchema = new mongoose.Schema({
  fullName: { type: String, default: "" },
  age: { type: String, default: "" },
  faydaNumber: { type: String, required: true, unique: true },
  dateOfIssue: { type: String, default: "" },
  expireDate: { type: String, default: "" },
  address: { type: String, default: "" },
  zone: { type: String, default: "" },
  city: { type: String, default: "" },
  nationality: { type: String, default: "" },
  phoneNumber: { type: String, default: "" },
  woreda: { type: String, default: "" },
  position: { type: String, default: "" },
  orgPhoneNumber: { type: String, default: "" },
  imageUrl: { type: String, default: "" },
  status: { type: String, default: "approved" },
  approved: { type: Boolean, default: true },
  date: { type: Date, default: Date.now },
});
const Employee = mongoose.model("Employee", employeeSchema);

const projectSchema = new mongoose.Schema({
  title: String,
  link: String,
  imageUrl: String,
  date: { type: Date, default: Date.now },
});
const Project = mongoose.model("Project", projectSchema);

// ==========================================
// 2. የመጀመሪያው አድሚን መፍጠሪያ (SEEDING)
// ==========================================
async function seedFirstAdmin() {
  try {
    const adminEmail = "mamaruanmaw@1925";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("mame192513", 10);
      const firstAdmin = new User({
        name: "Mamaru Anmaw (Main Admin)",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      });
      await firstAdmin.save();
      console.log("👑 የመጀመሪያው ዋና አድሚን በስኬት ዳታቤዝ ውስጥ ተፈጥሯል!");
    } else {
      // Forcefully update the main admin role to 'admin' if it somehow changed
      if (existingAdmin.role !== "admin") {
        existingAdmin.role = "admin";
        await existingAdmin.save();
      }
    }
  } catch (error) {
    console.error("ዋናውን አድሚን መፍጠር አልተቻለም:", error);
  }
}

// ==========================================
// 3. ፖርትፎሊዮ / ፕሮጀክት መስመሮች (PROJECT ROUTES)
// ==========================================
app.post("/api/admin/projects", async (req, res) => {
  try {
    const newProject = new Project(req.body);
    await newProject.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: "ፕሮጀክት መመዝገብ አልተቻለም" });
  }
});

app.get("/api/projects", async (req, res) => {
  try {
    const projects = await Project.find().sort({ date: -1 });
    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, error: "ፕሮጀክቶችን ማምጣት አልተቻለም" });
  }
});

app.delete("/api/admin/projects/:id", async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: "ፕሮጀክት ማጥፋት አልተቻለም" });
  }
});

// ==========================================
// 4. የደህንነት እና መግቢያ መስመሮች (AUTH ROUTES)
// ==========================================
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser)
      return res.status(400).json({ success: false, error: "ይህ ኢሜይል/ዩዘርኔም ቀድሞ ተመዝግቧል!" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email: cleanEmail,
      password: hashedPassword,
      role: "normal",
    });

    await newUser.save();
    res.status(201).json({ success: true, message: "ምዝገባው በስኬት ተጠናቋል!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "የምዝገባ ስህተት ተፈጥሯል" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    let user = await User.findOne({ email: cleanEmail });
    let role = "normal";

    if (user) {
      role = user.role; // Use user's actual database role ('admin', 'normal', etc.)
    } else {
      // Fallback to employee collection only if not found in User collection
      const employee = await Employee.findOne({ email: cleanEmail });
      if (employee) {
        user = employee;
        role = "hr";
      }
    }

    if (!user)
      return res.status(400).json({ success: false, error: "ኢሜይል/ዩዘርኔም ወይም ፓስወርድ ተሳስቷል!" });

    if (user.isBlocked) {
      return res.status(403).json({ success: false, error: "አካውንትዎ በአድሚን ታግዷል! እባክዎ ባለሙያ ያነጋግሩ።" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ success: false, error: "ኢሜይል/ዩዘርኔም ወይም ፓስወርድ ተሳስቷል!" });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name || user.fullName,
        email: user.email,
        role: role ? role.toLowerCase().trim() : "normal",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "የመግባት ስህተት ተፈጥሯል" });
  }
});

// ==========================================
// 5. የአድሚን መቆጣጠሪያ መስመሮች (ADMIN CONTROL ROUTES)
// ==========================================
app.post("/api/admin/add-admin", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser)
      return res.status(400).json({ success: false, error: "ይህ ኢሜይል/ዩዘርኔም ቀድሞ ተመዝግቧል!" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new User({
      name,
      email: cleanEmail,
      password: hashedPassword,
      role: "admin",
    });

    await newAdmin.save();
    res.status(201).json({ success: true, message: "አዲሱ አድሚን በስኬት ተመዝግቧል!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "አድሚን መፍጠር አልተቻለም" });
  }
});

app.get("/api/admin/list", async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).select("-password");
    res.status(200).json({ success: true, admins });
  } catch (error) {
    res.status(500).json({ success: false, error: "የአድሚኖችን ዝርዝር ማምጣት አልተቻለም" });
  }
});

app.put("/api/admin/update/:id", async (req, res) => {
  try {
    const { name, email } = req.body;
    await User.findByIdAndUpdate(req.params.id, {
      name,
      email: email ? email.toLowerCase().trim() : undefined,
    });
    res.status(200).json({ success: true, message: "የአድሚን መረጃ ተስተካክሏል!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "ማስተካከሉ አልተሳካም" });
  }
});

app.put("/api/admin/reset-password/:id", async (req, res) => {
  try {
    const { newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(req.params.id, { password: hashedPassword });
    res.status(200).json({ success: true, message: "የአድሚኑ ፓስወርድ በስኬት ተለውጧል!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "ፓስወርድ መቀየር አልተቻለም" });
  }
});

app.delete("/api/admin/delete/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "አድሚኑ በተሳካ ሁኔታ ተሰርዟል!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "አድሚኑን ማጥፋት አልተቻለም" });
  }
});

app.get("/api/admin/messages", async (req, res) => {
  try {
    const messages = await Contact.find().sort({ date: -1 });
    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, error: "መረጃዎችን ማምጣት አልተቻለም" });
  }
});

app.post("/api/admin/reply/:id", async (req, res) => {
  try {
    const { reply } = req.body;
    await Contact.findByIdAndUpdate(req.params.id, {
      reply: reply,
      status: "ምላሽ ተሰጥቷል",
    });
    res.status(200).json({ success: true, message: "ምላሽዎ በተሳካ ሁኔታ ተልኳል!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "ምላሽ መላክ አልተቻለም" });
  }
});

app.delete("/api/admin/messages/:id", async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "ማዘዣው ተሰርዟል!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "ማጥፋት አልተቻለም" });
  }
});

// ==========================================
// 6. የ HR / ሰራተኞች ማስተዳደሪያ መስመሮች
// ==========================================
app.post("/api/hr/employees", async (req, res) => {
  try {
    const { faydaNumber } = req.body;
    if (faydaNumber) {
      const existingEmployee = await Employee.findOne({ faydaNumber });
      if (existingEmployee) {
        return res.status(400).json({ success: false, error: "ይህ የፋይዳ ቁጥር ቀድሞ ተመዝግቧል!" });
      }
    }

    const newEmployee = new Employee(req.body);
    await newEmployee.save();
    res.status(201).json({ success: true, message: "ሰራተኛው በስኬት ተመዝግቧል!", employee: newEmployee });
  } catch (error) {
    res.status(500).json({ success: false, error: "ሰርቨር ላይ ስህተት ተፈጥሯል!" });
  }
});

app.get("/api/hr/employees", async (req, res) => {
  try {
    const employees = await Employee.find().sort({ date: -1 });
    res.status(200).json({ success: true, employees });
  } catch (error) {
    res.status(500).json({ success: false, error: "ሰራተኞቹን ማምጣት አልተቻለም" });
  }
});

app.put("/api/hr/employees/:id", async (req, res) => {
  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, message: "የሰራተኛው መረጃ ተስተካክሏል!", employee: updatedEmployee });
  } catch (error) {
    res.status(500).json({ success: false, error: "ማስተካከሉ አልተሳካም" });
  }
});

app.delete("/api/hr/employees/:id", async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "ሰራተኛው ተሰርዟል!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "ሰራተኛውን ማጥፋት አልተቻለም" });
  }
});

// ==========================================
// 7. የተጠቃሚዎች እና ትዕዛዝ መስመሮች
// ==========================================
app.get("/api/admin/users", async (req, res) => {
  try {
    const registeredUsers = await User.find({ role: "normal" }).select("-password").lean();
    const chatEmails = await Contact.distinct("email");
    let finalUsersList = [...registeredUsers];

    for (const email of chatEmails) {
      const alreadyExists = finalUsersList.some((u) => u.email === email);
      const isMainAdmin = email === "mamaruanmaw@1925";

      if (!alreadyExists && !isMainAdmin) {
        const sampleContact = await Contact.findOne({ email });
        if (sampleContact) {
          finalUsersList.push({
            _id: sampleContact._id,
            name: sampleContact.name || "ስም የሌለው ደንበኛ",
            email: email,
            isBlocked: false,
            isChatOnly: true,
          });
        }
      }
    }
    res.status(200).json({ success: true, users: finalUsersList });
  } catch (error) {
    res.status(500).json({ success: false, error: "የደንበኞችን ዝርዝር ማጠናቀር አልተቻለም" });
  }
});

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    const checkUser = await User.findOne({ email: cleanEmail });
    if (checkUser && checkUser.isBlocked) {
      return res.status(403).json({ success: false, error: "አካውንትዎ የታገደ በመሆኑ መልዕክት መላክ አይችሉም!" });
    }

    const newContact = new Contact({ name, email: cleanEmail, message });
    await newContact.save();
    res.status(201).json({ success: true, message: "ትዕዛዝዎ በስኬት ተቀምጧል!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "ትዕዛዙን ማስቀመጥ አልተቻለም" });
  }
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "ሰርቨሩ ዝግጁ ነው!" });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 ሰርቨር በፖርት ${PORT} ላይ ስራ ጀመረ!`));
