const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// 1. Middleware ከቪርሴል የሚመጣውን ጥያቄ በይፋ ለመፍቀድ
app.use(express.json());
app.use(cors({
  origin: ['https://max-technology-website.vercel.app', 'http://localhost:3000'],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// 2. MongoDB Connection
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

// 4. Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 5. API Route
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // ሀ. ዳታቤዝ ውስጥ ማስቀመጥ
    const newContact = new Contact({ name, email, message });
    await newContact.save();

    // ለ. የኢሜይል ውቅር
    const mailOptions = {
      from: process.env.EMAIL_USER, 
      to: process.env.EMAIL_USER,   
      subject: `አዲስ መልዕክት ከ ${name} (Max Technology)`,
      text: `አዲስ ደንበኛ መልዕክት ልኮልሃል፡\n\nስም፡ ${name}\nኢሜይል፡ ${email}\nመልዕክት፡\n${message}`
    };

    // ሐ. መላክ
    await transporter.sendMail(mailOptions);

    return res.status(201).json({ 
      success: true, 
      message: 'መልዕክትዎ በስኬት ተልኳል! በቅርቡ እናገኝዎታለን።' 
    });

  } catch (error) {
    console.error('Error Details:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'መልዕክቱን መላክ አልተቻለም። እባክዎ እንደገና ይሞክሩ።' 
    });
  }
});

// 6. Render አስተማማኝ ፖርት አወሳሰድ
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 ሰርቨሩ በፖርት ${PORT} ላይ ስራ ጀምሯል!`);
});