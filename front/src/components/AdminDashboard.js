import React, { useState, useEffect, useMemo } from 'react';
import './AdminDashboard.css';

function AdminDashboard({ user, handleLogout, adminMessages, fetchMessages, newAdminForm, handleNewAdminChange, handleAddAdminSubmit, adminAddStatus, API_BASE_URL, handleDeleteMessage }) {
  const [replyText, setReplyText] = useState({});
  const [adminList, setAdminList] = useState([]);
  const [userList, setUserList] = useState([]); // 👥 አጠቃላይ የተጠቃሚዎች ዝርዝር
  const [activeTab, setActiveTab] = useState('messages'); // messages, admins, users

  // 📝 ለአድሚን መረጃ ማስተካከያ ስቴቶች
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [passwordReset, setPasswordReset] = useState({ id: '', newPassword: '' });

  // 👥 ለአድሚን የደንበኛ መምረጫ ስቴት (Telegram Style)
  const [selectedUserEmail, setSelectedUserEmail] = useState(null);

  useEffect(() => {
    fetchMessages();
    fetchAdmins();
    fetchUsers();
    const interval = setInterval(() => { fetchMessages(); }, 5000); 
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // የ uniqueUsers ማጣሪያ (ከመልዕክቶች ተነስተው የሚመጡ ንቁ ቻቶች)
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

  useEffect(() => {
    if (uniqueUsers.length > 0 && !selectedUserEmail) {
      setSelectedUserEmail(uniqueUsers[0].email);
    }
  }, [uniqueUsers, selectedUserEmail]);

  const filteredMessages = adminMessages.filter(msg => msg.email === selectedUserEmail);

  // 🔄 ሁሉንም አድሚኖች ማምጫ
  const fetchAdmins = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/list`);
      const data = await res.json();
      if (data.success) setAdminList(data.admins);
    } catch (err) {
      console.error('የአድሚኖችን ዝርዝር ማምጣት አልተቻለም');
    }
  };

  // 🔄 ሁሉንም ተጠቃሚዎች (Regular Users) ማምጫ
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`);
      const data = await res.json();
      if (data.success) setUserList(data.users);
    } catch (err) {
      console.error('የተጠቃሚዎችን ዝርዝር ማምጣት አልተቻለም');
    }
  };

  // 🚀 ምላሽ የመላኪያ ፋንክሽን
  const handleReplySubmit = async (id) => {
    const currentReplyText = replyText[id];
    if (!currentReplyText || !currentReplyText.trim()) return alert('እባክዎ መጀመሪያ መልስ ይጻፉ!');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/reply/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: currentReplyText })
      });
      const data = await res.json();
      if (data.success) {
        alert('ምላሽ በተሳካ ሁኔታ ተልኳል!');
        setReplyText(prev => ({ ...prev, [id]: '' })); // የጻፍነውን ማጽዳት
        fetchMessages();
      }
    } catch (err) {
      alert('ስህተት ገጥሟል');
    }
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/update/${editingAdmin}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        alert('የአድሚን መረጃ ተስተካክሏል!');
        setEditingAdmin(null);
        fetchAdmins();
      }
    } catch (err) {
      alert('ማስተካከል አልተሳካም');
    }
  };

  const handleResetPassword = async (id) => {
    if (!passwordReset.newPassword || passwordReset.id !== id) return alert('እባክዎ መጀመሪያ አዲስ ፓስወርድ ይጻፉ!');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/reset-password/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: passwordReset.newPassword })
      });
      if (res.ok) {
        alert('የአድሚኑ ፓስወርድ በተሳካ ሁኔታ ተቀይሯል!');
        setPasswordReset({ id: '', newPassword: '' });
      }
    } catch (err) {
      alert('ፓስወርድ መቀየር አልተቻለም');
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (!window.confirm("ይህንን ረዳት አድሚን በእርግጥ ማጥፋት ይፈልጋሉ?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/delete/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('አድሚኑ ተሰርዟል!');
        fetchAdmins();
      }
    } catch (err) {
      alert('ማጥፋት አልተሳካም');
    }
  };

  // 🚫 ተጠቃሚን ብሎክ/አንብሎክ ለማድረግ (Block/Unblock User)
  const handleToggleBlockUser = async (id, isBlocked) => {
    const actionText = isBlocked ? "ከእገዳ ማንሳት" : "ማገድ (Block)";
    if (!window.confirm(`ይህንን ተጠቃሚ በእርግጥ ${actionText} ይፈልጋሉ?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/block/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked: !isBlocked })
      });
      if (res.ok) {
        alert(`ተጠቃሚው በተሳካ ሁኔታ ${isBlocked ? 'ከእገዳ ተነስቷል' : 'ታግዷል'}!`);
        fetchUsers();
      }
    } catch (err) {
      alert('የብሎክ እርምጃው አልተሳካም');
    }
  };

  // 🗑️ ተጠቃሚን ሙሉ በሙሉ ለማጥፋት (Delete User Account)
  const handleDeleteUser = async (id) => {
    if (!window.confirm("ይህንን ተጠቃሚ አካውንት ሙሉ በሙሉ ማጥፋት ይፈልጋሉ? ይህ ድርጊት አይመለስም!")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/delete/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('ተጠቃሚው ሙሉ በሙሉ ተሰርዟል!');
        fetchUsers();
      }
    } catch (err) {
      alert('ተጠቃሚውን ማጥፋት አልተቻለም');
    }
  };

  return (
    <div className="admin-dashboard-container">
      <div className="admin-header">
        <h2>👑 የባለሙያ መቆጣጠሪያ ሰሌዳ (Admin Panel)</h2>
        <button onClick={handleLogout} className="btn-logout">ውጣ (Logout)</button>
      </div>

      {/* 🗂️ ታብ መምረጫ ቁልፎች (Tab Navigation) */}
      <div className="admin-tabs-nav">
        <button className={`tab-nav-btn ${activeTab === 'messages' ? 'active-tab' : ''}`} onClick={() => setActiveTab('messages')}>💬 መልዕክቶች እና ቻት</button>
        <button className={`tab-nav-btn ${activeTab === 'admins' ? 'active-tab' : ''}`} onClick={() => setActiveTab('admins')}>👥 አድሚኖች ማስተዳደሪያ</button>
        <button className={`tab-nav-btn ${activeTab === 'users' ? 'active-tab' : ''}`} onClick={() => setActiveTab('users')}>👤 ደንበኞች ማስተዳደሪያ</button>
      </div>

      {/* 1️⃣ ታብ 1፦ የቴሌግራም ቻት መልዕክቶች */}
      {activeTab === 'messages' && (
        <>
          <h3 className="admin-section-heading">💬 የደንበኞች የቻት ማዘዣዎች (Telegram Split Mode)</h3>
          <div className="telegram-admin-layout">
            
            {/* 👥 የግራ ሳይድባር፦ የደንበኞች ዝርዝር */}
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

            {/* ✉ የቀኝ ክፍል፦ የተመረጠው ሰው የቻት ሳጥን */}
            <div className="telegram-chat-window">
              {selectedUserEmail ? (
                <>
                  <div className="chat-window-header">
                    💬 የ <strong>{uniqueUsers.find(u => u.email === selectedUserEmail)?.name}</strong> የትዕዛዝ መልዕክቶች
                  </div>
                  <div className="chat-window-body">
                    {filteredMessages.map((msg) => (
                      <div key={msg._id} className="admin-chat-block">
                        <div className="admin-user-msg-bubble">
                          <p>{msg.message}</p>
                          <span className="chat-block-time">📅 {new Date(msg.date).toLocaleDateString()}</span>
                        </div>
                        
                        {msg.reply ? (
                          <div className="admin-reply-msg-bubble">
                            <span className="reply-label">የእርስዎ ምላሽ፦</span>
                            <p>{msg.reply}</p>
                          </div>
                        ) : (
                          /* 🚀 ምላሽ መጻፊያ እና መላኪያ ቁልፍ የተስተካከለው ክፍል */
                          <div className="admin-chat-input-area" style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                            <input 
                              type="text" 
                              placeholder="እዚህ ምላሽ ይጻፉ..." 
                              value={replyText[msg._id] || ''}
                              onChange={(e) => setReplyText({ ...replyText, [msg._id]: e.target.value })} 
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleReplySubmit(msg._id);
                                }
                              }}
                              className="input-field admin-chat-input"
                              style={{ flex: 1, padding: '12px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '8px' }}
                            />
                            <button 
                              onClick={() => handleReplySubmit(msg._id)} 
                              className="btn-action btn-reply"
                              style={{ background: '#ffd700', color: '#111', padding: '0 20px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                              🚀 ላክ
                            </button>
                          </div>
                        )}
                        <div className="admin-msg-delete-row">
                          <button onClick={() => handleDeleteMessage(msg._id)} className="admin-delete-msg-btn">🗑 መልዕክቱን አጥፋ</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="select-chat-placeholder"><p>የማንን ደንበኛ ማዘዣ ማየት እንደሚፈልጉ ከግራ በኩል ይምረጡ።</p></div>
              )}
            </div>
          </div>
        </>
      )}

      {/* 2️⃣ ታብ 2፦ የአድሚኖች ማስተዳደሪያ */}
      {activeTab === 'admins' && (
        <div className="grid admin-grid-gap">
          <div className="card admin-form-card">
            <h3>➕ ረዳት አድሚን ይጨምሩ</h3>
            <form onSubmit={(e) => { handleAddAdminSubmit(e); setTimeout(fetchAdmins, 1000); }} className="form-group admin-form-top">
              <input type="text" name="name" placeholder="የአዲሱ አድሚን ስም" value={newAdminForm.name} onChange={handleNewAdminChange} required className="input-field admin-input-bottom" />
              <input type="text" name="email" placeholder="የአድሚን ዩዘርኔም" value={newAdminForm.email} onChange={handleNewAdminChange} required className="input-field admin-input-bottom" />
              <input type="password" name="password" placeholder="የምስጢር ቃል" value={newAdminForm.password} onChange={handleNewAdminChange} required className="input-field admin-input-large-bottom" />
              <button type="submit" className="submit-btn">አድሚኑን መዝግብ</button>
            </form>
            {adminAddStatus && <p className="status-msg">{adminAddStatus}</p>}
          </div>

          <div className="card admin-table-card">
            <h3>📋 የተመዘገቡ አድሚኖች ዝርዝር</h3>
            <table className="custom-table responsive-table">
              <thead>
                <tr><th>ስም</th><th>ዩዘርኔም</th><th>የፓስወርድ ማስተካከያ</th><th>እርምጃ</th></tr>
              </thead>
              <tbody>
                {adminList.map((adm) => (
                  <tr key={adm._id}>
                    <td data-label="ስም"><strong>{adm.name}</strong></td>
                    <td data-label="ዩዘርኔም">{adm.email}</td>
                    <td data-label="የፓስወርድ ማስተካከያ">
                      <div className="admin-inline-flex admin-wrap-fix">
                        <input type="text" placeholder="አዲስ ፓስወርድ" value={passwordReset.id === adm._id ? passwordReset.newPassword : ''} onChange={(e) => setPasswordReset({ id: adm._id, newPassword: e.target.value })} className="input-field admin-table-input" />
                        <button onClick={() => handleResetPassword(adm._id)} className="btn-action btn-edit btn-padding-fix">ቀይር</button>
                      </div>
                    </td>
                    <td data-label="እርምጃ">
                      <div className="admin-inline-flex">
                        <button onClick={() => { setEditingAdmin(adm._id); setEditForm({ name: adm.name, email: adm.email }); }} className="btn-action btn-reply btn-padding-fix">✏</button>
                        <button onClick={() => handleDeleteAdmin(adm._id)} className="btn-action btn-delete btn-padding-fix">🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3️⃣ ታብ 3፦ የተጠቃሚዎች ማስተዳደሪያ */}
      {activeTab === 'users' && (
        <div className="card admin-full-width-card">
          <h3>👤 የተመዘገቡ ደንበኞች ማስተዳደሪያ (የብሎክ እና ማጥፊያ ሰሌዳ)</h3>
          <table className="custom-table responsive-table">
            <thead>
              <tr>
                <th>የደንበኛ ስም</th>
                <th>ኢሜይል አድራሻ</th>
                <th>ሁኔታ (Status)</th>
                <th>እርምጃዎች</th>
              </tr>
            </thead>
            <tbody>
              {userList.map((u) => (
                <tr key={u._id} className={u.isBlocked ? "blocked-user-row" : ""}>
                  <td data-label="የደንበኛ ስም"><strong>{u.name}</strong></td>
                  <td data-label="ኢሜይል አድራሻ">{u.email}</td>
                  <td data-label="ሁኔታ">
                    <span className={`status-badge ${u.isBlocked ? "badge-blocked" : "badge-active"}`}>
                      {u.isBlocked ? "🚫 የታገደ" : "✔ ንቁ (Active)"}
                    </span>
                  </td>
                  <td data-label="እርምጃዎች">
                    <div className="admin-inline-flex">
                      <button 
                        onClick={() => handleToggleBlockUser(u._id, u.isBlocked)} 
                        className={`btn-action ${u.isBlocked ? "btn-unblock" : "btn-block-action"}`}
                        style={{ padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        {u.isBlocked ? "🔓 እገዳ አንሳ" : "🚫 እገድ"}
                      </button>
                      <button onClick={() => handleDeleteUser(u._id)} className="btn-action btn-delete" style={{ padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>🗑 አካውንት አጥፋ</button>
                    </div>
                  </td>
                </tr>
              ))}
              {userList.length === 0 && (
                <tr><td colSpan="4" className="admin-empty-text">ምንም የተመዘገበ ደንበኛ አልተገኘም።</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 📝 መረጃ ማስተካከያ ብቅ ባይ (Modal) */}
      {editingAdmin && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>📝 መረጃ ማስተካከያ</h3>
            <form onSubmit={handleUpdateAdmin} className="form-group admin-form-top">
              <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required className="input-field" />
              <input type="text" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} required className="input-field" />
              <div className="admin-inline-flex admin-form-top">
                <button type="submit" className="btn-action btn-reply btn-flex-one">አስቀምጥ</button>
                <button type="button" onClick={() => setEditingAdmin(null)} className="btn-action btn-delete btn-flex-one">አቁም</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;