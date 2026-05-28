import React, { useState, useEffect, useMemo } from 'react';
import './AdminDashboard.css';

function AdminDashboard({ user, handleLogout, adminMessages, fetchMessages, newAdminForm, handleNewAdminChange, handleAddAdminSubmit, adminAddStatus, API_BASE_URL, handleDeleteMessage }) {
  const [replyText, setReplyText] = useState({});
  const [adminList, setAdminList] = useState([]);
  
  // 👥 ለአድሚን የደንበኛ መምረጫ ስቴት (Telegram Style)
  const [selectedUserEmail, setSelectedUserEmail] = useState(null);

  useEffect(() => {
    fetchMessages();
    fetchAdmins();
    const interval = setInterval(() => { fetchMessages(); }, 5000); 
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔄 የ uniqueUsers ማስጠንቀቂያን በuseMemo ለመፍታት የተደረገ ማስተካከያ
  const uniqueUsers = useMemo(() => {
    const users = [];
    const seenEmails = new Set();
    adminMessages.forEach(msg => {
      if (!seenEmails.has(msg.email)) {
        seenEmails.add(msg.email);
        users.push({ name: msg.name, email: msg.email });
      }
    });
    return users;
  }, [adminMessages]);

  // አድሚኑ መጀመሪያ ገጹን ሲከፍት የመጀመሪያውን ሰው እንዲመርጥ ማድረግ
  useEffect(() => {
    if (uniqueUsers.length > 0 && !selectedUserEmail) {
      setSelectedUserEmail(uniqueUsers[0].email);
    }
  }, [uniqueUsers, selectedUserEmail]);

  // የተመረጠው ሰው የላካቸው መልዕክቶች ብቻ ማጣሪያ
  const filteredMessages = adminMessages.filter(msg => msg.email === selectedUserEmail);

  const fetchAdmins = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/list`);
      const data = await res.json();
      if (data.success) setAdminList(data.admins);
    } catch (err) {
      console.error('የአድሚኖችን ዝርዝር ማምጣት አልተቻለም');
    }
  };

  const handleReplySubmit = async (id) => {
    if (!replyText[id]) return alert('እባክዎ መጀመሪያ መልስ ይጻፉ!');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/reply/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: replyText[id] })
      });
      const data = await res.json();
      if (data.success) {
        alert('ምላሽ በተሳካ ሁኔታ ተልኳል!');
        fetchMessages();
      }
    } catch (err) {
      alert('ስህተት ገጥሟል');
    }
  };

  return (
    <div className="admin-dashboard-container">
      <div className="admin-header">
        <h2>👑 የባለሙያ መቆጣጠሪያ ሰሌዳ (Admin Panel)</h2>
        <button onClick={handleLogout} className="btn-logout">ውጣ (Logout)</button>
      </div>
      <p className="admin-welcome-text">እንኳን ደህና መጣህ፣ አድሚን <strong>{user.name}</strong>!</p>

      {/* የረዳት አድሚኖች ክፍል */}
      <div className="grid admin-grid-gap">
        <div className="card admin-form-card">
          <h3>➕ ረዳት አድሚን ይጨምሩ</h3>
          <form onSubmit={(e) => { handleAddAdminSubmit(e); setTimeout(fetchAdmins, 1000); }} className="form-group admin-form-top">
            <input type="text" name="name" placeholder="የአዲሱ አድሚን ስም" value={newAdminForm.name} onChange={handleNewAdminChange} required className="input-field admin-input-bottom" />
            <input type="text" name="email" placeholder="የአድሚን ዩዘርኔም" value={newAdminForm.email} onChange={handleNewAdminChange} required className="input-field admin-input-bottom" />
            <input type="password" name="password" placeholder="የምስጢር ቃል" value={newAdminForm.password} onChange={handleNewAdminChange} required className="input-field admin-input-large-bottom" />
            <button type="submit" className="submit-btn">አድሚኑን መዝግብ</button>
          </form>
        </div>

        <div className="card admin-table-card">
          <h3>📋 የተመዘገቡ አድሚኖች ዝርዝር</h3>
          <table className="custom-table responsive-table">
            <thead>
              <tr><th>ስም</th><th>ዩዘርኔም</th></tr>
            </thead>
            <tbody>
              {adminList.map((adm) => (
                <tr key={adm._id}>
                  <td data-label="ስም"><strong>{adm.name}</strong></td>
                  <td data-label="ዩዘርኔም">{adm.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 💬 የቴሌግራም ስማርት መልዕክት ክፍል (User Split Mode) */}
      <h3 className="admin-section-heading">💬 የደንበኞች የቻት ማዘዣዎች (Telegram Split Mode)</h3>
      
      <div className="telegram-admin-layout">
        
        {/* 👥 የግራ ሳይድባር፦ የደንበኞች ስም ዝርዝር (Chat List) */}
        <div className="telegram-sidebar">
          <div className="sidebar-header">👥 ውይይቶች ({uniqueUsers.length})</div>
          <div className="sidebar-users-list">
            {uniqueUsers.map((u) => (
              <div 
                key={u.email} 
                className={`sidebar-user-item ${selectedUserEmail === u.email ? 'active-chat-user' : ''}`}
                onClick={() => setSelectedUserEmail(u.email)}
              >
                <span className="sidebar-avatar">👤</span>
                <div className="sidebar-user-details">
                  <h4>{u.name}</h4>
                  <p>{u.email}</p>
                </div>
              </div>
            ))}
            {uniqueUsers.length === 0 && <p className="no-chats-text">ምንም ንቁ ቻት የለም</p>}
          </div>
        </div>

        {/* ✉ የቀኝ ሳይድባር፦ የተመረጠው ሰው የቻት ሳጥን (Active Chat Window) */}
        <div className="telegram-chat-window">
          {selectedUserEmail ? (
            <>
              <div className="chat-window-header">
                💬 የ <strong>{uniqueUsers.find(u => u.email === selectedUserEmail)?.name}</strong> የትዕዛዝ መልዕክቶች
              </div>
              
              <div className="chat-window-body">
                {filteredMessages.map((msg) => (
                  <div key={msg._id} className="admin-chat-block">
                    {/* የደንበኛው መልዕክት */}
                    <div className="admin-user-msg-bubble">
                      <p>{msg.message}</p>
                      <span className="chat-block-time">📅 {new Date(msg.date).toLocaleDateString()}</span>
                    </div>

                    {/* የአድሚን ምላሽ */}
                    {msg.reply ? (
                      <div className="admin-reply-msg-bubble">
                        <span className="reply-label">የእርስዎ ምላሽ፦</span>
                        <p>{msg.reply}</p>
                      </div>
                    ) : (
                      <div className="admin-chat-input-area">
                        <input 
                          type="text" 
                          placeholder="እዚህ ምላሽ ይጻፉ..." 
                          onChange={(e) => setReplyText({ ...replyText, [msg._id]: e.target.value })} 
                          className="input-field admin-chat-input"
                        />
                        <button onClick={() => handleReplySubmit(msg._id)} className="btn-action btn-reply">🚀 ላክ</button>
                      </div>
                    )}
                    
                    <div className="admin-msg-delete-row">
                      <button onClick={() => handleDeleteMessage(msg._id)} className="admin-delete-msg-btn">🗑 አጥፋ</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="select-chat-placeholder">
              <p>የማንን ደንበኛ ማዘዣ ማየት እንደሚፈልጉ ከግራ በኩል ይምረጡ።</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;