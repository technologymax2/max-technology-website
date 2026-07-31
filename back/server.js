const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(express.json());

// የ CORS አደረጃጀት - ማንኛውንም ግንኙነት እንዳያግድ ክፍት ተደርጓል
app.use(cors({
  origin: '*',
  methods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// MongoDB የግንኙነት መስመር
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB በስኬት ተገናኝቷል!');
    seedFirstAdmin(); // ዳታቤዙ እንደተገናኘ የመጀመሪያውን አድሚን ይፈትሻል/ይፈጥራል
  })
  .catch(err => console.error('❌ የዳታቤዝ ግንኙነት ስህተት:', err));

// ==========================================
// 1. የዳታቤዝ ሞዴሎች (SCHEMAS & MODELS)
// ==========================================

// ሀ. የተጠቃሚዎች (User) ስኬማ
const userSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Email: { type: String, required: true, unique: true }, // እንደ ዩዘርኔም የሚያገለግል
  Password: { type: String, required: true },
  Role: { type: String, default: 'normal' }, // 'normal', 'admin', ወይም 'hr'/'employee'
  IsBlocked: { type: Boolean, default: false } // 🚫 ለብሎክ ማድረጊያ የተጨመረ
});
const User = mongoose.model('User', userSchema);

// ለ. የማዘዣዎች/መልዕክቶች (Contact/Order) ስኬማ
const contactSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Email: { type: String, required: true }, // ከደንበኛው email ጋር የሚገናኝበት
  Message: { type: String, required: true },
  Reply: { type: String, default: '' }, // የአድሚን መልስ ማከማቻ
  Status: { type: String, default: 'በጥበቃ ላይ' }, // 'በጥበቃ ላይ' ወይም 'ምላሽ ተሰጥቷል'
  Date: { type: Date, default: Date.now }
});
const Contact = mongoose.model('Contact', contactSchema);

// 🏢 ሐ. የሰራተኞች (Employee) ስኬማ (ለዲጂታል መታወቂያ እና ኤችአር)
const employeeSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Email: { type: String, required: true, unique: true },
  Password: { type: String, required: true },
  Phone: { type: String, required: true },
  Position: { type: String, required: true },
  Department: { type: String, required: true },
  IdNumber: { type: String, required: true, unique: true },
  PhotoUrl: { type: String, default: '' },
  Role: { type: String, default: 'employee' }, // 'hr' ወይም 'employee' ሊሆን ይችላል
  Date: { type: Date, default: Date.now }
});
const Employee = mongoose.model('Employee', employeeSchema);

// ==========================================
// 2. የመጀመሪያው አድሚን መፍጠሪያ (SEEDING)
// ==========================================
async function seedFirstAdmin() {
  try {
    const adminEmail = 'mamaruAnmaw@1925';
    const existingAdmin = await User.findOne({ Email: adminEmail });
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('mame192513', 10);
      const firstAdmin = new User({
        Name: 'Mamaru Anmaw (Main Admin)',
        Email: adminEmail,
        Password: hashedPassword,
        Role: 'admin'
      });
      await firstAdmin.save();
      console.log('👑 የመጀመሪያው ዋና አድሚን በስኬት ዳታቤዝ ውስጥ ተፈጥሯል!');
    }
  } catch (error) {
    console.error('ዋናውን አድሚን መፍጠር አልተቻለም:', error);
  }
}

// አዲስ የፕሮጀክት ስኪማ
const projectSchema = new mongoose.Schema({
  title: String,
  link: String,
  imageUrl: String,
  Date: { type: Date, default: Date.now }
});
const Project = mongoose.model('Project', projectSchema);

// አዲስ ሲስተም መመዝገቢያ (POST)
app.post('/api/admin/projects', async (req, res) => {
  const { title, link, imageUrl } = req.body;

const newProject = new Project({
  title,
  link,
  imageUrl
});
  await newProject.save();
  res.json({ success: true });
});

// ሲስተሞችን ማምጫ (GET)
app.get('/api/projects', async (req, res) => {
  const projects = await Project.find().sort({ Date: -1 });
  res.json({ success: true, projects });
});

