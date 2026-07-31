import React, { useState, useEffect } from 'react';
import Footer from './Footer';
import { uploadImageToImgBB } from './imageUploading';

function HRDashboard({ user, handleLogout, API_BASE_URL }) {
  const [employeeList, setEmployeeList] = useState([]);
  
  // 🏢 የሰራተኛ መመዝገቢያ ፎርም (በአማርኛ እና 16/10 ዲጂት ክትትል)
  const [employeeForm, setEmployeeForm] = useState({
    fullName: '',
    age: '',
    faydaNumber: '',
    dateOfIssue: '',
    expireDate: '',
    address: '',
    zone: '',
    city: '',
    nationality: '',
    phoneNumber: '',
    woreda: '',
    position: '',
    imageUrl: '',
    orgPhoneNumber: ''
  });
  const [employeeStatus, setEmployeeStatus] = useState('');
  const [selectedIdCard, setSelectedIdCard] = useState(null);
  const [empUploading, setEmpUploading] = useState(false);

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE_URL]);

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/hr/employees`);
      const data = await res.json();
      if (data.success) {
        setEmployeeList(data.employees);
      }
    } catch (err) {
      console.error('ሰራተኞችን ማምጣት አልተቻለም', err);
    }
  };

  const handleEmployeePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const imageUrl = await uploadImageToImgBB(file, setEmpUploading);
      setEmployeeForm(prev => ({ ...prev, imageUrl: imageUrl }));
      alert('📸 የሰራተኛው ፎቶ በስኬት ተጭኗል!');
    } catch (err) {
      alert('ፎቶ መጫን አልተቻለም፡ ' + err.message);
    }
  };

  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();

    // Fayda validation: exactly 16 digits
    if (!/^\d{16}$/.test(employeeForm.faydaNumber)) {
      setEmployeeStatus('❌ ስህተት፡ የፋይዳ ቁጥር በትክክል 16 አሃዝ (Digits) መሆን አለበት!');
      return;
    }

    // Phone validation: exactly 10 digits
    if (!/^\d{10}$/.test(employeeForm.phoneNumber)) {
      setEmployeeStatus('❌ ስህተት፡ ስልክ ቁጥር በትክክል 10 አሃዝ (Digits) መሆን አለበት!');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/hr/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...employeeForm, status: 'approved', approved: true })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setEmployeeStatus('✅ ሰራተኛው በስኬት ተመዝግቧል እና መታወቂያው ተዘጋጅቷል!');
        setEmployeeForm({
          fullName: '',
          age: '',
          faydaNumber: '',
          dateOfIssue: '',
          expireDate: '',
          address: '',
          zone: '',
          city: '',
          nationality: '',
          phoneNumber: '',
          woreda: '',
          position: '',
          imageUrl: '',
          orgPhoneNumber: ''
        });
        fetchEmployees();
      } else {
        setEmployeeStatus(data.error || 'ስህተት ተፈጥሯል');
      }
    } catch (err) {
      setEmployeeStatus('የሰርቨር ስህተት!');
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('ይህንን ሰራተኛ ከዝርዝር ውስጥ ማጥፋት ይፈልጋሉ?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/hr/employees/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert('ሰራተኛው ተሰርዟል!');
        fetchEmployees();
      }
    } catch (err) {
      alert('ማጥፋት አልተቻለም');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-800 p-5 rounded-2xl shadow-md gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          🏢 የ HR መቆጣጠሪያ ሰሌዳ (HR Dashboard) - እንኳን ደህና መጡ {user?.name || ''}
        </h2>
        <button onClick={handleLogout} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition shadow">
          ውጣ (Logout)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* HR Employee Registration Form */}
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 h-fit">
          <h3 className="text-xl font-bold mb-4 text-blue-400">➕ አዲስ ሰራተኛ መመዝገቢያ</h3>
          <form onSubmit={handleEmployeeSubmit} className="flex flex-col gap-3">
            <input type="text" placeholder="ሙሉ ስም (Full Name)" value={employeeForm.fullName} onChange={(e) => setEmployeeForm({ ...employeeForm, fullName: e.target.value })} required className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="እድሜ (Age)" value={employeeForm.age} onChange={(e) => setEmployeeForm({ ...employeeForm, age: e.target.value })} required className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
              <input type="text" placeholder="ዜግነት (Nationality)" value={employeeForm.nationality} onChange={(e) => setEmployeeForm({ ...employeeForm, nationality: e.target.value })} required className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
            </div>
            <div>
              <input type="text" maxLength="16" placeholder="የፋይዳ ቁጥር (Fayda - በትክክል 16 አሃዝ)" value={employeeForm.faydaNumber} onChange={(e) => setEmployeeForm({ ...employeeForm, faydaNumber: e.target.value.replace(/\D/g, '') })} required className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
              <span className="text-[11px] text-gray-400 pl-1">ቁጥሩ በትክክል 16 ዲጂት መሆን አለበት ({employeeForm.faydaNumber.length}/16)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input type="text" placeholder="የወጣበት ቀን (Date of Issue)" value={employeeForm.dateOfIssue} onChange={(e) => setEmployeeForm({ ...employeeForm, dateOfIssue: e.target.value })} required className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
              <input type="text" placeholder="ሚያልቅበት ቀን (Expire Date)" value={employeeForm.expireDate} onChange={(e) => setEmployeeForm({ ...employeeForm, expireDate: e.target.value })} required className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input type="text" placeholder="የስራ መደብ (Position)" value={employeeForm.position} onChange={(e) => setEmployeeForm({ ...employeeForm, position: e.target.value })} required className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
              <div>
                <input type="text" maxLength="10" placeholder="ስልክ (በትክክል 10 አሃዝ)" value={employeeForm.phoneNumber} onChange={(e) => setEmployeeForm({ ...employeeForm, phoneNumber: e.target.value.replace(/\D/g, '') })} required className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
                <span className="text-[11px] text-gray-400 pl-1">10 ዲጂት ({employeeForm.phoneNumber.length}/10)</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input type="text" placeholder="አድራሻ (Address)" value={employeeForm.address} onChange={(e) => setEmployeeForm({ ...employeeForm, address: e.target.value })} required className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
              <input type="text" placeholder="ዞን (Zone)" value={employeeForm.zone} onChange={(e) => setEmployeeForm({ ...employeeForm, zone: e.target.value })} className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
              <input type="text" placeholder="ከተማ (City)" value={employeeForm.city} onChange={(e) => setEmployeeForm({ ...employeeForm, city: e.target.value })} required className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input type="text" placeholder="ወረዳ (Woreda)" value={employeeForm.woreda} onChange={(e) => setEmployeeForm({ ...employeeForm, woreda: e.target.value })} required className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
              <input type="text" placeholder="የድርጅቱ ስልክ (Org Phone)" value={employeeForm.orgPhoneNumber} onChange={(e) => setEmployeeForm({ ...employeeForm, orgPhoneNumber: e.target.value })} required className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">የሰራተኛ ፎቶ ይጫኑ (Image Upload)</label>
              <input type="file" onChange={handleEmployeePhotoUpload} className="p-2 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm file:bg-blue-600 file:text-white file:rounded-lg file:border-0" />
            </div>
            <button type="submit" disabled={empUploading} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl mt-2 disabled:opacity-50">
              {empUploading ? 'ፎቶ በመጫን ላይ...' : 'ሰራተኛውን መዝግብ'}
            </button>
          </form>
          {employeeStatus && <p className="mt-4 text-center font-medium text-green-400 text-sm">{employeeStatus}</p>}
        </div>

        {/* Employees List & ID Card Viewer */}
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 overflow-x-auto">
          <h3 className="text-xl font-bold mb-4 text-blue-400">📋 የተመዘገቡ ሰራተኞች ዝርዝር</h3>
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400 text-sm">
                <th className="p-3">ስም / Name</th>
                <th className="p-3">የስራ መደብ / Position</th>
                <th className="p-3">የፋይዳ ቁጥር</th>
                <th className="p-3">እርምጃዎች</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {employeeList.map((emp) => (
                <tr key={emp._id} className="hover:bg-gray-700/30">
                  <td className="p-3 font-semibold flex items-center gap-3">
                    <img src={emp.imageUrl || 'https://via.placeholder.com/40'} alt={emp.fullName} className="w-10 h-10 rounded-full object-cover border border-blue-500" />
                    {emp.fullName}
                  </td>
                  <td className="p-3 text-gray-300">{emp.position}</td>
                  <td className="p-3 font-mono text-xs text-blue-300">{emp.faydaNumber}</td>
                  <td className="p-3">
                    <div className="flex gap-2 items-center">
                      <button onClick={() => setSelectedIdCard(emp)} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg">
                        🪪 መታወቂያ
                      </button>
                      <button onClick={() => handleDeleteEmployee(emp._id)} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg">
                        🗑 አጥፋ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {employeeList.length === 0 && (
                <tr><td colSpan="4" className="p-6 text-center text-gray-500">ምንም የተመዘገበ ሰራተኛ የለም።</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🪪 Digital ID Card Modal */}
      {selectedIdCard && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-blue-950 via-gray-900 to-indigo-950 p-6 rounded-3xl w-full max-w-md shadow-2xl border-2 border-blue-500/50 text-center relative">
            <button onClick={() => setSelectedIdCard(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold text-xl bg-gray-800/80 w-8 h-8 rounded-full flex items-center justify-center">
              ✕
            </button>
            <div className="mb-3 border-b border-blue-500/30 pb-2">
              <h2 className="text-lg font-extrabold tracking-wider text-white">MAX TECHNOLOGY / ማክ ቴክኖሎጂ</h2>
              <p className="text-[10px] text-blue-300 uppercase tracking-widest">Official Employee Digital ID / የሰራተኛ ዲጂታል መታወቂያ</p>
            </div>
            <div className="flex gap-4 items-center mb-4 text-left">
              <img src={selectedIdCard.imageUrl || 'https://via.placeholder.com/100'} alt={selectedIdCard.fullName} className="w-24 h-28 rounded-xl object-cover border-2 border-blue-400 shadow-md shrink-0" />
              <div className="text-xs space-y-1 text-gray-200 w-full">
                <p><strong>ስም/Name:</strong> {selectedIdCard.fullName}</p>
                <p><strong>የስራ መደብ/Position:</strong> {selectedIdCard.position}</p>
                <p><strong>እድሜ/Age:</strong> {selectedIdCard.age} | <strong>ዜግነት/Nat:</strong> {selectedIdCard.nationality}</p>
                <p><strong>የፋይዳ ቁጥር/Fayda:</strong> <span className="font-mono text-blue-300">{selectedIdCard.faydaNumber}</span></p>
                <p><strong>ስልክ/Phone:</strong> {selectedIdCard.phoneNumber}</p>
              </div>
            </div>
            <div className="bg-black/40 p-2.5 rounded-xl border border-white/10 text-[11px] text-gray-300 space-y-1 mb-4 text-left">
              <p><strong>አድራሻ/Address:</strong> {selectedIdCard.address}, ከተማ: {selectedIdCard.city}, ወረዳ: {selectedIdCard.woreda}</p>
              <div className="flex justify-between pt-1 border-t border-white/10 text-[10px]">
                <span>ወጣበት/Issued: <strong>{selectedIdCard.dateOfIssue}</strong></span>
                <span>ያልቃል/Expires: <strong>{selectedIdCard.expireDate}</strong></span>
              </div>
            </div>
            <div className="flex justify-between items-center bg-blue-950/40 p-2.5 rounded-xl border border-blue-500/20 mb-4">
              <div className="text-left text-[10px] text-gray-300">
                <p className="text-green-400 font-bold">✔ HR Verified & Signed</p>
                <p>የድርጅቱ ስልክ: <strong className="text-white">{selectedIdCard.orgPhoneNumber}</strong></p>
              </div>
              <div className="bg-white p-1 rounded-lg">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=65x65&data=Fayda-${selectedIdCard.faydaNumber}-${selectedIdCard.fullName}`} alt="QR Code" className="w-14 h-14" />
              </div>
            </div>
            <button onClick={() => window.print()} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg text-sm">
              🖨 መታወቂያውን አትም (Print ID Card)
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default HRDashboard;
