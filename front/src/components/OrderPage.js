import React, { useEffect, useState } from 'react';
import './OrderPage.css'; // 👈 አዲሱ የስታይል ፋይል ማገናኛ

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
      {/* የላይኛው መገናኛ ባር (Navbar) */}
      <nav className="navbar order-navbar">
        <div className="logo-container">
          <img src={logoImg} alt="Logo" className="logo-image order-logo-fix" />
          <span className="logo-text">Max Technology</span>
        </div>
        <div className="nav-links order-user-actions">
          <span className="order-user-badge">👤 {user.name}</span>
          <button onClick={handleLogout} className="btn-logout order-logout-btn">ውጣ</button>
        </div>
      </nav>

      {/* ማዘዣ ፎርም */}
      <section className="contact-form order-form-container">
        <h2 className="order-form-title">🛒 አዲስ የሶ프트ዌር ማዘዣ</h2>
        <form onSubmit={(e) => { handleOrderSubmit(e); setTimeout(fetchMyOrders, 1000); }} className="form-group">
          <input type="text" name="name" placeholder="የድርጅትዎ ስም" value={formData.name} onChange={handleContactChange} required className="input-field" />
          <input type="email" name="email" value={formData.email = user.email} disabled className="input-field order-disabled-input" />
          <textarea name="message" placeholder="ሊሰራልዎት የሚፈልጉትን ስራ ዝርዝር..." value={formData.message} onChange={handleContactChange} required className="textarea-field order-textarea"></textarea>
          <button type="submit" className="submit-btn">ትዕዛዝ ያስገቡ</button>
          {status && <p className="status-msg order-success-msg">{status}</p>}
        </form>
      </section>

      {/* የላኳቸው ማዘዣዎች እና የተሰጡ ምላሾች ሰሌዳ */}
      <section className="order-list-section">
        <h3 className="order-section-title">📋 የላኳቸው ማዘዣዎች እና ከአድሚን የተሰጡ ምላሾች</h3>
        <div className="order-cards-list">
          {myOrders.map((order) => (
            <div key={order._id} className="card order-status-card zoom-in">
              <p className="order-msg-text"><strong>የእርስዎ ማዘዣ፦</strong> {order.message}</p>
              <p className="order-status-text">
                <strong>ሁኔታ (Status)፦</strong>{' '}
                <span className={order.status === 'ምላሽ ተሰጥቷል' ? 'status-replied-tag' : 'status-pending-tag'}>
                  {order.status}
                </span>
              </p>
              {order.reply && (
                <div className="reply-box order-reply-box-fix">
                  <p className="order-reply-inner"><strong>👑 የአድሚን ምላሽ፦</strong> {order.reply}</p>
                </div>
              )}
            </div>
          ))}
          {myOrders.length === 0 && <p className="order-empty-text">እስካሁን ምንም ያስገቡት ትዕዛዝ የለም።</p>}
        </div>
      </section>
    </div>
  );
}

export default OrderPage;