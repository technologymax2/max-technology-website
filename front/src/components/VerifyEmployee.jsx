import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function VerifyEmployee({ API_BASE_URL }) {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/hr/verify/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setEmployee(data.employee);
        } else {
          setError('ሰራተኛው አልተገኘም ወይም ሊንኩ ተበላሽቷል።');
        }
      })
      .catch(err => setError('ሰርቨር ጋር መገናኘት አልተቻለም።'))
      .finally(() => setLoading(false));
  }, [id, API_BASE_URL]);

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">እየጣራ ነው... (Loading...)</div>;
  if (error) return <div className="min-h-screen bg-gray-900 text-red-400 flex items-center justify-center font-bold">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="bg-gray-800 border-2 border-green-500 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
        <div className="inline-block bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold mb-4">
          ✅ ትክክለኛ ሰራተኛ (Verified Employee)
        </div>
        
        <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-[#d4af37] mb-4 shadow-lg">
          <img src={employee.imageUrl} alt={employee.nameEng} className="w-full h-full object-cover" />
        </div>

        <h2 className="text-lg font-bold text-white">{employee.nameAmh}</h2>
        <h3 className="text-sm text-gray-300 mb-2">{employee.nameEng}</h3>
        <p className="text-xs text-[#d4af37] font-bold mb-4">{employee.positionAmh} / {employee.positionEng}</p>

        <div className="bg-gray-900 p-3 rounded-xl text-left text-xs space-y-2 border border-gray-700">
          <div className="flex justify-between"><span className="text-gray-400">ፋይዳ ቁጥር:</span> <span className="font-mono text-white">{employee.faydaNumber}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">ስልክ ቁጥር:</span> <span className="text-white">{employee.phoneNumber}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">የድርጅት ኢሜይል:</span> <span className="text-white">{employee.orgEmail}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">የሚያበቃበት ቀን:</span> <span className="text-red-400 font-bold">{employee.expireDate}</span></div>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmployee;