// ሲስተሞችን ማጥፊያ (DELETE)
app.delete('/api/admin/projects/:id', async (req, res) => {
  await Project.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// ==========================================
// 3. የደህንነት እና መግቢያ መስመሮች (AUTH ROUTES)
// ==========================================

// ሀ. መደበኛ ደንበኞች መመዝገቢያ (SIGNUP)
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();
    
    const existingUser = await User.findOne({ Email: cleanEmail });
    if (existingUser) return res.status(400).json({ success: false, error: 'ይህ ኢሜይል/ዩዘርኔም ቀድሞ ተመዝግቧል!' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      Name: name,
      Email: cleanEmail,
      Password: hashedPassword,
      Role: 'normal'
    });

    await newUser.save();
    res.status(201).json({ success: true, message: 'ምዝገባው በስኬት ተጠናቋል!' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'የምዝገባ ስህተት ተፈጥሯል' });
  }
});

// ለ. ተጠቃሚዎች መግቢያ (LOGIN) - (የታገዱ ሰዎችን ይከለክላል)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();
    
    // መጀመሪያ በ User (አድሚን ወይም መደበኛ) መፈለግ
    let user = await User.findOne({ Email: cleanEmail });
    let role = user ? user.Role : null;

    // በ User ካልተገኘ በ Employee (ሰራተኛ) መፈለግ
    if (!user) {
      const employee = await Employee.findOne({ Email: cleanEmail });
      if (employee) {
        user = employee;
        role = employee.Role || 'employee'; // 👈 የሰራተኛውን ትክክለኛ ሚና (hr ወይም employee) መውሰድ
      }
    }

    if (!user) return res.status(400).json({ success: false, error: 'ኢሜይል/ዩዘርኔም ወይም ፓስወርድ ተሳስቷል!' });

    // 🚫 ተጠቃሚው በአድሚን ታግዶ ከሆነ መግቢያ መከልከል
    if (user.IsBlocked || user.isBlocked) {
      return res.status(403).json({ success: false, error: 'አካውንትዎ በአድሚን ታግዷል! እባክዎ ባለሙያ ያነጋግሩ።' });
    }

    const isMatch = await bcrypt.compare(password, user.Password || user.password);
    if (!isMatch) return res.status(400).json({ success: false, error: 'ኢሜይል/ዩዘርኔም ወይም ፓስወርድ ተሳስቷል!' });

    res.status(200).json({
      success: true,
      user: { 
        id: user._id, 
        name: user.Name || user.name, 
        email: user.Email || user.email, 
        role: role ? role.toLowerCase().trim() : 'normal' 
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, error: 'የመግባት ስህተት ተፈጥሯል' });
  }
});

// ==========================================
// 4. የአድሚን መቆጣጠሪያ መስመሮች (ADMIN CONTROL ROUTES)
// ==========================================

// ሐ. አዲስ ረዳት አድሚን መመዝገቢያ
app.post('/api/admin/add-admin', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ Email: cleanEmail });
    if (existingUser) return res.status(400).json({ success: false, error: 'ይህ ኢሜይል/ዩዘርኔም ቀድሞ ተመዝግቧል!' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new User({
      Name: name,
      Email: cleanEmail,
      Password: hashedPassword,
      Role: 'admin'
    });

    await newAdmin.save();
    res.status(201).json({ success: true, message: 'አዲሱ አድሚን በስኬት ተመዝግቧል!' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'አድሚን መፍጠር አልተቻለም' });
  }
});

// የተመዘገቡ አድሚኖችን ዝርዝር ማያ
app.get('/api/admin/list', async (req, res) => {
  try {
    const admins = await User.find({ Role: 'admin' }).select('-Password');
    res.status(200).json({ success: true, admins });
  } catch (error) {
    res.status(500).json({ success: false, error: 'የአድሚኖችን ዝርዝር ማምጣት አልተቻለም' });
  }
});

// የአድሚን መረጃ ማስተካከያ (PUT)
app.put('/api/admin/update/:id', async (req, res) => {
  try {
    const { name, email } = req.body;
    await User.findByIdAndUpdate(req.params.id, { Name: name, Email: email ? email.toLowerCase().trim() : undefined });
    res.status(200).json({ success: true, message: 'የአድሚን መረጃ ተስተካክሏል!' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'ማስተካከሉ አልተሳካም' });
  }
});

// የአድሚን ፓስወርድ መለወጫ (PUT)
app.put('/api/admin/reset-password/:id', async (req, res) => {
  try {
    const { newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(req.params.id, { Password: hashedPassword });
    res.status(200).json({ success: true, message: 'የአድሚኑ ፓስወርድ በስኬት ተለውጧል!' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'ፓስወርድ መቀየር አልተቻለም' });
  }
});

// 🗑️ ረዳት አድሚን ሙሉ በሙሉ መሰረዣ ኤፒአይ
app.delete('/api/admin/delete/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'አድሚኑ በተሳካ ሁኔታ ተሰርዟል!' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'አድሚኑን ማጥፋት አልተቻለም' });
  }
});

