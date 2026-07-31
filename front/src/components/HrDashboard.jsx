import React, { useState, useEffect } from 'react';
import Footer from './Footer';

function HrDashboard({ handleLogout, API_BASE_URL }) {
  const [employees, setEmployees] = useState([]);
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    idNumber: '',
    photoUrl: ''
  });
  const [status, setStatus] = useState('');
  const [selectedIdCard, setSelectedIdCard] = useState(null); // ለዲጂታል መታወቂያ መመልከቻ

  // ሰራተኞችን ከባክኤንድ ማምጫ
  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/hr/employees`);
      const data = await res.json();
      if (data.success) {
        setEmployees(data.employees);
      }
    } catch (err) {
      console.error('ሰራተኞችን ማምጣት አልተቻለም', err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [API_BASE_URL]);

  // ሰራተኛ መመዝገቢያ
  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/hr/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeForm)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('✅ ሰራተኛው በስኬት ተመዝግቧል!');
        setEmployeeForm({
          name: '',
          email: '',
          phone: '',
          position: '',
          department: '',
          idNumber: '',
          photoUrl: ''
        });
        fetchEmployees();
      } else {
        setStatus(data.error || 'ስህተት ተፈጥሯል');
      }
    } catch (err) {
      setStatus('የሰርቨር ስህተት!');
    }
  };

  // ሰራተኛን መሰረዣ
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
          🏢 Max Technology - HR & Digital ID System
        </h2>
        <button 
          onClick={handleLogout} 
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition shadow"
        >
          ውጣ (Logout)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Registration Form */}
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 h-fit">
          <h3 className="text-xl font-bold mb-4 text-blue-400">➕ አዲስ ሰራተኛ መመዝገቢያ</h3>
          <form onSubmit={handleEmployeeSubmit} className="flex flex-col gap-4">
            <input 
              type="text" 
              placeholder="ሙሉ ስም" 
              value={employeeForm.name} 
              onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })} 
              required 
              className="p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500" 
            />
            <input 
              type="email" 
              placeholder="ኢሜይል አድራሻ" 
              value={employeeForm.email} 
              onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })} 
              required 
              className="p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500" 
            />
            <input 
              type="text" 
              placeholder="ስልክ ቁጥር" 
              value={employeeForm.phone} 
              onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })} 
              required 
              className="p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500" 
            />
            <input 
              type="text" 
              placeholder="የስራ መደብ (Position, e.g. Developer)" 
              value={employeeForm.position} 
              onChange={(e) => setEmployeeForm({ ...employeeForm, position: e.target.value })} 
              required 
              className="p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500" 
            />
            <input 
              type="text" 
              placeholder="ክፍል (Department, e.g. IT)" 
              value={employeeForm.department} 
              onChange={(e) => setEmployeeForm({ ...employeeForm, department: e.target.value })} 
              required 
              className="p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500" 
            />
            <input 
              type="text" 
              placeholder="መታወቂያ ቁጥር (ID Number, e.g. MAX-001)" 
              value={employeeForm.idNumber} 
              onChange={(e) => setEmployeeForm({ ...employeeForm, idNumber: e.target.value })} 
              required 
              className="p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500" 
            />
            <input 
              type="url" 
              placeholder="የፎቶ ሊንክ (Photo URL)" 
              value={employeeForm.photoUrl} 
              onChange={(e) => setEmployeeForm({ ...employeeForm, photoUrl: e.target.value })} 
              className="p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500" 
            />
            <button 
              type="submit" 
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow"
            >
              ሰራተኛውን መዝግብ
            </button>
          </form>
          {status && <p className="mt-4 text-center font-medium text-green-400">{status}</p>}
        </div>

        {/* Employees Table */}
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 overflow-x-auto">
          <h3 className="text-xl font-bold mb-4 text-blue-400">📋 የሰራተኞች ዝርዝር እና ዲጂታል መታወቂያ</h3>
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400 text-sm">
                <th className="p-3">ስም</th>
                <th className="p-3">የስራ መደብ</th>
                <th className="p-3">መታወቂያ ቁጥር</th>
                <th className="p-3">እርምጃዎች</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {employees.map((emp) => (
                <tr key={emp._id} className="hover:bg-gray-700/30">
                  <td className="p-3 font-semibold flex items-center gap-3">
                    <img 
                      src={emp.photoUrl || 'https://via.placeholder.com/40'} 
                      alt={emp.name} 
                      className="w-10 h-10 rounded-full object-cover border border-blue-500" 
                    />
                    {emp.name}
                  </td>
                  <td className="p-3 text-gray-300">{emp.position}</td>
                  <td className="p-3 text-blue-300 font-mono">{emp.idNumber}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setSelectedIdCard(emp)} 
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition"
                      >
                        🪪 ዲጂታል መታወቂያ
                      </button>
                      <button 
                        onClick={() => handleDeleteEmployee(emp._id)} 
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition"
                      >
                        🗑 አጥፋ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr><td colSpan="4" className="p-6 text-center text-gray-500">ምንም የተመዘገበ ሰራተኛ የለም።</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🪪 Digital ID Card Modal */}
      {selectedIdCard && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-blue-900 via-gray-900 to-indigo-950 p-6 rounded-3xl w-full max-w-sm shadow-2xl border-2 border-blue-500/50 text-center relative">
            <button 
              onClick={() => setSelectedIdCard(null)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold text-xl bg-gray-800/80 w-8 h-8 rounded-full flex items-center justify-center"
            >
              ✕
            </button>

            {/* ID Card Header */}
            <div className="mb-4">
              <h2 className="text-xl font-extrabold tracking-wider text-white">MAX TECHNOLOGY</h2>
              <p className="text-xs text-blue-300 uppercase tracking-widest">Official Employee Digital ID</p>
            </div>

            {/* Employee Photo */}
            <div className="flex justify-center mb-4">
              <img 
                src={selectedIdCard.photoUrl || 'https://via.placeholder.com/120'} 
                alt={selectedIdCard.name} 
                className="w-28 h-28 rounded-2xl object-cover border-4 border-blue-400 shadow-lg" 
              />
            </div>

            {/* Employee Info */}
            <div className="mb-6 space-y-1">
              <h3 className="text-2xl font-bold text-white">{selectedIdCard.name}</h3>
              <p className="text-blue-400 font-semibold">{selectedIdCard.position}</p>
              <p className="text-xs text-gray-300 bg-white/10 py-1 px-3 rounded-full inline-block mt-1">
                 विभाग/Dept: {selectedIdCard.department}
              </p>
            </div>

            {/* ID Details */}
            <div className="bg-black/40 p-3 rounded-xl border border-white/10 flex justify-between items-center text-xs text-gray-300 mb-6">
              <div>
                <span className="block text-gray-500 text-[10px]">ID NUMBER</span>
                <span className="font-mono font-bold text-white text-sm">{selectedIdCard.idNumber}</span>
              </div>
              <div>
                <span className="block text-gray-500 text-[10px]">PHONE</span>
                <span className="font-semibold text-white">{selectedIdCard.phone}</span>
              </div>
            </div>

            <button 
              onClick={() => window.print()} 
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-lg text-sm"
            >
              🖨 መታወቂያውን አትም (Print ID)
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default HrDashboard;
