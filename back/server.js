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
  methods: ['POST', 'GET', 'DELETE', 'OPTIONS'],
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
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'normal' } // 'normal' ወይም 'admin'
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

// ==========================================
// 3. የደህንነት እና መግቢያ መስመሮች (AUTH ROUTES)
// ==========================================

// ሀ. መደበኛ ደንበኞች መመዝገቢያ (SIGNUP - ለኖርማል ዩዘር ብቻ)
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
      role: 'normal' // በዌብሳይቱ በራሱ የሚመዘገብ ሰው ሁልጊዜም ደንበኛ (normal) ነው
    });

    await newUser.save();
    res.status(201).json({ success: true, message: 'ምዝገባው በስኬት ተጠናቋል!' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'የምዝገባ ስህተት ተፈጥሯል' });
  }
});

// ለ. ተጠቃሚዎች መግቢያ (LOGIN - ለአድሚንም ለኖርማልም)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, error: 'ኢሜይል/ዩዘርኔም ወይም ፓስወርድ ተሳስቷል!' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, error: 'ኢሜይል/ዩዘርኔም ወይም ፓስወርድ ተሳስቷል!' });

    res.status(200).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'የመግባት ስህተት ተፈጥሯል' });
  }
});

// ==========================================
// 4. የአድሚን ልዩ መስመሮች (ADMIN ROUTES)
// ==========================================

// ሐ. አድሚን ብቻ ሌላ አድሚን የሚጨምርበት መስመር
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
      role: 'admin' // ዋናው አድሚን ስለመዘገበው በቀጥታ አድሚን ይሆናል
    });

    await newAdmin.save();
    res.status(201).json({ success: true, message: 'አዲሱ አድሚን በስኬት ተመዝግቧል!' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'አድሚን መፍጠር አልተቻለም' });
  }
});

// መ. አድሚን ሁሉንም የደንበኞች ማዘዣዎች የሚያይበት (GET)
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

// ረ. አድሚን ማዘዣ የሚያጠፋበት (DELETE)
app.delete('/api/admin/messages/:id', async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'ማዘዣው ተሰርዟል!' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'ማጥፋት አልተቻለም' });
  }
});

// ==========================================
// 5. የደንበኞች መስመሮች (USER/ORDER ROUTES)
// ==========================================

// ሰ. ደንበኞች አዲስ ማዘዣ የሚያስገቡበት (POST)
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const newContact = new Contact({ name, email, message });
    await newContact.save();
    res.status(201).json({ success: true, message: 'ትዕዛዝዎ በስኬት ተቀምጧል!' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'ትዕዛዙን ማስቀመጥ አልተቻለም' });
  }
});

// ሸ. ደንበኛ የራሱን ማዘዣዎችና የተሰጡትን ምላሾች ብቻ የሚያይበት መስመር
app.get('/api/user/orders/:email', async (req, res) => {
  try {
    const orders = await Contact.find({ email: req.params.email }).sort({ date: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, error: 'ማዘዣዎችዎን ማምጣት አልተቻለም' });
  }
});

// ==========================================
// 6. የሰርቨር ጤንነት እና ማስነሻ (SERVER START)
// ==========================================
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'ሰርቨሩ ዝግጁ ነው!' });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 ሰርቨር በፖርት ${PORT} ላይ ስራ ጀመረ!`));