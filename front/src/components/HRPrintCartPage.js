import React, { useState } from "react";
import Footer from './Footer';

const API_BASE_URL = "https://max-tech-backend.onrender.com";
const FRONTEND_URL = "https://max-technology-website.vercel.app";

function HRPrintCartPage({ handleLogout }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilter, setSearchFilter] = useState('phone'); // 'phone' or 'fayda'
  const [searchResults, setSearchResults] = useState([]);
  const [printCart, setPrintCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  
  // የካርድ ዲዛይን ምርጫ: 'standard' ወይም 'chest'
  const [cardStyle, setCardStyle] = useState('standard');

  const [companyLogoUrl] = useState(() => localStorage.getItem('company_logo_url') || '');
  const [companyPhone] = useState(() => localStorage.getItem('company_phone') || '');
  const [companyEmail] = useState(() => localStorage.getItem('company_email') || '');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setStatusMessage('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/hr/search?query=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();

      if (data.success && data.employees) {
        setSearchResults(data.employees);
        if (data.employees.length === 0) {
          setStatusMessage('⚠️ ምንም ሰራተኛ አልተገኘም!');
        }
      } else {
        setSearchResults([]);
        setStatusMessage('⚠️ ምንም ሰራተኛ አልተገኘም!');
      }
    } catch (err) {
      console.error('Error searching employees', err);
      setStatusMessage('❌ ፍለጋ ላይ ስህተት ተፈጥሯል!');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (employee) => {
    if (printCart.some((item) => item._id === employee._id)) {
      setStatusMessage('⚠️ ይህ ሰራተኛ አስቀድሞ ወደ ማተሚያ ዝርዝር (Cart) ገብቷል!');
      return;
    }
    // ሲጨመር የተመረጠውን የካርድ ስታይል አብሮ እንይዛለን
    setPrintCart([...printCart, { ...employee, selectedStyle: cardStyle }]);
    setStatusMessage(`✅ ${employee.nameAmh} ወደ ማተሚያ ዝርዝር ተጨምሯል!`);
  };

  const removeFromCart = (id) => {
    setPrintCart(printCart.filter((item) => item._id !== id));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative print:bg-white print:p-0">
      
      {/* ሄደር */}
      <div className="flex flex-wrap justify-between items-center bg-gray-800 p-4 sm:p-5 rounded-2xl shadow-md gap-4 mb-6 print:hidden">
        <h2 className="text-lg sm:text-2xl font-bold flex items-center gap-2 text-blue-400">
          🖨️ የሰራተኛ መታወቂያ ማተሚያ ሰንጠረዥ (Print Cart)
        </h2>
        <button onClick={handleLogout} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition shadow text-sm">
          ውጣ (Logout)
        </button>
      </div>

      <div className="flex-1 w-full max-w-6xl mx-auto space-y-6 print:max-w-none print:m-0">
        
        {/* የካርድ ዲዛይን መምረጫ (Select Card Design Style) */}
        <div className="bg-gray-800 p-5 rounded-2xl shadow-lg border border-gray-700 print:hidden">
          <label className="block text-sm font-bold text-yellow-400 mb-3">🎴 የካርድ ዲዛይን ቅርጸት ይምረጡ (Select Card Design Style)</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setCardStyle('standard')}
              className={`py-3 px-4 rounded-xl font-bold text-sm transition border ${
                cardStyle === 'standard' 
                  ? 'bg-blue-600 border-blue-400 text-white shadow-lg' 
                  : 'bg-gray-900 border-gray-700 text-gray-400 hover:bg-gray-700'
              }`}
            >
              መደበኛ መታወቂያ (Standard ID)
            </button>
            <button
              type="button"
              onClick={() => setCardStyle('chest')}
              className={`py-3 px-4 rounded-xl font-bold text-sm transition border ${
                cardStyle === 'chest' 
                  ? 'bg-blue-600 border-blue-400 text-white shadow-lg' 
                  : 'bg-gray-900 border-gray-700 text-gray-400 hover:bg-gray-700'
              }`}
            >
              የደረት ባጅ (Chest Badge)
            </button>
          </div>
        </div>

        {/* ፍለጋ ផ្នែក */}
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 print:hidden">
          <h3 className="text-xl font-bold mb-4 text-yellow-400">🔍 ሰራተኛ በስልክ ወይም በፋይዳ ቁጥር ፈልግ</h3>
          
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <select 
              value={searchFilter} 
              onChange={(e) => setSearchFilter(e.target.value)}
              className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm font-semibold"
            >
              <option value="phone">በስልክ ቁጥር (Phone)</option>
              <option value="fayda">በፋይዳ ቁጥር (Fayda)</option>
            </select>

            <input 
              type="text" 
              placeholder={searchFilter === 'phone' ? "ስልክ ቁጥር ያስገቡ (ለምሳሌ: 09...)" : "የፋይዳ ቁጥር 16 አሃዝ ያስገቡ"} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm"
              required
            />

            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition disabled:opacity-50 text-sm"
            >
              {loading ? "እየፈለገ ነው..." : "ፈልግ (Search)"}
            </button>
          </form>

          {statusMessage && <p className="mt-3 text-sm font-medium text-green-400">{statusMessage}</p>}
        </div>

        {/* የፍለጋ ውጤቶች ዝርዝር */}
        {searchResults.length > 0 && (
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 print:hidden">
            <h3 className="text-lg font-bold mb-4 text-blue-300">📋 የፍለጋ ውጤቶች</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((emp) => (
                <div key={emp._id} className="bg-gray-900 p-4 rounded-xl border border-gray-700 flex flex-col justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={emp.imageUrl || 'https://via.placeholder.com/50'} alt={emp.nameAmh} className="w-12 h-12 rounded-full object-cover border border-blue-500" />
                    <div>
                      <h4 className="font-bold text-white text-sm">{emp.nameAmh}</h4>
                      <p className="text-xs text-gray-400">{emp.nameEng}</p>
                      <p className="text-xs text-blue-400 font-mono mt-0.5">{emp.faydaNumber}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => addToCart(emp)}
                    className="w-full py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition shadow"
                  >
                    ➕ ወደ ማተሚያ ዝርዝር ጨምር (Add to Cart)
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* የማተሚያ ጋሪ (Print Cart Section) */}
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 print:bg-white print:border-none print:p-0 print:shadow-none">
          <div className="flex justify-between items-center mb-4 print:hidden">
            <h3 className="text-xl font-bold text-yellow-400">🛒 ለማተም የተመረጡ መታወቂያዎች ({printCart.length})</h3>
            {printCart.length > 0 && (
              <button 
                onClick={handlePrint}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition text-sm flex items-center gap-2"
              >
                🖨️ ሁሉንም አትም (Print All)
              </button>
            )}
          </div>

          {printCart.length === 0 ? (
            <div className="text-center py-8 text-gray-500 print:hidden">
              ማተሚያ ጋሪው ባዶ ነው። እባክዎ ከላይ ሰራተኞችን ፈልገው ይጨምሩ።
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* CSS for Printing Layout */}
              <style dangerouslySetInnerHTML={{__html: `
                @page {
                  size: A4 portrait;
                  margin: 10mm;
                }
                @media print {
                  body, html {
                    background: white !important;
                    color: black !important;
                    width: 100%;
                    height: auto;
                    margin: 0 !important;
                    padding: 0 !important;
                  }
                  body * {
                    visibility: hidden;
                  }
                  #printable-cart-container, #printable-cart-container * {
                    visibility: visible;
                  }
                  #printable-cart-container {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100% !important;
                    display: flex !important;
                    flex-direction: column !important;
                    gap: 10mm !important;
                  }
                  .print-card-wrapper {
                    page-break-inside: avoid;
                    break-inside: avoid;
                    margin-bottom: 10mm;
                  }
                }
              `}} />

              {/* የሚታተሙ መታወቂያዎች ዝርዝር */}
              <div id="printable-cart-container" className="space-y-8">
                {printCart.map((emp) => (
                  <div key={emp._id} className="relative bg-gray-900 p-4 rounded-2xl border border-gray-700 print-card-wrapper print:bg-white print:border-none print:p-0">
                    
                    {/* ከጋሪ የማጥፊያ ቁልፍ */}
                    <button 
                      onClick={() => removeFromCart(emp._id)} 
                      className="absolute top-2 right-2 text-white hover:text-gray-200 font-bold text-xs bg-red-600 w-7 h-7 rounded-full flex items-center justify-center z-20 print:hidden shadow-lg"
                      title="ከጋሪ አስወግድ"
                    >
                      ✕
                    </button>

                    {/* 1. STANDARD ID DESIGN */}
                    {emp.selectedStyle === 'standard' && (
                      <div className="space-y-4">
                        <div className="text-xs font-bold text-yellow-400 print:hidden mb-1">የፊት እና የኋላ ገጽ (Standard ID)</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          {/* Front Side */}
                          <div className="relative bg-white text-gray-900 rounded-2xl shadow-xl border-4 border-[#0f233c] overflow-hidden w-full max-w-[340px] mx-auto">
                            <div className="bg-[#0f233c] border-b-2 border-[#d4af37] text-white py-2 px-3 flex items-center relative">
                              <div className="absolute left-3">
                                <img src={emp.logoUrl || companyLogoUrl || 'https://via.placeholder.com/30'} alt="Logo" className="w-7 h-7 rounded-full bg-white object-cover border border-[#d4af37]" />
                              </div>
                              <div className="w-full text-center">
                                <h2 className="text-xs font-extrabold tracking-wider text-white">MAX TECHNOLOGY</h2>
                                <p className="text-[8px] text-[#d4af37] font-medium">EMPLOYEE ID CARD</p>
                              </div>
                            </div>
                            <div className="p-3 flex items-center justify-around gap-2">
                              <div className="flex flex-col items-center shrink-0 w-24">
                                <div className="w-20 h-24 bg-gray-200 rounded-lg overflow-hidden border-2 border-[#0f233c] shadow-sm">
                                  <img src={emp.imageUrl || 'https://via.placeholder.com/100'} alt={emp.nameEng} className="w-full h-full object-cover" />
                                </div>
                                <div className="w-full text-center mt-1">
                                  <div className="text-[9px] font-bold text-gray-900 truncate">{emp.nameEng}</div>
                                  <div className="text-[8px] text-gray-700 font-semibold">{emp.positionEng || emp.positionAmh}</div>
                                </div>
                              </div>
                              <div className="flex-1 text-[11px] space-y-1 text-gray-800 px-1">
                                <div className="flex justify-between border-b pb-0.5"><span className="font-bold text-gray-600">ሀገር:</span><span>{emp.nationality || 'Ethiopian'}</span></div>
                                <div className="flex justify-between border-b pb-0.5"><span className="font-bold text-gray-600">ከተማ:</span><span>{emp.city || 'አዲስ አበባ'}</span></div>
                                <div className="flex justify-between border-b pb-0.5"><span className="font-bold text-gray-600">አድራሻ:</span><span>{emp.addressEng || 'Addis Ababa'}</span></div>
                                <div className="flex justify-between pb-0.5"><span className="font-bold text-gray-600">ስልክ:</span><span className="font-mono">{emp.phoneNumber}</span></div>
                              </div>
                            </div>
                            <div className="bg-[#0f233c] border-t-2 border-[#d4af37] text-white py-1 px-4 text-center">
                              <p className="text-[8px] text-[#d4af37] font-semibold">Max Technology Employee Card</p>
                            </div>
                          </div>

                          {/* Back Side */}
                          <div className="relative bg-white text-gray-900 rounded-2xl shadow-xl border-4 border-[#0f233c] overflow-hidden w-full max-w-[340px] mx-auto flex flex-col justify-between">
                            <div className="bg-[#0f233c] border-b-2 border-[#d4af37] text-white py-2 px-3 text-center">
                              <h2 className="text-xs font-extrabold tracking-wider text-white">ማህደር መረጃ / ID Details</h2>
                            </div>
                            <div className="p-3 space-y-1.5 text-[11px] text-gray-800">
                              <div className="flex justify-between border-b pb-0.5"><span className="font-bold text-gray-600">ድርጅት ስልክ:</span><span className="font-mono">{emp.orgPhoneNumber || companyPhone || 'N/A'}</span></div>
                              <div className="flex justify-between border-b pb-0.5"><span className="font-bold text-gray-600">ኢሜይል:</span><span className="text-[10px]">{emp.orgEmail || companyEmail || 'technologymax2@gmail.com'}</span></div>
                              <div className="flex justify-between border-b pb-0.5"><span className="font-bold text-gray-600">ፋይዳ ቁጥር:</span><span className="font-mono">{emp.faydaNumber}</span></div>
                              <div className="flex justify-between border-b pb-0.5"><span className="font-bold text-gray-600">የተሰጠበት ቀን:</span><span>{emp.dateOfIssue}</span></div>
                              <div className="flex justify-between pb-0.5"><span className="font-bold text-gray-600">የማብቂያ ቀን:</span><span className="text-red-600 font-bold">{emp.expireDate}</span></div>
                            </div>
                            <div className="p-2 flex flex-col items-center justify-center bg-gray-50 border-t">
                              <div className="bg-white p-1 border rounded shadow-sm">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=${encodeURIComponent(`${FRONTEND_URL}/verify/${emp._id}`)}`} alt="QR" className="w-14 h-14" />
                              </div>
                              <span className="text-[7px] text-gray-500 font-bold mt-0.5">SCAN TO VERIFY</span>
                            </div>
                          </div>

                        </div>
                      </div>
                    )}

                    {/* 2. CHEST BADGE DESIGN */}
                    {emp.selectedStyle === 'chest' && (
                      <div className="space-y-4">
                        <div className="text-xs font-bold text-yellow-400 print:hidden mb-1">የፊት እና የኋላ ገጽ (Chest Badge)</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          {/* Badge Front */}
                          <div className="relative bg-white text-gray-900 rounded-2xl shadow-xl border-4 border-[#0f233c] overflow-hidden w-full max-w-[340px] mx-auto">
                            <div className="bg-[#0f233c] border-b-2 border-[#d4af37] text-white py-2 px-3 flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <img src={emp.logoUrl || companyLogoUrl || 'https://via.placeholder.com/30'} alt="Logo" className="w-6 h-6 rounded-full bg-white object-cover border border-[#d4af37]" />
                                <div>
                                  <h2 className="text-[10px] font-extrabold tracking-wider text-white">MAX TECHNOLOGY</h2>
                                  <p className="text-[7px] text-[#d4af37]">EMPLOYEE BADGE</p>
                                </div>
                              </div>
                              <div className="text-right text-[8px] text-gray-300">
                                <div>ስልክ: {emp.phoneNumber}</div>
                                <div>ኢሜይል: {emp.orgEmail || companyEmail || 'technologymax2@gmail.com'}</div>
                              </div>
                            </div>
                            <div className="p-3 flex items-center justify-around gap-2">
                              <div className="w-20 h-24 bg-gray-200 rounded-lg overflow-hidden border-2 border-[#0f233c] shrink-0">
                                <img src={emp.imageUrl || 'https://via.placeholder.com/100'} alt={emp.nameEng} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 text-[11px] space-y-1">
                                <div className="font-bold text-gray-900">{emp.nameAmh}</div>
                                <div className="text-gray-600 text-[10px]">{emp.nameEng}</div>
                                <div className="text-[#d4af37] font-bold text-[10px]">{emp.positionEng || emp.positionAmh}</div>
                                <div className="text-gray-700 text-[9px]">አድራሻ: {emp.addressEng || 'Adiss Ababa'}</div>
                                <div className="text-gray-700 text-[9px]">ስልክ: {emp.phoneNumber}</div>
                              </div>
                              <div className="flex flex-col items-center shrink-0">
                                <div className="bg-white p-1 border rounded shadow-sm">
                                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=65x65&data=${encodeURIComponent(`${FRONTEND_URL}/verify/${emp._id}`)}`} alt="QR" className="w-14 h-14" />
                                </div>
                                <span className="text-[7px] text-gray-500 font-bold mt-0.5">SCAN</span>
                              </div>
                            </div>
                            <div className="bg-[#0f233c] border-t-2 border-[#d4af37] text-white py-1 text-center">
                              <p className="text-[7px] text-[#d4af37]">Authorized Corporate Badge - Max Technology</p>
                            </div>
                          </div>

                          {/* Badge Back */}
                          <div className="relative bg-white text-gray-900 rounded-2xl shadow-xl border-4 border-[#0f233c] overflow-hidden w-full max-w-[340px] mx-auto flex flex-col justify-between">
                            <div className="bg-[#0f233c] border-b-2 border-[#d4af37] text-white py-2 px-3 flex justify-between items-center">
                              <span className="text-[10px] font-bold text-yellow-400">የባጅ ተጨማሪ መረጃ / Additional Details</span>
                              <span className="text-[9px] font-mono text-gray-300">ፋይዳ: {emp.faydaNumber}</span>
                            </div>
                            <div className="p-4 bg-gray-50 m-3 rounded-xl border border-gray-200 space-y-2 text-[11px]">
                              <div className="grid grid-cols-2 gap-2">
                                <div><span className="text-gray-500 text-[9px] block">የወጣበት ቀን:</span><span className="font-bold text-gray-900">{emp.dateOfIssue}</span></div>
                                <div><span className="text-gray-500 text-[9px] block">የሚያልቅበት:</span><span className="font-bold text-red-600">{emp.expireDate}</span></div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 pt-1 border-t">
                                <div><span className="text-gray-500 text-[9px] block">ዜግነት:</span><span className="font-bold text-gray-900">{emp.nationality || 'Ethiopian'}</span></div>
                                <div><span className="text-gray-500 text-[9px] block">እድሜ:</span><span className="font-bold text-gray-900">{emp.age || '22'}</span></div>
                              </div>
                            </div>
                            <div className="bg-[#0f233c] border-t-2 border-[#d4af37] text-white py-1 text-center">
                              <p className="text-[7px] text-[#d4af37]">Max Technology - Official Badge Identification</p>
                            </div>
                          </div>

                        </div>
                      </div>
                    )}

                  </div>
                ))}
              </div>

            </div>
          )}
        </div>

      </div>

      <div className="print:hidden mt-8">
        <Footer />
      </div>
    </div>
  );
}

export default HRPrintCartPage;
