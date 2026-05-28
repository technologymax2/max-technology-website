const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(express.json());

app.use(cors({
  origin: [
    'https://max-technology-website.vercel.app',
    /https:\/\/max-technology-website-.*\.vercel\.app$/ 
  ],
  methods: ['POST', 'GET', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// MongoDB የግንኙነት መስመር
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB በስኬት ተገናኝቷል!');
    seedFirstAdmin(); // ዳታቤዙ እንደተገናኘ የመጀመሪያውን አድሚን ይፈጥራል
  })
  .catch(err => console.error('❌ የዳታቤዝ ግንኙነት ስህተት:', err));

// 1. የተጠቃሚዎች (User) ስኬማ
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'normal' } // 'normal' ወይም 'admin'
});
const User = mongoose.model('User', userSchema);

// 2. የመልዕክቶች (Contact/Order) ስኬማ
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now }
});
const Contact = mongoose.model('Contact', contactSchema);

// 🚀 [ቁጥር 1] የመጀመሪያውን አድሚን በራስ-ሰር ዳታቤዝ ውስጥ መፍጠሪያ (Seeding)
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

// ---- AUTHENTICATION ROUTES ----

// [ቁጥር 2] Signup ከVerification Key ማረጋገጫ ጋር
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, role, verificationKey } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, error: 'ይህ ኢሜይል ቀድሞ ተመዝግቧል!' });

    let finalRole = 'normal';
    
    // ተጠቃሚው አድሚን ለመሆን ከፈለገ ቁልፉን ይፈትሻል
    if (role === 'admin') {
      const SECRET_KEY = 'MAX_ADMIN_SECRET_2026'; // ዋናው አድሚን ለሌሎች የሚሰጠው ቁልፍ
      if (verificationKey !== SECRET_KEY) {
        return res.status(401).json({ 
          success: false, 
          error: 'የተሳሳተ የማረጋገጫ ቁልፍ! አድሚን ለመሆን ከዋናው አድሚን ፈቃድ ማግኘት አለብዎት።' 
        });
      }
      finalRole = 'admin';
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: finalRole
    });

    await newUser.save();
    res.status(201).json({ success: true, message: 'ምዝገባው በስኬት ተጠናቋል!' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'የምዝገባ ስህተት ተፈጥሯል' });
  }
});

// Login (መግቢያ)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, error: 'ኢሜይል ወይም ፓስወርድ ተሳስቷል!' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, error: 'ኢሜይል ወይም ፓስወርድ ተሳስቷል!' });

    res.status(200).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'የመግባት ስህተት ተፈጥሯል' });
  }
});

// ---- ሮውቶች ለዳታ ----
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const newContact = new Contact({ name, email, message });
    await newContact.save();
    res.status(201).json({ success: true, message: 'ትዕዛዝዎ በስኬት ተቀምጧል!' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'ማስቀመጥ አልተቻለም' });
  }
});

app.get('/api/admin/messages', async (req, res) => {
  try {
    const messages = await Contact.find().sort({ date: -1 });
    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, error: 'ማምጣት አልተቻለም' });
  }
});

app.delete('/api/admin/messages/:id', async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'ተሰርዟል!' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'ማጥፋት አልተቻለም' });
  }
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'ሰርቨሩ ዝግጁ ነው!' });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 ሰርቨር በፖርት ${PORT} ላይ ሰራ ጀመረ!`));