// መ. አድሚን ሁሉንም የደንበኞች ማዘዣዎች የሚያይበት
app.get('/api/admin/messages', async (req, res) => {
  try {
    const messages = await Contact.find().sort({ Date: -1 });
    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, error: 'መረጃዎችን ማምጣት አልተቻለም' });
  }
});

// ሠ. አድሚን ለደንበኛ ማዘዣ መልስ (Reply) የሚጽፍበት መስመር
app.post('/api/admin/reply/:id', async (req, res) => {
  try {
    const { reply } = req.body;
    await Contact.findByIdAndUpdate(req.params.id, { 
      Reply: reply, 
      Status: 'ምላሽ ተሰጥቷል' 
    });
    res.status(200).json({ success: true, message: 'ምላሽዎ በተሳካ ሁኔታ ተልኳል!' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'ምላሽ መላክ አልተቻለም' });
  }
});

// ረ. አድሚን ማዘዣ የሚያጠፋበት (ከቻት ቦክስ ላይ)
app.delete('/api/admin/messages/:id', async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'ማዘዣው ተሰርዟል!' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'ማጥፋት አልተቻለም' });
  }
});

// ==========================================
// 5. የሰራተኞች ማስተዳደሪያ (HR / EMPLOYEE ROUTES)
// ==========================================

// አዲስ ሰራተኛ መመዝገቢያ (HR ወይም Employee በራስ ሰር እንዲለይ ተደርጓል)
app.post('/api/hr/employees', async (req, res) => {
  try {
    const { name, email, password, phone, position, department, idNumber, photoUrl } = req.body;
    const cleanEmail = email.toLowerCase().trim();
    
    const existingEmployee = await Employee.findOne({ Email: cleanEmail });
    if (existingEmployee) {
      return res.status(400).json({ success: false, error: 'ይህ ኢሜይል ቀድሞ ተመዝግቧል!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 🔍 ፖዚሽኑ ወይም ዲፓርትመንቱ 'hr' የሚል ቃል ከያዘ ሮሉን 'hr' እናደርገዋለን
    const assignedRole = (position.toLowerCase().includes('hr') || department.toLowerCase().includes('hr')) ? 'hr' : 'employee';

    const newEmployee = new Employee({
      Name: name,
      Email: cleanEmail,
      Password: hashedPassword,
      Phone: phone,
      Position: position,
      Department: department,
      IdNumber: idNumber,
      PhotoUrl: photoUrl,
      Role: assignedRole 
    });

    await newEmployee.save();
    res.status(201).json({ success: true, message: 'ሰራተኛው በስኬት ተመዝግቧል!' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'ኢሜይል ወይም መታወቂያ ቁጥር ቀድሞ ተመዝግቧል!' });
  }
});

// ሰራተኞችን ማምጫ
app.get('/api/hr/employees', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ Date: -1 });
    res.status(200).json({ success: true, employees });
  } catch (error) {
    res.status(500).json({ success: false, error: 'ሰራተኞችን ማምጣት አልተቻለም' });
  }
});

// ሰራተኛን መሰረዣ
app.delete('/api/hr/employees/:id', async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'ሰራተኛው ተሰርዟል!' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'ሰራተኛውን ማጥፋት አልተቻለም' });
  }
});

// ==========================================
// 6. የተጠቃሚዎች ማስተዳደሪያ (USER MANAGEMENT ROUTES)
// ==========================================

app.get('/api/admin/users', async (req, res) => {
  try {
    const registeredUsers = await User.find({ Role: 'normal' }).select('-Password').lean();
    const chatEmails = await Contact.distinct('Email');
    let finalUsersList = [...registeredUsers];

    for (const email of chatEmails) {
      const alreadyExists = finalUsersList.some(u => u.Email === email);
      const isMainAdmin = email === 'mamaruAnmaw@1925'; 

      if (!alreadyExists && !isMainAdmin) {
        const sampleContact = await Contact.findOne({ Email: email });
        if (sampleContact) {
          finalUsersList.push({
            _id: sampleContact._id, 
            Name: sampleContact.Name || 'ስም የሌለው ደንበኛ',
            Email: email,
            IsBlocked: false,
            IsChatOnly: true   
          });
        }
      }
    }

    res.status(200).json({ success: true, users: finalUsersList });
  } catch (error) {
    res.status(500).json({ success: false, error: 'የደንበኞችን ዝርዝር ማጠናቀር አልተቻለም' });
  }
});

