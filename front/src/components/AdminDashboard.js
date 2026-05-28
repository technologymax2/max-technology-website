import React, { useState } from 'react';

function AdminDashboard({ user, handleLogout, adminMessages, fetchMessages, newAdminForm, handleNewAdminChange, handleAddAdminSubmit, adminAddStatus, API_BASE_URL, handleDeleteMessage }) {
  const [replyText, setReplyText] = useState({});

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
        alert('ምላሽ ተልኳል!');
        fetchMessages(); // ገጹን ለማደስ
      }
    } catch (err) {
      alert('ስህተት ገጥሟል');
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #333', paddingBottom: '15px' }}>
        <h2>👑 የባለሙያ መቆጣጠሪያ ሰሌዳ (Admin Panel)</h2>
        <button onClick={handleLogout} style={{ padding: '10px 20px', background: 'red', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>ውጣ (Logout)</button>
      </div>
      <p>እንኳን ደህና መጣህ፣ አድሚን <strong>{user.name}</strong>!</p>

      {/* አዲስ አድሚን መመዝገቢያ */}
      <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0', marginTop: '20px', maxWidth: '500px' }}>
        <h3>➕ አዲስ ረዳት አድሚን ይጨምሩ</h3>
        <form onSubmit={handleAddAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="text" name="name" placeholder="የአዲሱ አድሚን ስም" value={newAdminForm.name} onChange={handleNewAdminChange} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
          <input type="text" name="email" placeholder="የአድሚን ዩዘርኔም" value={newAdminForm.email} onChange={handleNewAdminChange} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
          <input type="password" name="password" placeholder="ፓስወርድ" value={newAdminForm.password} onChange={handleNewAdminChange} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
          <button type="submit" style={{ padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>አድሚኑን መዝግብ</button>
        </form>
        {adminAddStatus && <p style={{ color: 'blue', marginTop: '10px' }}>{adminAddStatus}</p>}
      </div>

      {/* ማዘዣዎችና መልስ መስጫ */}
      <h3 style={{ marginTop: '40px' }}>🛒 የደንበኞች ማዘዣዎች ዝርዝር</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }} border="1" cellPadding="10">
        <thead>
          <tr style={{ background: '#007bff', color: 'white' }}>
            <th>ደንበኛ</th>
            <th>ማዘዣ/መልዕክት</th>
            <th>የእርስዎ ምላሽ (Reply)</th>
            <th>እርምጃ</th>
          </tr>
        </thead>
        <tbody>
          {adminMessages.map((msg) => (
            <tr key={msg._id}>
              <td><strong>{msg.name}</strong><br/>{msg.email}</td>
              <td>{msg.message}<br/><small style={{color:'#999'}}>{new Date(msg.date).toLocaleDateString()}</small></td>
              <td>
                {msg.reply ? (
                  <p style={{ color: 'green', margin: 0 }}><strong>የተላከ መልስ፦</strong> {msg.reply}</p>
                ) : (
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <input type="text" placeholder="መልስ እዚህ ይጻፉ..." onChange={(e) => setReplyText({ ...replyText, [msg._id]: e.target.value })} style={{ padding: '5px', flex: 1 }} />
                    <button onClick={() => handleReplySubmit(msg._id)} style={{ background: 'green', color: 'white', border: 'none', padding: '5px' }}>ላክ</button>
                  </div>
                )}
              </td>
              <td>
                <button onClick={() => handleDeleteMessage(msg._id)} style={{ background: 'darkred', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>አጥፋ</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;