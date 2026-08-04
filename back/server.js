const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const path = require("path"); 
require("dotenv").config();

const multer = require("multer");
const XLSX = require("xlsx");
const upload = multer({ storage: multer.memoryStorage() });

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.static(path.join(__dirname, "public")));

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

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  companyName: { type: String, default: "" }, // 👈 1. የድርጅት ስም መስክ (Field) ተጨምሯል
  businessType: { type: String, default: "" },
  address: { type: String, default: "" },
  phone: { type: String, required: true, unique: true }, // 👈 ስልክ ቁጥር Unique እንዲሆን ተደርጓል (ድጋሚ እንዳይመዝገብ)
  status: { type: String, default: "ያልተደወለ" },
  comment: { type: String, default: "" },
  salesPerson: { type: String, default: "" },
  uploadedBy: { type: String, default: "" },   
  updatedBy: { type: String, default: "" },   
  deletedBy: { type: String, default: "" },   
  date: { type: Date, default: Date.now },
});
const Lead = mongoose.model("Lead", leadSchema);

// 👈 2. Excel ፋይል ሲጫን የድርጅት ስም መቀበል እና የተባዙ ስልክ ቁጥሮችን መዝለል (Skip) ማድረግ
app.post("/api/sales/upload-excel", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "እባክዎ የ Excel ፋይል ይምረጡ!" });
    }

    const uploadedBy = req.body.uploadedBy || "ያልታወቀ ሰራተኛ";
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (!rows || rows.length === 0) {
      return res.status(400).json({ success: false, error: "የኤክሴል ፋይሉ ባዶ ነው!" });
    }

    let count = 0;
    let skippedCount = 0;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      // በኤክሴል ሰንጠረዥዎ ቅደም ተከተል መሰረት (ለምሳሌ፦ 0: ስም, 1: የድርጅት ስም, 2: የስራ ዓይነት, 3: አድራሻ...)
      const name = row[0] || "ስም የሌለው";
      const companyName = row[1] || ""; // 👈 የድርጅት ስም ከኤክሴል (ከአምድ 2 / Index 1) ማንበብ
      const businessType = row[2] || ""; 
      const address = row[3] || "";    
      
      let phone = "";
      let websiteInfo = "";

      for (let j = 4; j < row.length; j++) {
        const val = String(row[j] || "").trim();
        if (val.match(/^[0-9+\-\s()]{7,}$/)) {
          phone = val;
        } else if (val.toLowerCase().includes("web") || val.toLowerCase().includes("site")) {
          websiteInfo = val;
        }
      }

      if (phone) {
        const cleanPhone = String(phone).trim();
        
        // 👈 ስልክ ቁጥሩ ቀድሞ በዳታቤዝ ውስጥ መኖሩን ማረጋገጥ
        const existingLead = await Lead.findOne({ phone: cleanPhone });
        if (existingLead) {
          skippedCount++;
          continue; // የተመዘገበ ከሆነ ይለፈው (Skip)
        }

        await Lead.create({
          name: String(name).trim(),
          companyName: String(companyName).trim(), // 👈 የድርጅት ስም ማስቀመጥ
          businessType: String(businessType).trim(),
          address: String(address).trim(),
          phone: cleanPhone,
          status: "ያልተደወለ",
          comment: websiteInfo ? `ሁኔታ: ${websiteInfo}` : "",
          uploadedBy: uploadedBy,
        });
        count++;
      }
    }

    if (count === 0 && skippedCount === 0) {
      return res.status(400).json({ success: false, error: "በፋይሉ ውስጥ የሚነበብ ስልክ ቁጥር ያለው መረጃ አልተገኘም!" });
    }

    res.status(200).json({ 
      success: true, 
      message: `ፋይሉ ተጭኗል! ${count} አዳዲስ ደንበኞች ተመዝገበዋል፣ ${skippedCount} የተባዙ (Duplicate) ስልክ ቁጥሮች ተዘለዋል።` 
    });
  } catch (error) {
    console.error("Excel upload error:", error);
    res.status(500).json({ success: false, error: "ፋይሉን ማንበብ ወይም መመዝገብ አልተቻለም" });
  }
});

