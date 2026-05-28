import React, { useEffect, useState } from 'react';
import './OrderPage.css';

function OrderPage({ user, handleLogout, formData, handleContactChange, handleOrderSubmit, status, logoImg, API_BASE_URL }) {
  const [myOrders, setMyOrders] = useState([]);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    fetchMyOrders();
    const interval = setInterval(() => { fetchMyOrders(); }, 5000);
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

  // ✏️ መልዕክት ለማስተካከል (Edit)
  const handleEditSubmit = async (orderId) => {
    if (!editText.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/orders/edit/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: editText })
      });
      const data = await res.json();
      if (data.success || res.ok) {
        alert('መልዕክቱ ተስተካክሏል!');
        setEditingOrderId(null);
        fetchMyOrders();
      }
    } catch (err) {
      alert('ማስተካከል አልተሳካም፤ (ማስታወሻ፦ ባክኤንድ ኤፒአይ ያስፈልገዋል)');
    }
  };

  // 🗑️ መልዕክት ለማጥፋት (Delete)
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("ይህንን መልዕክት በእርግጥ ማጥፋት ይፈልጋሉ?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/orders/delete/${orderId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success || res.ok) {
        alert('መልዕክቱ ጠፍቷል!');
        fetchMyOrders();
      }
    } catch (err) {
      alert('ማጥፋት አልተሳካም፤ (ማስታወሻ፦ ባክኤንድ ኤፒአይ ያስፈልገዋል)');
    }
  };

  return (
    <div className="order-page-container">
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

      <div className="order-main-grid">
        <div className="order-form-wrapper">
          <div className="order-card-form">
            <h2 className="order-form-title">🛒 አዲስ የሶ프트ዌር ማዘዣ</h2>
            <p className="order-form-subtitle">ሊሰሩ ያሰቡትን ሶፍትዌር ዝርዝር እዚህ ያስገቡ</p>
            
            <form onSubmit={(e) => { handleOrderSubmit(e); setTimeout(fetchMyOrders, 1000); }} className="form-group">
              <div className="input-group-fixed">
                <label>የድርጅትዎ ስም</label>
                <input type="text" name="name" placeholder="ለምሳሌ፦ አቢሲኒያ ቴክ" value={formData.name} onChange={handleContactChange} required className="input-field" />
              </div>
              <div className="input-group-fixed">
                <label>ኢሜይል</label>
                <input type="email" name="email" value={formData.email = user.email} disabled className="input-field order-disabled-input" />
              </div>
              <div className="input-group-fixed">
                <label>የስራው ዝርዝር መግለጫ</label>
                <textarea name="message" placeholder="ሊሰራልዎት የሚፈልጉትን ስራ በዝርዝር ይጻፉ..." value={formData.message} onChange={handleContactChange} required className="textarea-field order-textarea"></textarea>
              </div>
              <button type="submit" className="submit-btn order-submit-btn-fixed">🚀 ትዕዛዝ ያስገቡ</button>
              {status && <p className="order-success-msg">✨ {status}</p>}
            </form>
          </div>
        </div>

        {/* 💬 የቴሌግራም ቻት ክፍል */}
        <div className="order-history-wrapper">
          <h3 className="order-section-title">💬 ከባለሙያ ጋር የተደረገ ውይይት</h3>
          <div className="chat-container">
            <div className="chat-messages-box">
              {myOrders.map((order) => (
                <div key={order._id} className="chat-group">
                  
                  {/* የተጠቃሚው መልዕክት (በቀኝ በኩል) */}
                  <div className="chat-bubble user-bubble">
                    {editingOrderId === order._id ? (
                      <div className="chat-edit-inline-form">
                        <input type="text" value={editText} onChange={(e) => setEditText(e.target.value)} className="input-field chat-edit-input" />
                        <button onClick={() => handleEditSubmit(order._id)} className="chat-edit-save-btn">✔</button>
                        <button onClick={() => setEditingOrderId(null)} className="chat-edit-cancel-btn">✖</button>
                      </div>
                    ) : (
                      <>
                        <p className="chat-text">{order.message}</p>
                        <div className="user-bubble-actions">
                          {/* አድሚኑ መልስ ካልሰጠ ገና ማስተካከልና ማጥፋት ይቻላል */}
                          {!order.reply && (
                            <div className="bubble-action-buttons">
                              <span className="action-icon-btn" title="ማስተካከያ" onClick={() => { setEditingOrderId(order._id); setEditText(order.message); }}>✏</span>
                              <span className="action-icon-btn delete-icon-btn" title="ማጥፊያ" onClick={() => handleDeleteOrder(order._id)}>🗑</span>
                            </div>
                          )}
                          <span className="chat-time">📅 {new Date(order.date || Date.now()).toLocaleDateString()}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* የአድሚኑ መልዕክት (በግራ በኩል) */}
                  {order.reply ? (
                    <div className="chat-bubble admin-bubble">
                      <span className="chat-sender-name">👑 Max Technology Admin</span>
                      <p className="chat-text">{order.reply}</p>
                      <span className="chat-time">ምላሽ ተሰጥቷል</span>
                    </div>
                  ) : (
                    <div className="chat-status-pending">
                      <span>⏳ አድሚኑ መልዕክትዎን እያየው ነው...</span>
                    </div>
                  )}

                </div>
              ))}

              {myOrders.length === 0 && (
                <div className="chat-empty">
                  <p>እስካሁን ምንም የተደረገ ውይይት የለም። አዲስ ትዕዛዝ ሲያስገቡ ቻቱ እዚህ ይጀምራል!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderPage;