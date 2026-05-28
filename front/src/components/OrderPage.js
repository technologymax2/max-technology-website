import React, { useEffect, useState } from 'react';
import './OrderPage.css';
import Footer from './Footer';

function OrderPage({ user, handleLogout, formData, handleContactChange, handleOrderSubmit, status, logoImg, API_BASE_URL }) {
  const [myOrders, setMyOrders] = useState([]);
  
  // ✏️ ለማስተካከያ (Edit) የሚያስፈልጉ ስቴቶች
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    fetchMyOrders();

    // በየ 5 ሰከንዱ አዲስ መልዕክት ወይም ምላሽ ካለ ቻቱን ማደስ
    const interval = setInterval(() => {
      fetchMyOrders();
    }, 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔄 የዚህን ተጠቃሚ ማዘዣዎች (ውይይቶች) ብቻ ከባክኤንድ ማምጫ
  const fetchMyOrders = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/orders/${user.email}`);
      const data = await res.json();
      if (data.success) setMyOrders(data.orders);
    } catch (err) {
      console.error('ማዘዣዎችን ማምጣት አልተቻለም');
    }
  };

  // ✏️ የተላከን መልዕክት ለማስተካከል (Update Process)
  const handleEditSubmit = async (orderId) => {
    if (!editText.trim()) return alert('እባክዎ መጀመሪያ መልዕክት ይጻፉ!');
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/orders/edit/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: editText })
      });
      const data = await res.json();
      if (data.success || res.ok) {
        alert('መልዕክትዎ ተስተካክሏል!');
        setEditingOrderId(null); // የማስተካከያ ሳጥኑን መዝጋት
        fetchMyOrders(); // ቻቱን ማደስ
      }
    } catch (err) {
      alert('ማስተካከል አልተሳካም፤ እባክዎ የባክኤንድ ኤፒአይ መኖሩን ያረጋግጡ።');
    }
  };

  // 🗑️ የተላከን መልዕክት ሙሉ በሙሉ ለማጥፋት (Delete Process)
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("ይህንን መልዕክት በእርግጥ ማጥፋት ይፈልጋሉ? ከሁለታችሁም ቻት ላይ ይጠፋል።")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/orders/delete/${orderId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success || res.ok) {
        alert('መልዕክትዎ ጠፍቷል!');
        fetchMyOrders(); // ቻቱን ማደስ
      }
    } catch (err) {
      alert('ማጥፋት አልተሳካም፤ እባክዎ የባክኤንድ ኤፒአይ መኖሩን ያረጋግጡ።');
    }
  };

  return (
    <div className="order-page-container">
      {/* 🔝 የላይኛው ናቭባር (Navbar) */}
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

      {/* 🔲 ዋናው መዋቅር (Main Grid) */}
      <div className="order-main-grid">
        
        {/* 1️⃣ የግራ ክፍል፦ አዲስ ማዘዣ ፎርም */}
        <div className="order-form-wrapper">
          <div className="order-card-form">
            <h2 className="order-form-title">🛒 አዲስ የሶፍትዌር ማዘዣ</h2>
            <p className="order-form-subtitle">ሊሰሩ ያሰቡትን ሶፍትዌር ዝርዝር እዚህ ያስገቡ</p>
            
          <form onSubmit={(e) => { handleOrderSubmit(e); setTimeout(fetchMyOrders, 1000); }} className="form-group">
  
  {/* 👤 ስም (አይቀየርም - አካውንት ሲከፍት የተመዘገበበት ስም ቀጥታ ይገባል) */}
  <div className="input-group-fixed">
    <label>የደንበኛ ስም </label>
    <input 
      type="text" 
      name="name" 
      value={formData.name = user.name} // 👈 እዚህ ጋር ከተጠቃሚው አካውንት ስሙን ቀጥታ ይወስዳል
      disabled 
      className="input-field order-disabled-input" 
    />
  </div>

  {/* 📧 ኢሜይል (አይቀየርም) */}
  <div className="input-group-fixed">
    <label>ኢሜይል </label>
    <input 
      type="email" 
      name="email" 
      value={formData.email = user.email} 
      disabled 
      className="input-field order-disabled-input" 
    />
  </div>

  {/* 📝 የላኪው መልዕክት */}
  <div className="input-group-fixed">
    <label>የስራው ዝርዝር መግለጫ</label>
    <textarea 
      name="message" 
      placeholder="ሊሰራልዎት የሚፈልጉትን ስራ ወይም ሲስተም በዝርዝር ይጻፉ..." 
      value={formData.message} 
      onChange={handleContactChange} 
      required 
      className="textarea-field order-textarea"
    ></textarea>
  </div>

  <button type="submit" className="submit-btn order-submit-btn-fixed">🚀 ትዕዛዝ ያስገቡ</button>
  {status && <p className="order-success-msg">✨ {status}</p>}
</form>
          </div>
        </div>

        {/* 2️⃣ የቀኝ ክፍል፦ የቴሌግራም ስታይል የቻት ታሪክ */}
        <div className="order-history-wrapper">
          <h3 className="order-section-title">💬 ከባለሙያ ጋር የተደረገ ውይይት</h3>
          <div className="chat-container">
            <div className="chat-messages-box">
              {myOrders.map((order) => (
                <div key={order._id} className="chat-group">
                  
                  {/* 🟢 የተጠቃሚው መልዕክት ባብል (በቀኝ በኩል) */}
                  <div className="chat-bubble user-bubble">
                    {editingOrderId === order._id ? (
                      /* ✏️ ማስተካከያ ቁልፍ ሲጫን የሚመጣ የውስጥ ፎርም (Inline Edit) */
                      <div className="chat-edit-inline-form">
                        <input 
                          type="text" 
                          value={editText} 
                          onChange={(e) => setEditText(e.target.value)} 
                          className="input-field chat-edit-input" 
                        />
                        <button onClick={() => handleEditSubmit(order._id)} className="chat-edit-save-btn">✔</button>
                        <button onClick={() => setEditingOrderId(null)} className="chat-edit-cancel-btn">✖</button>
                      </div>
                    ) : (
                      /* መደበኛ የተላከ መልዕክት እይታ */
                      <>
                        <p className="chat-text">{order.message}</p>
                        <div className="user-bubble-actions">
                          
                          {/* 🔐 ጥበቃ፦ አድሚኑ መልስ ካልጻፈበት ብቻ ማስተካከል እና ማጥፋት ይቻላል */}
                          {!order.reply && (
                            <div className="bubble-action-buttons">
                              <span className="action-icon-btn" title="ማስተካከያ (Edit)" onClick={() => { setEditingOrderId(order._id); setEditText(order.message); }}>✏️</span>
                              <span className="action-icon-btn delete-icon-btn" title="ማጥፊያ (Delete)" onClick={() => handleDeleteOrder(order._id)}>🗑️</span>
                            </div>
                          )}
                          <span className="chat-time">📅 {new Date(order.date || Date.now()).toLocaleDateString()}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* 🟡 የአድሚኑ ምላሽ ባብል (በግራ በኩል) */}
                  {order.reply ? (
                    <div className="chat-bubble admin-bubble">
                      <span className="chat-sender-name">👑 Max Technology Admin</span>
                      <p className="chat-text">{order.reply}</p>
                      <span className="chat-time">ምላሽ ተሰጥቷል</span>
                    </div>
                  ) : (
                    /* አድሚኑ ገና ያላየው ከሆነ የሚመጣ ምልክት */
                    <div className="chat-status-pending">
                      <span>⏳ አድሚኑ መልዕክትዎን እያየው ነው...</span>
                    </div>
                  )}

                </div>
              ))}

              {/* መልዕክት ከሌለ የሚታይ */}
              {myOrders.length === 0 && (
                <div className="chat-empty">
                  <p>እስካሁን ምንም የተደረገ ውይይት የለም። አዲስ ትዕዛዝ ሲያስገቡ የቴሌግራም ውይይቱ እዚህ ይጀምራል!</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}

export default OrderPage;