app.get("/api/sales/leads", async (req, res) => {
  try {
    const leads = await Lead.find().sort({ date: -1 });
    res.status(200).json({ success: true, leads });
  } catch (error) {
    res.status(500).json({ success: false, error: "መረጃዎችን ማምጣት አልተቻለም" });
  }
});

app.put("/api/sales/leads/:id", async (req, res) => {
  try {
    const { status, comment, salesPerson, updatedBy } = req.body;
    await Lead.findByIdAndUpdate(req.params.id, {
      status,
      comment,
      salesPerson,
      updatedBy: updatedBy || "ያልታወቀ ሰራተኛ",
    });
    res.status(200).json({ success: true, message: "መረጃው ተዘምኗል!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "ማዘመን አልተቻለም" });
  }
});

app.delete("/api/sales/leads/:id", async (req, res) => {
  try {
    const { deletedBy } = req.body;
    await Lead.findByIdAndUpdate(req.params.id, {
      deletedBy: deletedBy || "ያልታወቀ ሰራተኛ"
    });
    await Lead.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "መረጃው ተሰርዟል!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "ማጥፋት አልተቻለም" });
  }
});

app.delete("/api/sales/leads-bulk", async (req, res) => {
  try {
    const { ids, deletedBy } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: "የሚጠፉ መረጃዎች አልተመረጡም!" });
    }

    await Lead.deleteMany({ _id: { $in: ids } });

    res.status(200).json({ success: true, message: "የተመረጡት ደንበኞች በስኬት ተሰርዘዋል!" });
  } catch (error) {
    console.error("Bulk delete error:", error);
    res.status(500).json({ success: false, error: "በጅምላ ማጥፋት ላይ ስህተት ተፈጥሯል" });
  }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "normal" }, 
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
  nameAmh: { type: String, default: "" },
  nameEng: { type: String, default: "" },
  age: { type: String, default: "" },
  faydaNumber: { type: String, required: true, unique: true },
  dateOfIssue: { type: String, default: "" },
  expireDate: { type: String, default: "" },
  addressAmh: { type: String, default: "" },
  addressEng: { type: String, default: "" },
  zone: { type: String, default: "" },
  city: { type: String, default: "" },
  nationality: { type: String, default: "" },
  phoneNumber: { type: String, default: "" },
  woreda: { type: String, default: "" },
  positionAmh: { type: String, default: "" },
  positionEng: { type: String, default: "" },
  orgPhoneNumber: { type: String, default: "" },
  orgEmail: { type: String, default: "" },       
  logoUrl: { type: String, default: "" },          
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
    }
  } catch (error) {
    console.error("ዋናውን አድሚን መፍጠር አልተቻለም:", error);
  }
}

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
    let role = user ? user.role : null;

    if (!user) {
      const employee = await Employee.findOne({ email: cleanEmail });
      if (employee) {
        user = employee;
        role = employee.role || "hr";
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
        name: user.name || user.nameAmh,
        email: user.email,
        role: role ? role.toLowerCase().trim() : "normal",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "የመግባት ስህተት ተፈጥሯል" });
  }
});

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
    console.error("Employee registration error:", error);
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

app.delete("/api/hr/employees/:id", async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "ሰራተኛው ተሰርዟል!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "ሰራተኛውን ማጥፋት አልተቻለም" });
  }
});

app.put("/api/hr/employees/:id", async (req, res) => {
  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ success: false, error: "ሰራተኛው አልተገኘም!" });
    }

    res.status(200).json({ 
      success: true, 
      message: "የሰራተኛው መረጃ በተሳካ ሁኔታ ተዘምኗል!", 
      employee: updatedEmployee 
    });
  } catch (error) {
    console.error("Employee update error:", error);
    res.status(500).json({ success: false, error: "ሰራተኛውን ማዘመን አልተቻለም" });
  }
});

app.post("/api/admin/hrs", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "ይህ ኢሜይል ቀድሞ ተመዝግቧል!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newHr = new User({
      name,
      email: cleanEmail,
      password: hashedPassword,
      role: "hr",
    });

    await newHr.save();
    res.status(201).json({ success: true, message: "HR በስኬት ተመዝግቧል!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "ሰርቨር ላይ ስህተት ተፈጥሯል" });
  }
});

app.get("/api/admin/hrs", async (req, res) => {
  try {
    const hrs = await User.find({ role: "hr" }).select("-password");
    res.status(200).json({ success: true, hrs });
  } catch (error) {
    res.status(500).json({ success: false, error: "የ HR ዝርዝር ማምጣት አልተቻለም" });
  }
});

app.delete("/api/admin/hrs/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "HR ተሰርዟል!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "ማጥፋት አልተቻለም" });
  }
});

app.put("/api/admin/hrs/reset-password/:id", async (req, res) => {
  try {
    const { newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(req.params.id, { password: hashedPassword });
    res.status(200).json({ success: true, message: "የ HR ፓስወርድ ተቀይሯል!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "ፓስወርድ መቀየር አልተቻለም" });
  }
});

app.get("/api/hr/verify/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, error: "ሰራተኛው አልተገኘም!" });
    }
    res.status(200).json({ success: true, employee });
  } catch (error) {
    res.status(500).json({ success: false, error: "ሰርቨር ላይ ስህተት ተፈጥሯል" });
  }
});

app.get("/api/hr/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ success: false, error: "የፍለጋ ቃል አልገባም!" });
    }
    
    const employees = await Employee.find({
      $or: [
        { nameAmh: { $regex: query, $options: "i" } },
        { nameEng: { $regex: query, $options: "i" } },
        { faydaNumber: { $regex: query, $options: "i" } }
      ]
    });

    res.status(200).json({ success: true, employees });
  } catch (error) {
    res.status(500).json({ success: false, error: "ፍለጋውን ማከናወን አልተቻለም" });
  }
});

app.get("/api/admin/users", async (req, res) => {
  try {
    const registeredUsers = await User.find({ role: "normal" })
      .select("-password")
      .lean();
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

app.put("/api/admin/users/block/:id", async (req, res) => {
  try {
    const { isBlocked } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (user) {
      await User.findByIdAndUpdate(userId, { isBlocked: isBlocked });
    } else {
      const contactData = await Contact.findById(userId);
      if (contactData) {
        const dummyPassword = await bcrypt.hash("BLOCKED_USER_PASS_123", 10);
        const blockedUser = new User({
          name: contactData.name,
          email: contactData.email,
          password: dummyPassword,
          role: "normal",
          isBlocked: isBlocked,
        });
        await blockedUser.save();
      }
    }

    res.status(200).json({ success: true, message: "የተጠቃሚው የብሎክ ሁኔታ ተቀይሯል!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "ብሎክ ማድረግ አልተሳካም" });
  }
});

app.delete("/api/admin/users/delete/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (user) {
      await User.findByIdAndDelete(userId);
    } else {
      await Contact.findByIdAndDelete(userId);
    }

    res.status(200).json({ success: true, message: "ተጠቃሚው ሙሉ በሙሉ ተሰርዟል!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "ተጠቃሚውን ማጥፋት አልተቻለም" });
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

app.post("/api/admin/send-new-message", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!email || !message) {
      return res.status(400).json({ success: false, error: "እባክዎ ኢሜይል እና መልዕክት በትክክል ያስገቡ!" });
    }
    const cleanEmail = email.toLowerCase().trim();

    const adminNewOrder = new Contact({
      name: name,
      email: cleanEmail,
      message: `[የባለሙያ መልዕክት]፦ ${message}`,
      reply: message,
      status: "ምላሽ ተሰጥቷል",
    });
    await adminNewOrder.save();
    res.status(201).json({ success: true, message: "መልዕክትዎ ለደንበኛው ተልኳል!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "መልዕክት መላክ አልተቻለም" });
  }
});

app.post("/api/admin/sales", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "ይህ ኢሜይል ቀድሞ ተመዝግቧል!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newSales = new User({
      name,
      email: cleanEmail,
      password: hashedPassword,
      role: "sales",
    });

    await newSales.save();
    res.status(201).json({ success: true, message: "የሽያጭ ሰራተኛው በስኬት ተመዝግቧል!" });
  } catch (error) {
    console.error("Sales registration error:", error);
    res.status(500).json({ success: false, error: "ሰርቨር ላይ ስህተት ተፈጥሯል" });
  }
});

app.get("/api/admin/sales", async (req, res) => {
  try {
    const sales = await User.find({ role: "sales" }).select("-password");
    res.status(200).json({ success: true, sales });
  } catch (error) {
    res.status(500).json({ success: false, error: "የሽያጭ ሰራተኞችን ዝርዝር ማምጣት አልተቻለም" });
  }
});

app.delete("/api/admin/sales/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "የሽያጭ ሰራተኛው ተሰርዟል!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "ማጥፋት አልተቻለም" });
  }
});

