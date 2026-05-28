import React, { useState, useEffect } from 'react';

function AdminDashboard({ user, handleLogout, adminMessages, fetchMessages, newAdminForm, handleNewAdminChange, handleAddAdminSubmit, adminAddStatus, API_BASE_URL, handleDeleteMessage }) {
  const [replyText, setReplyText] = useState({});
  const [adminList, setAdminList] = useState([]);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [passwordReset, setPasswordReset] = useState({ id: '', newPassword: '' });

 // የድሮውን useEffect አጥፍተው በዚህ ይተኩት
  useEffect(() => {
    // 1. ገጹ መጀመሪያ ሲከፈት መረጃውን ወዲያው ያመጣል
    fetchMessages();
    fetchAdmins();

    // 2. በየ 5 ሰከንዱ (5000ms) በጀርባ ሆኖ አዲስ መልዕክት መኖሩን ይፈትሻል
    const interval = setInterval(() => {
      fetchMessages();
    }, 5000); 

    // 3. አድሚኑ ከገጹ ሲወጣ ፍተሻውን ያቆማል (Memory leak ለመከላከል)
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

  // 1. ለአድሚን መልስ መላኪያ ሎጂክ 
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
        fetchMessages(); // መልዕክቶቹን በቅጽበት ያድሳል
      }
    } catch (err) {
      alert('ስህተት ገጥሟል');
    }
  };

  // 2. የአድሚን መረጃ ማስተካከያ (ስም እና ዩዘርኔም)
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

  // 3. የአድሚን ፓስወርድ መቀየሪያ (Reset Password)
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
    <div style={{ padding: '30px', fontFamily: 'Arial', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      {/* ራስጌ (Header) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#343a40', color: 'white', padding: '15px 30px', borderRadius: '8px' }}>
        <h2>👑 የባለሙያ መቆጣጠሪያ ሰሌዳ (Admin Panel)</h2>
        <button onClick={handleLogout} style={{ padding: '10px 20px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>ውጣ (Logout)</button>
      </div>
      <p style={{ marginTop: '15px', fontSize: '16px' }}>እንኳን ደህና መጣህ፣ አድሚን <strong>{user.name}</strong>!</p>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '20px' }}>
        {/* ሀ. አዲስ አድሚን መመዝገቢያ ፎርም */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', flex: '1', minWidth: '300px' }}>
          <h3>➕ አዲስ ረዳት አድሚን ይጨምሩ</h3>
          <form onSubmit={(e) => { handleAddAdminSubmit(e); setTimeout(fetchAdmins, 1000); }} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input type="text" name="name" placeholder="የአዲሱ አድሚን ስም" value={newAdminForm.name} onChange={handleNewAdminChange} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
            <input type="text" name="email" placeholder="የአድሚን ዩዘርኔም / ኢሜይል" value={newAdminForm.email} onChange={handleNewAdminChange} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
            <input type="password" name="password" placeholder="የምስጢር ቃል (Password)" value={newAdminForm.password} onChange={handleNewAdminChange} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
            <button type="submit" style={{ padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>አድሚኑን መዝግብ</button>
          </form>
          {adminAddStatus && <p style={{ color: 'blue', marginTop: '10px' }}>{adminAddStatus}</p>}
        </div>

        {/* ለ. [አዲስ] የተመዘገቡ አድሚኖች ዝርዝር እና ማስተካከያ ሰሌዳ */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', flex: '2', minWidth: '400px' }}>
          <h3>📋 የተመዘገቡ አድሚኖች ዝርዝር (ቁጥጥር)</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }} border="1" cellPadding="8">
            <thead>
              <tr style={{ background: '#e9ecef' }}>
                <th>ስም</th>
                <th>ዩዘርኔም / ኢሜይል</th>
                <th>የፓስወርድ ማስተካከያ (Reset)</th>
                <th>መረጃ ማስተካከያ</th>
              </tr>
            </thead>
            <tbody>
              {adminList.map((adm) => (
                <tr key={adm._id} style={{ textAlign: 'center' }}>
                  <td>{adm.name}</td>
                  <td>{adm.email}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                      <input type="text" placeholder="አዲስ ፓስወርድ" onChange={(e) => setPasswordReset({ id: adm._id, newPassword: e.target.value })} style={{ padding: '4px', width: '110px' }} />
                      <button onClick={() => handleResetPassword(adm._id)} style={{ background: '#ffc107', border: 'none', padding: '4px 8px', borderRadius: '3px', cursor: 'pointer' }}>ቀይር</button>
                    </div>
                  </td>
                  <td>
                    <button onClick={() => { setEditingAdmin(adm._id); setEditForm({ name: adm.name, email: adm.email }); }} style={{ background: '#17a2b8', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>አስተካክል</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ሐ. የአድሚን መረጃ ማስተካከያ ብቅ ባይ ፎርም (Pop-up Form) */}
      {editingAdmin && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '320px' }}>
            <h3>📝 መረጃ ማስተካከያ</h3>
            <form onSubmit={handleUpdateAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required style={{ padding: '8px' }} />
              <input type="text" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} required style={{ padding: '8px' }} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ background: 'green', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>አስቀምጥ</button>
                <button type="button" onClick={() => setEditingAdmin(null)} style={{ background: 'grey', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>አቁም</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* መ. የደንበኞች መልዕክት ማያ እና ምላሽ መስጫ (የጠየቁት 1ኛ ህግ) */}
      <h3 style={{ marginTop: '40px' }}>🛒 የደንበኞች ማዘዣዎች ዝርዝር እና ምላሽ መስጫ</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }} border="1" cellPadding="12">
        <thead>
          <tr style={{ background: '#007bff', color: 'white' }}>
            <th>ደንበኛ</th>
            <th>ማዘዣ / መልዕክት</th>
            <th>የእርስዎ ምላሽ (Reply)</th>
            <th>እርምጃ</th>
          </tr>
        </thead>
        <tbody>
          {adminMessages.map((msg) => (
            <tr key={msg._id}>
              <td><strong>{msg.name}</strong><br/><span style={{ color: '#555' }}>{msg.email}</span></td>
              <td>{msg.message}<br/><small style={{ color: '#999' }}>{new Date(msg.date).toLocaleDateString()}</small></td>
              <td>
                {msg.reply ? (
                  <div style={{ background: '#e6f4ea', padding: '8px', borderRadius: '4px', color: '#137333' }}>
                    <strong>የተላከ መልስ፦</strong> {msg.reply}
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <input type="text" placeholder="መልስ እዚህ ይጻፉ..." onChange={(e) => setReplyText({ ...replyText, [msg._id]: e.target.value })} style={{ padding: '8px', flex: 1, borderRadius: '4px', border: '1px solid #ccc' }} />
                    <button onClick={() => handleReplySubmit(msg._id)} style={{ background: '#28a745', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>ላክ</button>
                  </div>
                )}
              </td>
              <td style={{ textAlign: 'center' }}>
                <button onClick={() => handleDeleteMessage(msg._id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>አጥፋ</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {adminMessages.length === 0 && <p style={{ textAlign: 'center', marginTop: '30px', color: '#666' }}>ምንም የቀረበ ትዕዛዝ የለም።</p>}
    </div>
  );
}

export default AdminDashboard;