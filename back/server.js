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
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // እንደ ዩዘርኔም የሚያገለግል
  password: { type: String, required: true },
  role: { type: String, default: 'normal' }, // 'normal', 'admin', ወይም 'employee'
  isBlocked: { type: Boolean, default: false } // 🚫 ለብሎክ ማድረጊያ የተጨመረ
});
const User = mongoose.model('User', userSchema);

// ለ. የማዘዣዎች/መልዕክቶች (Contact/Order) ስኬማ
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true }, // ከደንበኛው email ጋር የሚገናኝበት
  message: { type: String, required: true },
  reply: { type: String, default: '' }, // የአድሚን መልስ ማከማቻ
  status: { type: String, default: 'በጥበቃ ላይ' }, // 'በጥበቃ ላይ' ወይም 'ምላሽ ተሰጥቷል'
  date: { type: Date, default: Date.now }
});
const Contact = mongoose.model('Contact', contactSchema);

// 🏢 ሐ. የሰራተኞች (Employee) ስኬማ (ለዲጂታል መታወቂያ እና ኤችአር)
const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  position: { type: String, required: true },
  department: { type: String, required: true },
  idNumber: { type: String, required: true, unique: true },
  photoUrl: { type: String, default: '' },
  role: { type: String, default: 'employee' },
  date: { type: Date, default: Date.now }
});
const Employee = mongoose.model('Employee', employeeSchema);

// ==========================================
// 2. የመጀመሪያው አድሚን መፍጠሪያ (SEEDING)
// ==========================================
async function seedFirstAdmin() {
  try {
    const adminEmail = 'mamaruAnmaw@1925';
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('mame192513', 10);
      const firstAdmin = new User({
        name: 'Mamaru Anmaw (Main Admin)',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
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
  date: { type: Date, default: Date.now }
});
const Project = mongoose.model('Project', projectSchema);

// አዲስ ሲስተም መመዝገቢያ (POST)
app.post('/api/admin/projects', async (req, res) => {
  const newProject = new Project(req.body);
  await newProject.save();
  res.json({ success: true });
});

// ሲስተሞችን ማምጫ (GET)
app.get('/api/projects', async (req, res) => {
  const projects = await Project.find().sort({ date: -1 });
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
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, error: 'ይህ ኢሜይል/ዩዘርኔም ቀድሞ ተመዝግቧል!' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: 'normal'
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
    
    // መጀመሪያ በ User (አድሚን ወይም መደበኛ) መፈለግ
    let user = await User.findOne({ email });
    let role = user ? user.role : null;

    // በ User ካልተገኘ በ Employee (ሰራተኛ) መፈለግ
    if (!user) {
      const employee = await Employee.findOne({ email });
      if (employee) {
        user = employee;
        role = 'employee';
      }
    }

    if (!user) return res.status(400).json({ success: false, error: 'ኢሜይል/ዩዘርኔም ወይም ፓስወርድ ተሳስቷል!' });

    // 🚫 ተጠቃሚው በአድሚን ታግዶ ከሆነ መግቢያ መከልከል
    if (user.isBlocked) {
      return res.status(403).json({ success: false, error: 'አካውንትዎ በአድሚን ታግዷል! እባክዎ ባለሙያ ያነጋግሩ።' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, error: 'ኢሜይል/ዩዘርኔም ወይም ፓስወርድ ተሳስቷል!' });

    res.status(200).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: role }
    });
  } catch (error) {
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

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, error: 'ይህ ኢሜይል/ዩዘርኔም ቀድሞ ተመዝግቧል!' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new User({
      name,
      email,
      password: hashedPassword,
      role: 'admin'
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
    const admins = await User.find({ role: 'admin' }).select('-password');
    res.status(200).json({ success: true, admins });
  } catch (error) {
    res.status(500).json({ success: false, error: 'የአድሚኖችን ዝርዝር ማምጣት አልተቻለም' });
  }
});

// የአድሚን መረጃ ማስተካከያ (PUT)
app.put('/api/admin/update/:id', async (req, res) => {
  try {
    const { name, email } = req.body;
    await User.findByIdAndUpdate(req.params.id, { name, email });
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
    await User.findByIdAndUpdate(req.params.id, { password: hashedPassword });
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
    const messages = await Contact.find().sort({ date: -1 });
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
      reply: reply, 
      status: 'ምላሽ ተሰጥቷል' 
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

// አዲስ ሰራተኛ መመዝገቢያ
app.post('/api/hr/employees', async (req, res) => {
  try {
    const { name, email, password, phone, position, department, idNumber, photoUrl } = req.body;
    
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({ success: false, error: 'ይህ ኢሜይል ቀድሞ ተመዝግቧል!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newEmployee = new Employee({
      name,
      email,
      password: hashedPassword,
      phone,
      position,
      department,
      idNumber,
      photoUrl,
      role: 'employee'
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
    const employees = await Employee.find().sort({ date: -1 });
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
    const registeredUsers = await User.find({ role: 'normal' }).select('-password').lean();
    const chatEmails = await Contact.distinct('email');
    let finalUsersList = [...registeredUsers];

    for (const email of chatEmails) {
      const alreadyExists = finalUsersList.some(u => u.email === email);
      const isMainAdmin = email === 'mamaruAnmaw@1925'; 

      if (!alreadyExists && !isMainAdmin) {
        const sampleContact = await Contact.findOne({ email });
        if (sampleContact) {
          finalUsersList.push({
            _id: sampleContact._id, 
            name: sampleContact.name || 'ስም የሌለው ደንበኛ',
            email: email,
            isBlocked: false,
            isChatOnly: true   
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
      await User.findByIdAndUpdate(userId, { isBlocked });
    } else {
      const contactData = await Contact.findById(userId);
      if (contactData) {
        const dummyPassword = await bcrypt.hash('BLOCKED_USER_PASS_123', 10);
        const blockedUser = new User({
          name: contactData.name,
          email: contactData.email,
          password: dummyPassword,
          role: 'normal',
          isBlocked: isBlocked
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
    
    const checkUser = await User.findOne({ email });
    if (checkUser && checkUser.isBlocked) {
      return res.status(403).json({ success: false, error: 'አካውንትዎ የታገደ በመሆኑ መልዕክት መላክ አይችሉም!' });
    }

    const newContact = new Contact({ name, email, message });
    await newContact.save();
    res.status(201).json({ success: true, message: 'ትዕዛዝዎ በስኬት ተቀምጧል!' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'ትዕዛዙን ማስቀመጥ አልተቻለም' });
  }
});

app.get('/api/user/orders/:email', async (req, res) => {
  try {
    const orders = await Contact.find({ email: req.params.email }).sort({ date: -1 });
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
      { message: message },
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

    const adminNewOrder = new Contact({
      name: name,
      email: email,
      message: `[የባለሙያ መልዕክት]፦ ${message}`, 
      reply: message, 
      status: 'ምላሽ ተሰጥቷል'
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