app.put("/api/admin/sales/reset-password/:id", async (req, res) => {
  try {
    const { newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(req.params.id, { password: hashedPassword });
    res.status(200).json({ success: true, message: "የሽያጭ ሰራተኛው ፓስወርድ ተቀይሯል!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "ፓስወርድ መቀየር አልተቻለም" });
  }
});



// ==========================================
// 3. ቀጥታ (አንድ በአንድ) ደንበኛ የመመዝገቢያ Route
// ==========================================
app.post("/api/sales/leads", async (req, res) => {
  try {
    const { name, companyName, businessType, address, phone, comment, uploadedBy } = req.body;

    // ስልክ ቁጥር መኖሩን ማረጋገጥ
    if (!phone || !name) {
      return res.status(400).json({ success: false, error: "እባክዎ ስም እና ስልክ ቁጥር በትክክል ያስገቡ!" });
    }

    const cleanPhone = String(phone).trim();

    // ስልክ ቁጥሩ ቀድሞ በዳታቤዝ ውስጥ መኖሩን ማረጋገጥ (Duplicate Check)
    const existingLead = await Lead.findOne({ phone: cleanPhone });
    if (existingLead) {
      return res.status(400).json({ 
        success: false, 
        error: "ይህ ስልክ ቁጥር ቀድሞ ተመዝግቧል! ድጋሚ መመዝገብ አይቻልም።" 
      });
    }

    // አዲሱን ደንበኛ መመዝገብ
    const newLead = new Lead({
      name: String(name).trim(),
      companyName: companyName ? String(companyName).trim() : "",
      businessType: businessType ? String(businessType).trim() : "",
      address: address ? String(address).trim() : "",
      phone: cleanPhone,
      status: "ያልተደወለ",
      comment: comment ? String(comment).trim() : "",
      uploadedBy: uploadedBy || "ያልታወቀ ሰራተኛ",
    });

    await newLead.save();

    res.status(201).json({ 
      success: true, 
      message: "ደንበኛው በስኬት ተመዝግቧል!",
      lead: newLead 
    });

  } catch (error) {
    console.error("Direct lead creation error:", error);
    res.status(500).json({ success: false, error: "ደንበኛውን መመዝገብ አልተቻለም" });
  }
});


app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "ሰርቨሩ ዝግጁ ነው!" });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 ሰርቨር በፖርት ${PORT} ላይ ስራ ጀመረ!`));