app.put('/api/admin/users/block/:id', async (req, res) => {
  try {
    const { isBlocked } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (user) {
      await User.findByIdAndUpdate(userId, { IsBlocked: isBlocked });
    } else {
      const contactData = await Contact.findById(userId);
      if (contactData) {
        const dummyPassword = await bcrypt.hash('BLOCKED_USER_PASS_123', 10);
        const blockedUser = new User({
          Name: contactData.Name,
          Email: contactData.Email,
          Password: dummyPassword,
          Role: 'normal',
          IsBlocked: isBlocked
        });
        await blockedUser.save();
      }
    }

    res.status(200).json({ success: true, message: 'የተጠቃሚው የብሎክ ሁኔታ ተቀይሯል!' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'ብሎክ ማድረግ አልተሳካም' });
  }
});

app.delete('/api/admin/users/delete/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    
    if (user) {
      await User.findByIdAndDelete(userId);
    } else {
      await Contact.findByIdAndDelete(userId);
    }
    
    res.status(200).json({ success: true, message: 'ተጠቃሚው ሙሉ በሙሉ ተሰርዟል!' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'ተጠቃሚውን ማጥፋት አልተቻለም' });
  }
});

// ==========================================
// 7. የደንበኞች ማዘዣ መስመሮች (USER/ORDER ROUTES)
// ==========================================

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const cleanEmail = email.toLowerCase().trim();
    
    const checkUser = await User.findOne({ Email: cleanEmail });
    if (checkUser && checkUser.IsBlocked) {
      return res.status(403).json({ success: false, error: 'አካውንትዎ የታገደ በመሆኑ መልዕክት መላክ አይችሉም!' });
    }

    const newContact = new Contact({ Name: name, Email: cleanEmail, Message: message });
    await newContact.save();
    res.status(201).json({ success: true, message: 'ትዕዛዝዎ በስኬት ተቀምጧል!' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'ትዕዛዙን ማስቀመጥ አልተቻለም' });
  }
});

app.get('/api/user/orders/:email', async (req, res) => {
  try {
    const cleanEmail = req.params.email.toLowerCase().trim();
    const orders = await Contact.find({ Email: cleanEmail }).sort({ Date: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, error: 'ማዘዣዎችዎን ማምጣት አልተቻለም' });
  }
});

app.put('/api/user/orders/edit/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const { message } = req.body;

    const updatedOrder = await Contact.findByIdAndUpdate(
      orderId,
      { Message: message },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "መልዕክቱ አልተገኘም" });
    }

    res.json({ success: true, message: "መልዕክቱ በተሳካ ሁኔታ ተስተካክሏል", order: updatedOrder });
  } catch (err) {
    res.status(500).json({ success: false, message: "የባክኤንድ ስህተት ገጥሟል" });
  }
});

app.delete('/api/user/orders/delete/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const deletedOrder = await Contact.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).json({ success: false, message: "መልዕክቱ አልተገኘም" });
    }

    res.json({ success: true, message: "መልዕክቱ በተሳካ ሁኔታ ጠፍቷል" });
  } catch (err) {
    res.status(500).json({ success: false, message: "የባክኤንድ ስህተት ገጥሟል" });
  }
});

app.post('/api/admin/send-new-message', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    if (!email || !message) {
      return res.status(400).json({ success: false, error: 'እባክዎ ኢሜይል እና መልዕክት በትክክል ያስገቡ!' });
    }

    const cleanEmail = email.toLowerCase().trim();

    const adminNewOrder = new Contact({
      Name: name,
      Email: cleanEmail,
      Message: `[የባለሙያ መልዕክት]፦ ${message}`, 
      Reply: message, 
      Status: 'ምላሽ ተሰጥቷል'
    });

    await adminNewOrder.save();
    res.status(201).json({ success: true, message: 'መልዕክትዎ ለደንበኛው ተልኳል!' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'መልዕክት መላክ አልተቻለም' });
  }
});

// ==========================================
// 8. የሰርቨር ጤንነት እና ማስነሻ (SERVER START)
// ==========================================
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'ሰርቨሩ ዝግጁ ነው!' });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 ሰርቨር በፖርት ${PORT} ላይ ስራ ጀመረ!`));
