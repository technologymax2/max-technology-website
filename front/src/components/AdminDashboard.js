import React, { useState, useEffect, useMemo } from 'react';
import Footer from './Footer';
import { uploadImageToImgBB } from './imageUploading';

function AdminDashboard({ user, handleLogout, adminMessages, fetchMessages, newAdminForm, handleNewAdminChange, handleAddAdminSubmit, adminAddStatus, API_BASE_URL, handleDeleteMessage, projects, setProjects }) {
  const [replyText, setReplyText] = useState({});
  const [adminList, setAdminList] = useState([]);
  const [userList, setUserList] = useState([]); 
  const [hrList, setHrList] = useState([]); // 🏢 የ HR ዝርዝር
  const [activeTab, setActiveTab] = useState('messages');

  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [passwordReset, setPasswordReset] = useState({ id: '', newPassword: '' });

  // 🏢 አዲስ HR መመዝገቢያ ፎርም
  const [hrForm, setHrForm] = useState({ name: '', email: '', password: '' });
  const [hrStatus, setHrStatus] = useState('');

  const [selectedUserEmail, setSelectedUserEmail] = useState(null);
  const [projectForm, setProjectForm] = useState({ title: '', link: '', imageUrl: '' });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMessages();
    fetchAdmins();
    fetchUsers();
    fetchHRs();
    const interval = setInterval(() => { fetchMessages(); }, 5000); 
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE_URL]);

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

  const fetchAdmins = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/list`);
      const data = await res.json();
      if (data.success) setAdminList(data.admins);
    } catch (err) {
      console.error('የአድሚኖችን ዝርዝር ማምጣት አልተቻለም');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`);
      const data = await res.json();
      if (data.success) setUserList(data.users);
    } catch (err) {
      console.error('የተጠቃሚዎችን ዝርዝር ማምጣት አልተቻለም');
    }
  };

  // 🏢 HRዎችን ከባክኤንድ ማምጫ
  const fetchHRs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/hrs`);
      const data = await res.json();
      if (data.success) {
        setHrList(data.hrs);
      }
    } catch (err) {
      console.error('የኤችአር ዝርዝር ማምጣት አልተቻለም', err);
    }
  };

  // 🏢 አዲስ HR በአድሚን መመዝገቢያ
  const handleHrSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/hrs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hrForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setHrStatus('✅ ኤችአር (HR) በስኬት ተመዝግቧል!');
        setHrForm({ name: '', email: '', password: '' });
        fetchHRs();
      } else {
        setHrStatus(data.error || 'ስህተት ተፈጥሯል');
      }
    } catch (err) {
      setHrStatus('የሰርቨር ስህተት!');
    }
  };

  // 🏢 HR መሰረዣ
  const handleDeleteHR = async (id) => {
    if (!window.confirm('ይህንን HR ከሲስተሙ ማጥፋት ይፈልጋሉ?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/hrs/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert('ኤችአር (HR) ተሰርዟል!');
        fetchHRs();
      }
    } catch (err) {
      alert('ማጥፋት አልተቻለም');
    }
  };

  const handleSendAdminMessage = async () => {
    const txt = replyText['global_admin_chat'];
    if (!txt || !txt.trim()) return alert('እባክዎ መጀመሪያ መልዕክት ይጻፉ!');

    const activeUser = uniqueUsers.find(u => u.email === selectedUserEmail);
    if (!activeUser) return alert('እባክዎ መጀመሪያ ደንበኛ ይምረጡ!');

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/send-new-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: activeUser.name, email: selectedUserEmail, message: txt })
      });
      const data = await res.json();
      if (data.success) {
        setReplyText(prev => ({ ...prev, 'global_admin_chat': '' }));
        fetchMessages();
      }
    } catch (err) {
      alert('መልዕክቱን መላክ አልተቻለም');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const imageUrl = await uploadImageToImgBB(file, setUploading);
      setProjectForm(prev => ({ ...prev, imageUrl: imageUrl }));
      alert('📸 ምስሉ በስኬት ተጭኗል!');
    } catch (err) {
      alert('ምስል መጫን አልተቻለም፡ ' + err.message);
    }
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    if (!projectForm.imageUrl) return alert('እባክዎ መጀመሪያ ምስል ይምረጡ!');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectForm)
      });
      if (res.ok) {
        alert('🎯 ፕሮጀክቱ/ምስሉ ተመዝግቧል!');
        setProjectForm({ title: '', link: '', imageUrl: '' });
      }
    } catch (err) { 
      alert('ስህተት ተፈጥሯል'); 
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
    if (!passwordReset.newPassword || passwordReset.id !== id) return alert('እባክዎ አዲስ ፓስወርድ ይጻፉ!');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/reset-password/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: passwordReset.newPassword })
      });
      if (res.ok) {
        alert('ፓስወርዱ ተቀይሯል!');
        setPasswordReset({ id: '', newPassword: '' });
      }
    } catch (err) {
      alert('መቀየር አልተቻለም');
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (!window.confirm("ይህንን አድሚን ማጥፋት ይፈልጋሉ?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/delete/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('ተሰርዟል!');
        fetchAdmins();
      }
    } catch (err) {
      alert('ማጥፋት አልተቻለም');
    }
  };

  const handleToggleBlockUser = async (id, isBlocked) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/block/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked: !isBlocked })
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      alert('ስህተት ተፈጥሯል');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("ተጠቃሚውን ማጥፋት ይፈልጋሉ?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/delete/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchUsers();
        fetchMessages();
      }
    } catch (err) {
      alert('ማጥፋት አልተቻለም');
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm('ማጥፋት ይፈልጋሉ?')) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/projects/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setProjects(prev => prev.filter(p => p._id !== id)); 
        }
      } catch (err) {
        alert('ማጥፋት አልተቻለም');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-800 p-5 rounded-2xl shadow-md gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          👑 የባለሙያ መቆጣጠሪያ ሰሌዳ (Admin Panel)
        </h2>
        <button onClick={handleLogout} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition shadow">
          ውጣ (Logout)
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 bg-gray-800 p-2 rounded-xl shadow">
        {[
          { id: 'messages', label: '💬 መልዕክቶች' },
          { id: 'projects', label: '🚀 ፖርትፎሊዮ' },
          { id: 'hr_management', label: '🏢 የ HR አስተዳደር' },
          { id: 'admins', label: '👥 አድሚኖች' },
          { id: 'users', label: '👤 ደንበኞች' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg font-medium transition text-sm sm:text-base ${
              activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Portfolio */}
      {activeTab === 'projects' && (
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
          <h3 className="text-xl font-bold mb-6 text-blue-400">🚀 ፖርትፎሊዮ ማስተዳደሪያ</h3>
          <div className="flex flex-col md:flex-row gap-4 mb-8 pb-6 border-b border-gray-700">
            <input type="text" placeholder="የፕሮጀክቱ ስም" value={projectForm.title} onChange={(e) => setProjectForm({...projectForm, title: e.target.value})} className="flex-1 p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white" />
            <input type="url" placeholder="የፕሮጀክቱ ሊንክ" value={projectForm.link} onChange={(e) => setProjectForm({...projectForm, link: e.target.value})} className="flex-1 p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white" />
            <input type="file" onChange={handleImageUpload} className="flex-1 p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white" />
            <button onClick={handleProjectSubmit} disabled={uploading} className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl">መዝግብ</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects && projects.map((p) => (
              <div key={p._id} className="flex items-center justify-between p-4 bg-gray-900 rounded-xl border border-gray-700">
                <div className="flex items-center gap-3">
                  <img src={p.imageUrl} alt={p.title} className="w-14 h-14 object-cover rounded-lg" />
                  <span>{p.title}</span>
                </div>
                <button onClick={() => handleDeleteProject(p._id)} className="px-4 py-2 bg-red-600 text-white rounded-lg">🗑 አጥፋ</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: HR Management (Admin creates HR accounts) */}
      {activeTab === 'hr_management' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 h-fit">
            <h3 className="text-xl font-bold mb-4 text-blue-400">➕ አዲስ HR (የሰው ሃብት) መመዝገቢያ</h3>
            <form onSubmit={handleHrSubmit} className="flex flex-col gap-3">
              <input type="text" placeholder="ሙሉ ስም (Name)" value={hrForm.name} onChange={(e) => setHrForm({ ...hrForm, name: e.target.value })} required className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
              <input type="text" placeholder="ዩዘርኔም/ኢሜይል (Username)" value={hrForm.email} onChange={(e) => setHrForm({ ...hrForm, email: e.target.value })} required className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
              <input type="password" placeholder="የምስጢር ቃል (Password)" value={hrForm.password} onChange={(e) => setHrForm({ ...hrForm, password: e.target.value })} required className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
              <button type="submit" className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl mt-2">HR መዝግብ</button>
            </form>
            {hrStatus && <p className="mt-4 text-center font-medium text-green-400 text-sm">{hrStatus}</p>}
          </div>

          <div className="lg:col-span-2 bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 overflow-x-auto">
            <h3 className="text-xl font-bold mb-4 text-blue-400">📋 የተመዘገቡ HR ባለሙያዎች ዝርዝር</h3>
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400 text-sm">
                  <th className="p-3">ስም / Name</th>
                  <th className="p-3">ዩዘርኔም / Username</th>
                  <th className="p-3">እርምጃዎች</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {hrList.map((hr) => (
                  <tr key={hr._id} className="hover:bg-gray-700/30">
                    <td className="p-3 font-semibold">{hr.name}</td>
                    <td className="p-3 text-gray-300">{hr.email}</td>
                    <td className="p-3">
                      <button onClick={() => handleDeleteHR(hr._id)} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg">
                        🗑 አጥፋ
                      </button>
                    </td>
                  </tr>
                ))}
                {hrList.length === 0 && (
                  <tr><td colSpan="3" className="p-6 text-center text-gray-500">ምንም የተመዘገበ HR የለም።</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Messages */}
      {activeTab === 'messages' && (
        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-bold text-blue-400">💬 የደንበኞች የቻት ማዘዣዎች</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-gray-800 rounded-2xl shadow-lg border border-gray-700 overflow-hidden min-h-[600px]">
            <div className="lg:col-span-1 border-r border-gray-700 flex flex-col bg-gray-800/50">
              <div className="p-4 font-bold bg-gray-800 border-b border-gray-700 text-gray-300">👥 ውይይቶች ({uniqueUsers.length})</div>
              <div className="overflow-y-auto flex-grow divide-y divide-gray-700/50">
                {uniqueUsers.map((u) => (
                  <div key={u.email} onClick={() => setSelectedUserEmail(u.email)} className={`flex items-center gap-3 p-4 cursor-pointer transition ${selectedUserEmail === u.email ? 'bg-blue-600/20 border-l-4 border-blue-500' : 'hover:bg-gray-700/50'}`}>
                    <span className="text-2xl p-2 bg-gray-700 rounded-full">👤</span>
                    <div className="overflow-hidden">
                      <h4 className="font-bold truncate text-white">{u.name}</h4>
                      <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-2 flex flex-col justify-between bg-gray-900/50">
              {selectedUserEmail ? (
                <>
                  <div className="p-4 bg-gray-800 border-b border-gray-700 font-bold text-gray-200">
                    💬 የ <span className="text-blue-400">{uniqueUsers.find(u => u.email === selectedUserEmail)?.name}</span> ቻት
                  </div>
                  <div className="p-4 overflow-y-auto flex-grow flex flex-col gap-4 max-h-[450px]">
                    {filteredMessages.map((msg) => (
                      <div key={msg._id} className="flex flex-col gap-2">
                        <div className="self-start bg-gray-800 text-gray-100 p-4 rounded-2xl max-w-[80%] shadow border border-gray-700">
                          <p className="text-sm">{msg.message}</p>
                        </div>
                        {msg.reply && (
                          <div className="self-end bg-blue-600 text-white p-4 rounded-2xl max-w-[80%] shadow">
                            <p className="text-sm">{msg.reply}</p>
                          </div>
                        )}
                        <button onClick={() => handleDeleteMessage(msg._id)} className="text-xs text-red-400 self-start underline">🗑 አጥፋ</button>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-gray-800 border-t border-gray-700 flex gap-3">
                    <input type="text" placeholder="መልዕክት ይጻፉ..." value={replyText['global_admin_chat'] || ''} onChange={(e) => setReplyText({ ...replyText, 'global_admin_chat': e.target.value })} className="flex-1 p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
                    <button onClick={handleSendAdminMessage} className="px-6 py-3.5 bg-yellow-500 text-gray-900 font-bold rounded-xl">🚀 ላክ</button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full p-6 text-gray-500">ደንበኛ ይምረጡ</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Admins */}
      {activeTab === 'admins' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 h-fit">
            <h3 className="text-xl font-bold mb-4 text-blue-400">➕ ረዳት አድሚን ይጨምሩ</h3>
            <form onSubmit={(e) => { handleAddAdminSubmit(e); setTimeout(fetchAdmins, 1000); }} className="flex flex-col gap-4">
              <input type="text" name="name" placeholder="ስም" value={newAdminForm.name} onChange={handleNewAdminChange} required className="p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white" />
              <input type="text" name="email" placeholder="ዩዘርኔም" value={newAdminForm.email} onChange={handleNewAdminChange} required className="p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white" />
              <input type="password" name="password" placeholder="ፓስወርድ" value={newAdminForm.password} onChange={handleNewAdminChange} required className="p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white" />
              <button type="submit" className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl">መዝግብ</button>
            </form>
          </div>
          <div className="lg:col-span-2 bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 overflow-x-auto">
            <h3 className="text-xl font-bold mb-4 text-blue-400">📋 አድሚኖች ዝርዝር</h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400 text-sm">
                  <th className="p-3">ስም</th>
                  <th className="p-3">ዩዘርኔም</th>
                  <th className="p-3">እርምጃ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {adminList.map((adm) => (
                  <tr key={adm._id}>
                    <td className="p-3">{adm.name}</td>
                    <td className="p-3">{adm.email}</td>
                    <td className="p-3">
                      <button onClick={() => handleDeleteAdmin(adm._id)} className="p-2 bg-red-600 text-white rounded-lg">🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Users */}
      {activeTab === 'users' && (
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 overflow-x-auto">
          <h3 className="text-xl font-bold mb-4 text-blue-400">👤 ደንበኞች</h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400 text-sm">
                <th className="p-3">ስም</th>
                <th className="p-3">ኢሜይል</th>
                <th className="p-3">ሁኔታ</th>
                <th className="p-3">እርምጃ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {userList.map((u) => (
                <tr key={u._id}>
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.isBlocked ? '🚫 ታግዷል' : '✔ ንቁ'}</td>
                  <td className="p-3 flex gap-2">
                    <button onClick={() => handleToggleBlockUser(u._id, u.isBlocked)} className="px-3 py-1 bg-yellow-600 text-white rounded">{u.isBlocked ? 'አንሳ' : 'አግድ'}</button>
                    <button onClick={() => handleDeleteUser(u._id)} className="px-3 py-1 bg-red-600 text-white rounded">አጥፋ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Footer />
    </div>
  );
}

export default AdminDashboard;
