import React, { useState } from "react";
import Footer from './Footer';

const API_BASE_URL = "https://max-tech-backend.onrender.com"; // Replace with your actual API base URL if needed

function HRPrintCartPage({ handleLogout }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilter, setSearchFilter] = useState('phone'); // 'phone' or 'fayda'
  const [searchResults, setSearchResults] = useState([]);
  const [printCart, setPrintCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Search employees handler
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setStatusMessage('');

    try {
      const queryParam = searchFilter === 'phone' ? `phoneNumber=${searchTerm}` : `faydaNumber=${searchTerm}`;
      const res = await fetch(`${API_BASE_URL}/api/hr/employees/search?${queryParam}`);
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

  // Add to Print Cart
  const addToCart = (employee) => {
    if (printCart.some((item) => item._id === employee._id)) {
      setStatusMessage('⚠️ ይህ ሰራተኛ አስቀድሞ ወደ ማተሚያ ዝርዝር (Cart) ገብቷል!');
      return;
    }
    setPrintCart([...printCart, employee]);
    setStatusMessage(`✅ ${employee.nameAmh} ወደ ማተሚያ ዝርዝር ተጨምሯል!`);
  };

  // Remove from Print Cart
  const removeFromCart = (id) => {
    setPrintCart(printCart.filter((item) => item._id !== id));
  };

  // Print all in Cart
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
        
        {/* ፍለጋ ផ្នែក (Search Section) */}
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
              
              {/* CSS for Multi-ID Card Printing */}
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
                    gap: 15mm !important;
                  }
                  .print-card-item {
                    width: 85.6mm !important;
                    height: 54mm !important;
                    border: 1.5px solid #0f233c !important;
                    border-radius: 8px !important;
                    overflow: hidden !important;
                    page-break-inside: avoid;
                    background: white !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    margin: 0 auto;
                  }
                }
              `}} />

              {/* የሚታተሙ መታወቂያዎች ግሪድ / ዝርዝር */}
              <div id="printable-cart-container" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {printCart.map((emp) => (
                  <div key={emp._id} className="relative bg-white text-gray-900 rounded-2xl shadow-xl border-4 border-[#0f233c] overflow-hidden print-card-item">
                    
                    {/* ከጋሪ የማጥፊያ ቁልፍ (በፕሪንት ጊዜ ይጠፋል) */}
                    <button 
                      onClick={() => removeFromCart(emp._id)} 
                      className="absolute top-2 right-2 text-white hover:text-gray-200 font-bold text-xs bg-red-600 w-6 h-6 rounded-full flex items-center justify-center z-10 print:hidden"
                      title="ከጋሪ አስወግድ"
                    >
                      ✕
                    </button>

                    {/* ሄደር */}
                    <div className="bg-[#0f233c] border-b-2 border-[#d4af37] text-white py-2 px-3 flex items-center print:bg-[#0f233c] print:text-white print:py-1.5 relative">
                      <div className="absolute left-3">
                        <img 
                          src="https://via.placeholder.com/30" 
                          alt="Logo" 
                          className="w-7 h-7 rounded-full bg-white object-cover border border-[#d4af37]" 
                        />
                      </div>
                      <div className="w-full text-center">
                        <h2 className="text-xs sm:text-sm font-extrabold tracking-wider leading-tight text-white">MAX TECHNOLOGY</h2>
                        <p className="text-[8px] sm:text-[9px] text-[#d4af37] font-medium">የሰራተኛ መታወቂያ ካርድ / Employee ID</p>
                      </div>
                    </div>

                    {/* የካርዱ ዋና አካል */}
                    <div className="p-3 sm:p-4 flex items-center justify-around gap-2 print:p-2.5">
                      
                      {/* ግራ በኩል፡ ፎቶ እና መረጃ */}
                      <div className="flex flex-col items-center shrink-0 w-24 sm:w-28 print:w-20">
                        <div className="w-20 h-24 sm:w-24 sm:h-28 bg-gray-200 rounded-lg overflow-hidden border-2 border-[#0f233c] shadow-sm">
                          <img src={emp.imageUrl || 'https://via.placeholder.com/100'} alt={emp.nameEng} className="w-full h-full object-cover" />
                        </div>
                        <div className="w-full text-center mt-1">
                          <div className="text-[9px] sm:text-[10px] font-bold text-gray-900 truncate">
                            {emp.nameEng}
                          </div>
                          <div className="text-[8px] sm:text-[9px] text-gray-700 font-mono">
                            📞 {emp.phoneNumber}
                          </div>
                          <div className="text-[8px] sm:text-[9px] text-gray-600 truncate">
                            📍 {emp.city || emp.addressEng}
                          </div>
                        </div>
                      </div>

                      {/* መሃል ላይ፡ የተቀሩት መረጃዎች */}
                      <div className="flex-1 text-[11px] sm:text-xs space-y-1.5 text-gray-800 print:text-[8.5px] print:space-y-0.5 px-2">
                        <div className="flex justify-between border-b pb-0.5">
                          <span className="font-bold text-gray-600">ስራ መደብ:</span>
                          <span className="font-semibold text-gray-900">{emp.positionEng || emp.positionAmh}</span>
                        </div>
                        <div className="flex justify-between border-b pb-0.5">
                          <span className="font-bold text-gray-600">FAYDA No:</span>
                          <span className="font-mono text-gray-900">{emp.faydaNumber}</span>
                        </div>
                        <div className="flex justify-between border-b pb-0.5">
                          <span className="font-bold text-gray-600">ድርጅት ስልክ:</span>
                          <span className="text-gray-900">{emp.orgPhoneNumber}</span>
                        </div>
                        <div className="flex justify-between border-b pb-0.5">
                          <span className="font-bold text-gray-600">የተሰጠበት ቀን:</span>
                          <span className="text-gray-900">{emp.dateOfIssue}</span>
                        </div>
                        <div className="flex justify-between pb-0.5">
                          <span className="font-bold text-gray-600">የማብቂያ ጊዜ:</span>
                          <span className="text-red-600 font-bold">{emp.expireDate}</span>
                        </div>
                      </div>

                      {/* ቀኝ በኩል፡ QR Code */}
                      <div className="flex flex-col items-center justify-center shrink-0">
                        <div className="bg-white p-1 border rounded shadow-sm">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(`${API_BASE_URL}/api/hr/verify/${emp._id}`)}`} 
                            alt="QR Code" 
                            className="w-16 h-16 sm:w-20 sm:h-20 print:w-14 print:h-14" 
                          />
                        </div>
                        <span className="text-[7px] sm:text-[8px] text-gray-500 mt-0.5 font-bold tracking-tight">SCAN TO VERIFY</span>
                      </div>

                    </div>

                    {/* ፉተር */}
                    <div className="bg-[#0f233c] border-t-2 border-[#d4af37] text-white py-1.5 px-4 text-center print:bg-[#0f233c] print:py-1">
                      <p className="text-[9px] sm:text-[10px] text-[#d4af37] font-semibold print:text-[7px]">
                        Email: technologymax2@gmail.com
                      </p>
                    </div>

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
