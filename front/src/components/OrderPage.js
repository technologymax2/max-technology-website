import React, { useEffect, useState } from 'react';
import './OrderPage.css';

function OrderPage({ user, handleLogout, formData, handleContactChange, handleOrderSubmit, status, logoImg, API_BASE_URL }) {
  const [myOrders, setMyOrders] = useState([]);

  useEffect(() => {
    fetchMyOrders();

    const interval = setInterval(() => {
      fetchMyOrders();
    }, 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMyOrders = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/orders/${user.email}`);
      const data = await res.json();
      if (data.success) setMyOrders(data.orders);
    } catch (err) {
      console.error('ማዘዣዎችን ማምጣት አልተቻለም');
    }
  };

  return (
    <div className="order-page-container">
      {/* 🚀 የላይኛው መገናኛ ባር (Navbar) */}
      <nav className="order-navbar">
        <div className="order-logo-area">
          <img src={logoImg} alt="Logo" className="order-logo-img" />
          <span className="order-brand-name">Max Technology</span>
        </div>
        <div className="order-user-area">
          <span className="order-user-badge">👤 {user.name}</span>
          <button onClick={handleLogout} className="order-logout-btn">ውጣ</button>
        </div>
      </nav>

      {/* 🚀 ዋናው የይዘት ክፍል (Main Layout Grid) */}
      <div className="order-main-grid">
        
        {/* 1. የግራ ክፍል፦ ማዘዣ ፎርም */}
        <div className="order-form-wrapper">
          <div className="order-card-form">
            <h2 className="order-form-title">🛒 አዲስ የሶፍትዌር ማዘዣ</h2>
            <p className="order-form-subtitle">ሊሰሩ ያሰቡትን ሶፍትዌር ዝርዝር እዚህ ያስገቡ</p>
            
            <form onSubmit={(e) => { handleOrderSubmit(e); setTimeout(fetchMyOrders, 1000); }} className="form-group">
              <div className="input-group-fixed">
                <label>የድርጅትዎ ስም</label>
                <input type="text" name="name" placeholder="ለምሳሌ፦ አቢሲኒያ ቴክ" value={formData.name} onChange={handleContactChange} required className="input-field" />
              </div>

              <div className="input-group-fixed">
                <label>ኢሜይል (አይቀየርም)</label>
                <input type="email" name="email" value={formData.email = user.email} disabled className="input-field order-disabled-input" />
              </div>

              <div className="input-group-fixed">
                <label>የስራው ዝርዝር መግለጫ</label>
                <textarea name="message" placeholder="ሊሰራልዎት የሚፈልጉትን ስራ ወይም ሲስተም በዝርዝር ይጻፉ..." value={formData.message} onChange={handleContactChange} required className="textarea-field order-textarea"></textarea>
              </div>

              <button type="submit" className="submit-btn order-submit-btn-fixed">🚀 ትዕዛዝ ያስገቡ</button>
              {status && <p className="order-success-msg">✨ {status}</p>}
            </form>
          </div>
        </div>

        {/* 2. የቀኝ ክፍል፦ የላኳቸው ማዘዣዎች ሰሌዳ */}
        <div className="order-history-wrapper">
          <h3 className="order-section-title">📋 የላኳቸው ማዘዣዎች እና ምላሾች</h3>
          <div className="order-cards-list">
            {myOrders.map((order) => (
              <div key={order._id} className="card order-status-card fade-in">
                <div className="order-card-header">
                  <span className="order-date-badge">📅 {new Date().toLocaleDateString()}</span>
                  <span className={order.status === 'ምላሽ ተሰጥቷል' ? 'status-replied-tag' : 'status-pending-tag'}>
                    {order.status === 'ምላሽ ተሰጥቷል' ? '● ምላሽ ተሰጥቷል' : '○ በመጠባበቅ ላይ'}
                  </span>
                </div>
                
                <div className="order-card-body">
                  <p className="order-msg-text"><strong>የእርስዎ ማዘዣ፦</strong> {order.message}</p>
                </div>

                {order.reply && (
                  <div className="order-reply-box-fix">
                    <p className="order-reply-inner">
                      <strong>👑 የአድሚን ምላሽ፦</strong> {order.reply}
                    </p>
                  </div>
                )}
              </div>
            ))}
            
            {myOrders.length === 0 && (
              <div className="order-empty-box">
                <p className="order-empty-text">እስካሁን ምንም ያስገቡት የሶ프트ዌር ትዕዛዝ የለም።</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default OrderPage;