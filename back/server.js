const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Resend } = require('resend'); 
require('dotenv').config();

const app = express();

app.use(express.json());

app.use(cors({
  origin: [
    'https://max-technology-website.vercel.app',
    /https:\/\/max-technology-website-.*\.vercel\.app$/ 
  ],
  methods: ['POST', 'GET', 'OPTIONS'],
  credentials: true
}));

// MongoDB ግንኙነት
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB በስኬት ተገናኝቷል!'))
  .catch(err => console.error('❌ የዳታቤዝ ግንኙነት ስህተት:', err));

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', contactSchema);

// የ Resend አደረጃጀት
const resend = new Resend(process.env.RESEND_API_KEY);

// 1. የሰርቨር ጤንነት መፈተኛ መስመር (የተጨመረው አዲስ መስመር 👈)
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    status: 'OK', 
    message: 'ሰርቨሩ በትክክል እየሰራ ነው!' 
  });
});

// 2. የፎርም መልዕክት መቀበያ መስመር
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    const newContact = new Contact({ name, email, message });
    await newContact.save();

    // በResend በኩል ኢሜይል መላክ
    await resend.emails.send({
      from: 'onboarding@resend.dev', 
      to: 'technologymax2@gmail.com',  
      subject: `አዲስ መልዕክት ከ ${name} (Max Technology)`,
      html: `
        <h3>አዲስ ደንበኛ መልዕክት ልኮልሃል፡</h3>
        <p><strong>ስም፡</strong> ${name}</p>
        <p><strong>ኢሜይል፡</strong> ${email}</p>
        <p><strong>መልዕክት፡</strong></p>
        <p>${message}</p>
      `
    });

    res.status(201).json({ 
      success: true, 
      message: 'መልዕክትዎ በስኬት ተልኳል!' 
    });

  } catch (error) {
    console.error('Error Details:', error);
    res.status(500).json({ 
      success: false, 
      error: 'መልዕክቱን መላክ አልተቻለም።' 
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 ሰርቨሩ በፖርት ${PORT} ላይ ስራ ጀምሯል!`);
});