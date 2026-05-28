const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// 1. Middleware
app.use(express.json());

// የ CORS ማስተካከያ፦ ፍሮንትኤንድህ (Vercel) በነጻነት ወደዚህ ባክኤንድ መረጃ እንዲልክ ይፈቅዳል
app.use(cors({
  origin: 'https://max-technology-website.vercel.app',
  methods: ['POST', 'GET', 'OPTIONS'],
  credentials: true
}));

// 2. MongoDB Connection (ከ .env ፋይል ያነባል)
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB በስኬት ተገናኝቷል!'))
  .catch(err => console.error('❌ የዳታቤዝ ግንኙነት ስህተት:', err));

// 3. Contact Schema & Model
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', contactSchema);

// 4. Nodemailer Transporter Configuration (IPv6 ን አስገድዶ ወደ IPv4 ለመቀየር)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000, // የ10 ሰከንድ መጠበቂያ ጊዜ
  greetingTimeout: 10000,
  // 🔥 ይህ መስመር ኖድሜይለር የ Renderን IPv6 ትቶ IPv4 ብቻ እንዲጠቀም ያስገድደዋል
  dnsLookup: (hostname, options, callback) => {
    require('dns').lookup(hostname, { family: 4 }, callback);
  }
});

// 5. API Route
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // ሀ. መረጃውን ዳታቤዝ ውስጥ ሴቭ ማድረግ
    const newContact = new Contact({ name, email, message });
    await newContact.save();

    // ለ. የኢሜይል ይዘት ዝግጅት
    const mailOptions = {
      from: process.env.EMAIL_USER, 
      to: process.env.EMAIL_USER,   
      subject: `አዲስ መልዕክት ከ ${name} (Max Technology)`,
      text: `አዲስ ደንበኛ መልዕክት ልኮልሃል፡\n\nስም፡ ${name}\nኢሜይል፡ ${email}\nመልዕክት፡\n${message}`
    };

    // ሐ. ኢሜይሉን መላክ
    await transporter.sendMail(mailOptions);

    res.status(201).json({ 
      success: true, 
      message: 'መልዕክትዎ በስኬት ተልኳል! በቅርቡ እናገኝዎታለን።' 
    });

  } catch (error) {
    console.error('Error Details:', error);
    res.status(500).json({ 
      success: false, 
      error: 'መልዕክቱን መላክ አልተቻለም። እባክዎ እንደገና ይሞክሩ።' 
    });
  }
});

// 6. Server Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 ሰርቨሩ በፖርት ${PORT} ላይ ስራ ጀምሯል!`);
});