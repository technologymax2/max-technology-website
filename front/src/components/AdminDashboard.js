import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

function AdminDashboard({ user, handleLogout, adminMessages, fetchMessages, newAdminForm, handleNewAdminChange, handleAddAdminSubmit, adminAddStatus, API_BASE_URL, handleDeleteMessage }) {
  const [replyText, setReplyText] = useState({});
  const [adminList, setAdminList] = useState([]);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [passwordReset, setPasswordReset] = useState({ id: '', newPassword: '' });

  useEffect(() => {
    fetchMessages();
    fetchAdmins();

    const interval = setInterval(() => {
      fetchMessages();
    }, 5000); 

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/update/${editingAdmin}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (data.success) {
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
      const data = await res.json();
      if (data.success) {
        alert('የአድሚኑ ፓስወርድ በተሳካ ሁኔታ ተቀይሯል!');
        setPasswordReset({ id: '', newPassword: '' });
      }
    } catch (err) {
      alert('ፓስወርድ መቀየር አልተሳካም');
    }
  };

  return (
    <div className="admin-dashboard-container">
      {/* ራስጌ (Header) */}
      <div className="admin-header">
        <h2>👑 የባለሙያ መቆጣጠሪያ ሰሌዳ (Admin Panel)</h2>
        <button onClick={handleLogout} className="btn-logout">ውጣ (Logout)</button>
      </div>
      <p className="admin-welcome-text">እንኳን ደህና መጣህ፣ አድሚን <strong>{user.name}</strong>!</p>

      <div className="grid admin-grid-gap">
        {/* ሀ. አዲስ አድሚን መመዝገቢያ ፎርም */}
        <div className="card admin-form-card">
          <h3>➕ ረዳት አድሚን ይጨምሩ</h3>
          <form onSubmit={(e) => { handleAddAdminSubmit(e); setTimeout(fetchAdmins, 1000); }} className="form-group admin-form-top">
            <input type="text" name="name" placeholder="የአዲሱ አድሚን ስም" value={newAdminForm.name} onChange={handleNewAdminChange} required className="input-field admin-input-bottom" />
            <input type="text" name="email" placeholder="የአድሚን ዩዘርኔም / ኢሜይል" value={newAdminForm.email} onChange={handleNewAdminChange} required className="input-field admin-input-bottom" />
            <input type="password" name="password" placeholder="የምስጢር ቃል (Password)" value={newAdminForm.password} onChange={handleNewAdminChange} required className="input-field admin-input-large-bottom" />
            <button type="submit" className="submit-btn">አድሚኑን መዝግብ</button>
          </form>
          {adminAddStatus && <p className="status-msg">{adminAddStatus}</p>}
        </div>

        {/* ለ. የተመዘገቡ አድሚኖች ዝርዝር */}
        <div className="card admin-table-card">
          <h3>📋 የተመዘገቡ አድሚኖች ዝርዝር</h3>
          <table className="custom-table responsive-table">
            <thead>
              <tr>
                <th>ስም</th>
                <th>ዩዘርኔም / ኢሜይል</th>
                <th>የፓስወርድ ማስተካከያ</th>
                <th>እርምጃ</th>
              </tr>
            </thead>
            <tbody>
              {adminList.map((adm) => (
                <tr key={adm._id}>
                  <td data-label="ስም"><strong>{adm.name}</strong></td>
                  <td data-label="ዩዘርኔም / ኢሜይል">{adm.email}</td>
                  <td data-label="የፓስወርድ ማስተካከያ">
                    <div className="admin-inline-flex admin-wrap-fix">
                      <input type="text" placeholder="አዲስ ፓስወርድ" onChange={(e) => setPasswordReset({ id: adm._id, newPassword: e.target.value })} className="input-field admin-table-input" />
                      <button onClick={() => handleResetPassword(adm._id)} className="btn-action btn-edit btn-padding-fix">ቀይር</button>
                    </div>
                  </td>
                  <td data-label="እርምጃ">
                    <button onClick={() => { setEditingAdmin(adm._id); setEditForm({ name: adm.name, email: adm.email }); }} className="btn-action btn-reply">አስተካክል</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ሐ. የአድሚን መረጃ ማስተካከያ ብቅ ባይ ፎርም */}
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

      {/* መ. የደንበኞች መልዕክት ማያ እና ምላሽ መስጫ */}
      <h3 className="admin-section-heading">🛒 የደንበኞች ማዘዣዎች ዝርዝር እና ምላሽ መስጫ</h3>
      <table className="custom-table responsive-table">
        <thead>
          <tr>
            <th>ደንበኛ</th>
            <th>ማዘዣ / መልዕክት</th>
            <th>የእርስዎ ምላሽ (Reply)</th>
            <th>እርምጃ</th>
          </tr>
        </thead>
        <tbody>
          {adminMessages.map((msg) => (
            <tr key={msg._id}>
              <td data-label="ደንበኛ" className="text-left-align admin-mobile-center"><strong>{msg.name}</strong><br/><span className="admin-subtext">{msg.email}</span></td>
              <td data-label="ማዘዣ / መልዕክት" className="text-left-align admin-mobile-center admin-text-break">{msg.message}<br/><small className="admin-date-text">{new Date(msg.date).toLocaleDateString()}</small></td>
              <td data-label="የእርስዎ ምላሽ (Reply)">
                {msg.reply ? (
                  <div className="reply-box">
                    <strong>የተላከ መልስ፦</strong> {msg.reply}
                  </div>
                ) : (
                  <div className="admin-inline-flex admin-wrap-fix">
                    <input type="text" placeholder="መልስ እዚህ ይጻፉ..." onChange={(e) => setReplyText({ ...replyText, [msg._id]: e.target.value })} className="input-field admin-no-margin" />
                    <button onClick={() => handleReplySubmit(msg._id)} className="btn-action btn-reply">ላክ</button>
                  </div>
                )}
              </td>
              <td data-label="እርምጃ">
                <button onClick={() => handleDeleteMessage(msg._id)} className="btn-action btn-delete">አጥፋ</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {adminMessages.length === 0 && <p className="admin-empty-text">ምንም የቀረበ ትዕዛዝ የለም።</p>}
    </div>
  );
}

export default AdminDashboard;