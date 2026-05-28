import React, { useEffect, useState } from 'react';

function OrderPage({ user, handleLogout, formData, handleContactChange, handleOrderSubmit, status, logoImg, API_BASE_URL }) {
  const [myOrders, setMyOrders] = useState([]);

  // የድሮውን useEffect አጥፍተው በዚህ ይተኩት
  useEffect(() => {
    // 1. ገጹ መጀመሪያ ሲከፈት የደንበኛውን የድሮ ማዘዣዎች ወዲያው ያመጣል
    fetchMyOrders();

    // 2. በየ 5 ሰከንዱ (5000ms) በጀርባ ሆኖ ከአድሚን የተሰጠ አዲስ መልስ ካለ ይፈትሻል
    const interval = setInterval(() => {
      fetchMyOrders();
    }, 5000);

    // 3. ደንበኛው ገጹን ሲዘጋ ወይም ሎግአውት ሲያደርግ ፍተሻውን ያቆማል
    return () => clearInterval(interval);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMyOrders = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/orders/${user.email}`);
      const data = await res.json();
      if (data.success) setMyOrders(data.orders);
    } catch (err) {
      console.error('ማዘዣዎችን ማምጣት አልተቻለም');
    }
  };

  return (
    <div className="container" style={{ padding: '20px', fontFamily: 'Arial' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', background: '#f8f9fa', borderRadius: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={logoImg} alt="Logo" style={{ width: '40px', borderRadius: '50%' }} />
          <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>Max Technology</span>
        </div>
        <div>
          <span style={{ color: '#28a745', fontWeight: 'bold', marginRight: '15px' }}>👤 {user.name}</span>
          <button onClick={handleLogout} style={{ padding: '6px 12px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}>ውጣ</button>
        </div>
      </nav>

      {/* ማዘዣ ፎርም */}
      <section style={{ maxWidth: '600px', margin: '30px auto', padding: '20px', border: '1px solid #eee', borderRadius: '10px' }}>
        <h2 style={{ textAlign: 'center', color: '#007bff' }}>🛒 አዲስ የሶ프트ዌር ማዘዣ</h2>
        <form onSubmit={(e) => { handleOrderSubmit(e); setTimeout(fetchMyOrders, 1000); }} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="text" name="name" placeholder="የድርጅትዎ ስም" value={formData.name} onChange={handleContactChange} required style={{ padding: '12px' }} />
          <input type="email" name="email" value={formData.email = user.email} disabled style={{ padding: '12px', background: '#eee' }} />
          <textarea name="message" placeholder="ሊሰራልዎት የሚፈልጉትን ስራ ዝርዝር..." value={formData.message} onChange={handleContactChange} required style={{ padding: '12px', height: '100px' }}></textarea>
          <button type="submit" style={{ padding: '12px', background: '#28a745', color: 'white', fontWeight: 'bold', border: 'none' }}>ትዕዛዝ ያስገቡ</button>
          {status && <p style={{ textAlign: 'center', color: 'green' }}>{status}</p>}
        </form>
      </section>

      {/* የላኳቸው ማዘዣዎች እና የተሰጡ ምላሾች ሰሌዳ (የተጨመረ አዲስ ክፍል) */}
      <section style={{ marginTop: '40px' }}>
        <h3>📋 የላኳቸው ማዘዣዎች እና ከአድሚን የተሰጡ ምላሾች</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {myOrders.map((order) => (
            <div key={order._id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', background: '#fff' }}>
              <p><strong>የእርስዎ ማዘዣ፦</strong> {order.message}</p>
              <p>
                <strong>ሁኔታ (Status)፦</strong>{' '}
                <span style={{ color: order.status === 'ምላሽ ተሰጥቷል' ? 'green' : 'orange', fontWeight: 'bold' }}>{order.status}</span>
              </p>
              {order.reply && (
                <div style={{ background: '#e6f4ea', padding: '10px', borderRadius: '5px', marginTop: '10px', borderLeft: '5px solid green' }}>
                  <p style={{ margin: 0, color: '#137333' }}><strong>👑 የአድሚን ምላሽ፦</strong> {order.reply}</p>
                </div>
              )}
            </div>
          ))}
          {myOrders.length === 0 && <p>እስካሁን ምንም ያስገቡት ትዕዛዝ የለም።</p>}
        </div>
      </section>
    </div>
  );
}

export default OrderPage;