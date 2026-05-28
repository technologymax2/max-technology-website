import React, { useState } from 'react';
import './App.css'; 
import logoImg from './logo.jpg'; 

function App() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('በመላክ ላይ...');
    
    // በ Render ላይ የሚሰጥዎትን የባክኤንድ ሊንክ ይጠቀማል
    const API_BASE_URL = 'https://max-tech-backend.onrender.com';

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json(); // ከባክኤንድ የተመለሰውን የ JSON መረጃ ማንበቢያ

      if (response.ok && data.success) {
        setStatus(data.message || 'መልዕክትዎ በስኬት ተልኳል!');
        setFormData({ name: '', email: '', message: '' }); // ፎርሙን ባዶ ማድረጊያ
      } else {
        // ከባክኤንድ የመጣውን ትክክለኛ የስህተት መልዕክት ያሳያል
        setStatus(data.error || 'ችግር ተፈጥሯል!');
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      setStatus('ከሰርቨር ጋር መገናኘት አልተቻለም።');
    }
  };

  return (
    <div className="container">
      {/* Navigation */}
      <nav className="navbar">
        <div className="logo-container slide-in-left">
          <img src={logoImg} alt="Max Technology Logo" className="logo-image" />
          <span className="logo-text">Max Technology</span>
        </div>
        <div className="nav-links fade-in">
          <a href="#home">ዋና ገጽ</a>
          <a href="#services">አገልግሎቶች</a>
          <a href="#tech">ቴክኖሎጂ</a>
          <a href="#contact">ያግኙን</a>
        </div>
      </nav>

      {/* Hero Section */}
      <header id="home" className="hero">
        <div className="hero-content zoom-in">
          <h1 className="hero-title">Building Scalable MERN Stack Solutions</h1>
          <p className="hero-subtitle">ለድርጅትዎ ዘመናዊ፣ ፈጣን እና አስተማማኝ የዌብሳይት እና የሶፍትዌር መተግበሪያዎችን እንገነባለን።</p>
          <a href="#contact" className="cta-btn pulse">
            እንስራልዎት? እንግዲዉስ ይግቡ <span className="arrow"><strong>→</strong></span>
          </a>
        </div>
      </header>

      {/* Services Section */}
      <section id="services" className="section">
        <h2 className="section-title">አገልግሎቶቻችን</h2>
        <div className="grid">
          <div className="card hover-up">
            <div className="icon">💻</div>
            <h3>Full-Stack Web Dev</h3>
            <p>ከፊት ገጽ እስከ ጀርባ ገጽ የተሟላ የዌብሳይት ልማት。</p>
          </div>
          <div className="card hover-up">
            <div className="icon">⚙️</div>
            <h3>Custom API Systems</h3>
            <p>ፈጣንና ደህንነቱ የተጠበቀ የኤፒአይ (API) ሲስተሞች ግንባታ።</p>
          </div>
          <div className="card hover-up">
            <div className="icon">📊</div>
            <h3>Database Design</h3>
            <p>ከፍተኛ መረጃዎችን ማስተናገድ የሚችሉ የዳታቤዝ አደረጃጀት።</p>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech" className="section fade-in">
        <h2 className="section-title">የምንጠቀምባቸው ቴክኖሎጂዎች</h2>
        <p style={{ marginBottom: '30px', color: '#666' }}>
          ለእርስዎ ስራ ጥራት ያላቸውን እና ዘመናዊ የ MERN Stack ቴክኖሎጂዎችን እንጠቀማለን።
        </p>
        <div className="tech-grid">
          <span className="tech-badge">MongoDB</span>
          <span className="tech-badge">Express.js</span>
          <span className="tech-badge">React.js</span>
          <span className="tech-badge">Node.js</span>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section contact-bg">
        <h2 className="section-title">ያግኙን</h2>
        <div className="contact-info fade-in">
          <p className="phone-text">📞 ማግኘት ከፈለጉ ስልክ: <strong>+251989860376</strong></p>
          <p className="sub-contact-text">ወይም መልዕክትዎን ከታች ያስቀምጡልን</p>
        </div>
        <form onSubmit={handleSubmit} className="contact-form bounce-in">
          <input type="text" name="name" placeholder="ስምዎ" value={formData.name} onChange={handleChange} required className="input-field" />
          <input type="email" name="email" placeholder="ኢሜይል" value={formData.email} onChange={handleChange} required className="input-field" />
          <textarea name="message" placeholder="መልዕክትዎ" value={formData.message} onChange={handleChange} required className="textarea-field"></textarea>
          <button type="submit" className="submit-btn">ይላኩ</button>
          {status && <p className="status-msg">{status}</p>}
        </form>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Max Technology. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;