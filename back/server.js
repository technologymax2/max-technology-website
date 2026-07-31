Const express = require('express');
Const mongoose = require('mongoose');
Const cors = require('cors');
Const bcrypt = require('bcryptjs');
Require('dotenv').config();

Const app = express();
App.use(express.json());

// የ CORS አደረጃጀት - ማንኛውንም ግንኙነት እንዳያግድ ክፍት ተደርጓል
App.use(cors({
  Origin: '*',
  Methods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS'],
  Credentials: true
}));

// MongoDB የግንኙነት መስመር
Const MONGO_URI = process.env.MONGO_URI;
Mongoose.connect(MONGO_URI)
  .then(() => {
    Console.log('✅ MongoDB በስኬት ተገናኝቷል!');
    SeedFirstAdmin(); // ዳታቤዙ እንደተገናኘ የመጀመሪያውን አድሚን ይፈትሻል/ይፈጥራል
  })
  .catch(err => console.error('❌ የዳታቤዝ ግንኙነት ስህተት:', err));

// ==========================================
// 1. የዳታቤዝ ሞዴሎች (SCHEMAS & MODELS)
// ==========================================

// ሀ. የተጠቃሚዎች (User) ስኬማ
Const userSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Email: { type: String, required: true, unique: true }, // እንደ ዩዘርኔም የሚያገለግል
  Password: { type: String, required: true },
  Role: { type: String, default: 'normal' }, // 'normal', 'admin', ወይም 'hr'/'employee'
  IsBlocked: { type: Boolean, default: false } // 🚫 ለብሎክ ማድረጊያ የተጨመረ
});
Const User = mongoose.model('User', userSchema);

// ለ. የማዘዣዎች/መልዕክቶች (Contact/Order) ስኬማ
Const contactSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Email: { type: String, required: true }, // ከደንበኛው email ጋር የሚገናኝበት
  Message: { type: String, required: true },
  Reply: { type: String, default: '' }, // የአድሚን መልስ ማከማቻ
  Status: { type: String, default: 'በጥበቃ ላይ' }, // 'በጥበቃ ላይ' ወይም 'ምላሽ ተሰጥቷል'
  Date: { type: Date, default: Date.now }
});
Const Contact = mongoose.model('Contact', contactSchema);

// 🏢 ሐ. የሰራተኞች (Employee) ስኬማ (ለዲጂታል መታወቂያ እና ኤችአር)
Const employeeSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Email: { type: String, required: true, unique: true },
  Password: { type: String, required: true },
  Phone: { type: String, required: true },
  Position: { type: String, required: true },
  Department: { type: String, required: true },
  IdNumber: { type: String, required: true, unique: true },
  PhotoUrl: { type: String, default: '' },
  Role: { type: String, default: 'employee' }, // 'hr' ወይም 'employee' ሊሆን ይችላል
  Date: { type: Date, default: Date.now }
});
Const Employee = mongoose.model('Employee', employeeSchema);

// ==========================================
// 2. የመጀመሪያው አድሚን መፍጠሪያ (SEEDING)
// ==========================================
Async function seedFirstAdmin() {
  Try {
    Const adminEmail = 'mamaruAnmaw@1925';
    Const existingAdmin = await User.findOne({ email: adminEmail });
    
    If (!existingAdmin) {
      Const hashedPassword = await bcrypt.hash('mame192513', 10);
      Const firstAdmin = new User({
        Name: 'Mamaru Anmaw (Main Admin)',
        Email: adminEmail,
        Password: hashedPassword,
        Role: 'admin'
      });
      await firstAdmin.save();
      Console.log('👑 የመጀመሪያው ዋና አድሚን በስኬት ዳታቤዝ ውስጥ ተፈጥሯል!');
    }
  } catch (error) {
    Console.error('ዋናውን አድሚን መፍጠር አልተቻለም:', error);
  }
}

// አዲስ የፕሮጀክት ስኪማ
Const projectSchema = new mongoose.Schema({
  Title: String,
  Link: String,
  ImageUrl: String,
  Date: { type: Date, default: Date.now }
});
Const Project = mongoose.model('Project', projectSchema);

// አዲስ ሲስተም መመዝገቢያ (POST)
App.post('/api/admin/projects', async (req, res) => {
  Const newProject = new Project(req.body);
  await newProject.save();
  Res.json({ success: true });
});

// ሲስተሞችን ማምጫ (GET)
App.get('/api/projects', async (req, res) => {
  Const projects = await Project.find().sort({ date: -1 });
  Res.json({ success: true, projects });
});

// ሲስተሞችን ማጥፊያ (DELETE)
App.delete('/api/admin/projects/:id', async (req, res) => {
  Await Project.findByIdAndDelete(req.params.id);
  Res.json({ success: true });
});

// ==========================================
// 3. የደህንነት እና መግቢያ መስመሮች (AUTH ROUTES)
// ==========================================

// ሀ. መደበኛ ደንበኞች መመዝገቢያ (SIGNUP)
App.post('/api/auth/signup', async (req, res) => {
  Try {
    Const { name, email, password } = req.body;
    
    Const existingUser = await User.findOne({ email });
    If (existingUser) return res.status(400).json({ success: false, error: 'ይህ ኢሜይል/ዩዘርኔም ቀድሞ ተመዝግቧል!' });

    Const hashedPassword = await bcrypt.hash(password, 10);
    Const newUser = new User({
      Name,
      Email,
      Password: hashedPassword,
      Role: 'normal'
    });

    Await newUser.save();
    Res.status(201).json({ success: true, message: 'ምዝገባው በስኬት ተጠናቋል!' });
  } catch (error) {
    Res.status(500).json({ success: false, error: 'የምዝገባ ስህተት ተፈጥሯል' });
  }
});

// ለ. ተጠቃሚዎች መግቢያ (LOGIN) - (የታገዱ ሰዎችን ይከለክላል)
App.post('/api/auth/login', async (req, res) => {
  Try {
    Const { email, password } = req.body;
    
    // መጀመሪያ በ User (አድሚን ወይም መደበኛ) መፈለግ
    Let user = await User.findOne({ email });
    Let role = user ? user.role : null;

    // በ User ካልተገኘ በ Employee (ሰራተኛ) መፈለግ
    If (!user) {
      Const employee = await Employee.findOne({ email });
      If (employee) {
        User = employee;
        Role = employee.role || 'employee'; // 👈 የሰራተኛውን ትክክለኛ ሚና (hr ወይም employee) መውሰድ
      }
    }

    If (!user) return res.status(400).json({ success: false, error: 'ኢሜይል/ዩዘርኔም ወይም ፓስወርድ ተሳስቷል!' });

    // 🚫 ተጠቃሚው በአድሚን ታግዶ ከሆነ መግቢያ መከልከል
    If (user.isBlocked) {
      return res.status(403).json({ success: false, error: 'አካውንትዎ በአድሚን ታግዷል! እባክዎ ባለሙያ ያነጋግሩ።' });
    }

    Const isMatch = await bcrypt.compare(password, user.password);
    If (!isMatch) return res.status(400).json({ success: false, error: 'ኢሜይል/ዩዘርኔም ወይም ፓስወርድ ተሳስቷል!' });

    Res.status(200).json({
      Success: true,
      User: { id: user._id, name: user.name, email: user.email, role: role }
    });
  } catch (error) {
    Res.status(500).json({ success: false, error: 'የመግባት ስህተት ተፈጥሯል' });
  }
});

// ==========================================
// 4. የአድሚን መቆጣጠሪያ መስመሮች (ADMIN CONTROL ROUTES)
// ==========================================

// ሐ. አዲስ ረዳት አድሚን መመዝገቢያ
App.post('/api/admin/add-admin', async (req, res) => {
  Try {
    Const { name, email, password } = req.body;

    Const existingUser = await User.findOne({ email });
    If (existingUser) return res.status(400).json({ success: false, error: 'ይህ ኢሜይል/ዩዘርኔም ቀድሞ ተመዝግቧል!' });

    Const hashedPassword = await bcrypt.hash(password, 10);
    Const newAdmin = new User({
      Name,
      Email,
      Password: hashedPassword,
      Role: 'admin'
    });

    Await newAdmin.save();
    Res.status(201).json({ success: true, message: 'አዲሱ አድሚን በስኬት ተመዝግቧል!' });
  } catch (error) {
    Res.status(500).json({ success: false, error: 'አድሚን መፍጠር አልተቻለም' });
  }
});

// የተመዘገቡ አድሚኖችን ዝርዝር ማያ
App.get('/api/admin/list', async (req, res) => {
  Try {
    Const admins = await User.find({ role: 'admin' }).select('-password');
    Res.status(200).json({ success: true, admins });
  } catch (error) {
    Res.status(500).json({ success: false, error: 'የአድሚኖችን ዝርዝር ማምጣት አልተቻለም' });
  }
});

// የአድሚን መረጃ ማስተካከያ (PUT)
App.put('/api/admin/update/:id', async (req, res) => {
  Try {
    Const { name, email } = req.body;
    Await User.findByIdAndUpdate(req.params.id, { name, email });
    Res.status(200).json({ success: true, message: 'የአድሚን መረጃ ተስተካክሏል!' });
  } catch (error) {
    Res.status(500).json({ success: false, error: 'ማስተካከሉ አልተሳካም' });
  }
});

// የአድሚን ፓስወርድ መለወጫ (PUT)
App.put('/api/admin/reset-password/:id', async (req, res) => {
  Try {
    Const { newPassword } = req.body;
    Const hashedPassword = await bcrypt.hash(newPassword, 10);
    Await User.findByIdAndUpdate(req.params.id, { password: hashedPassword });
    Res.status(200).json({ success: true, message: 'የአድሚኑ ፓስወርድ በስኬት ተለውጧል!' });
  } catch (error) {
    Res.status(500).json({ success: false, error: 'ፓስወርድ መቀየር አልተቻለም' });
  }
});

// 🗑️ ረዳት አድሚን ሙሉ በሙሉ መሰረዣ ኤፒአይ
App.delete('/api/admin/delete/:id', async (req, res) => {
  Try {
    Await User.findByIdAndDelete(req.params.id);
    Res.status(200).json({ success: true, message: 'አድሚኑ በተሳካ ሁኔታ ተሰርዟል!' });
  } catch (error) {
    Res.status(500).json({ success: false, error: 'አድሚኑን ማጥፋት አልተቻለም' });
  }
});

// መ. አድሚን ሁሉንም የደንበኞች ማዘዣዎች የሚያيበት
App.get('/api/admin/messages', async (req, res) => {
  Try {
    Const messages = await Contact.find().sort({ date: -1 });
    Res.status(200).json({ success: true, messages });
  } catch (error) {
    Res.status(500).json({ success: false, error: 'መረጃዎችን ማምጣት አልተቻለም' });
  }
});

// ሠ. አድሚን ለደንበኛ ማዘዣ መልስ (Reply) የሚጽፍበት መስመር
App.post('/api/admin/reply/:id', async (req, res) => {
  Try {
    Const { reply } = req.body;
    Await Contact.findByIdAndUpdate(req.params.id, { 
      Reply: reply, 
      Status: 'ምላሽ ተሰጥቷል' 
    });
    Res.status(200).json({ success: true, message: 'ምላሽዎ በተሳካ ሁኔታ ተልኳል!' });
  } catch (error) {
    Res.status(500).json({ success: false, error: 'ምላሽ መላክ አልተቻለም' });
  }
});

// ረ. አድሚን ማዘዣ የሚያጠፋበት (ከቻት ቦክስ ላይ)
App.delete('/api/admin/messages/:id', async (req, res) => {
  Try {
    Await Contact.findByIdAndDelete(req.params.id);
    Res.status(200).json({ success: true, message: 'ማዘዣው ተሰርዟል!' });
  } catch (error) {
    Res.status(500).json({ success: false, error: 'ማጥፋት አልተቻለም' });
  }
});

// ==========================================
// 5. የሰራተኞች ማስተዳደሪያ (HR / EMPLOYEE ROUTES)
// ==========================================

// አዲስ ሰራተኛ መመዝገቢያ (HR ወይም Employee በራስ ሰር እንዲለይ ተደርጓል)
App.post('/api/hr/employees', async (req, res) => {
  Try {
    Const { name, email, password, phone, position, department, idNumber, photoUrl } = req.body;
    
    Const existingEmployee = await Employee.findOne({ email });
    If (existingEmployee) {
      return res.status(400).json({ success: false, error: 'ይህ ኢሜይል ቀድሞ ተመዝግቧል!' });
    }

    Const hashedPassword = await bcrypt.hash(password, 10);
    
    // 🔍 ፖዚሽኑ ወይም ዲፓርትመንቱ 'hr' የሚል ቃል ከያዘ ሮሉን 'hr' እናደርገዋለን
    Const assignedRole = (position.toLowerCase().includes('hr') || department.toLowerCase().includes('hr')) ? 'hr' : 'employee';

    Const newEmployee = new Employee({
      Name,
      Email,
      Password: hashedPassword,
      Phone,
      Position,
      Department,
      IdNumber,
      PhotoUrl,
      Role: assignedRole // 👈 እዚህ ጋር ተስተካክሏል
    });

    Await newEmployee.save();
    Res.status(201).json({ success: true, message: 'ሰራተኛው በስኬት ተመዝግቧል!' });
  } catch (error) {
    Res.status(500).json({ success: false, error: 'ኢሜይል ወይም መታወቂያ ቁጥር ቀድሞ ተመዝግቧል!' });
  }
});

// ሰራተኞችን ማምጫ
App.get('/api/hr/employees', async (req, res) => {
  Try {
    Const employees = await Employee.find().sort({ date: -1 });
    Res.status(200).json({ success: true, employees });
  } catch (error) {
    Res.status(500).json({ success: false, error: 'ሰራተኞችን ማምጣት አልተቻለም' });
  }
});

// ሰራተኛን መሰረዣ
App.delete('/api/hr/employees/:id', async (req, res) => {
  Try {
    Await Employee.findByIdAndDelete(req.params.id);
    Res.status(200).json({ success: true, message: 'ሰራተኛው ተሰርዟል!' });
  } catch (error) {
    Res.status(500).json({ success: false, error: 'ሰራተኛውን ማጥፋት አልተቻለም' });
  }
});

// ==========================================
// 6. የተጠቃሚዎች ማስተዳደሪያ (USER MANAGEMENT ROUTES)
// ==========================================

App.get('/api/admin/users', async (req, res) => {
  Try {
    Const registeredUsers = await User.find({ role: 'normal' }).select('-password').lean();
    Const chatEmails = await Contact.distinct('email');
    Let finalUsersList = [...registeredUsers];

    For (const email of chatEmails) {
      Const alreadyExists = finalUsersList.some(u => u.email === email);
      Const isMainAdmin = email === 'mamaruAnmaw@1925'; 

      If (!alreadyExists && !isMainAdmin) {
        Const sampleContact = await Contact.findOne({ email });
        If (sampleContact) {
          FinalUsersList.push({
            _id: sampleContact._id, 
            Name: sampleContact.name || 'ስም የሌለው ደንበኛ',
            Email: email,
            IsBlocked: false,
            IsChatOnly: true   
          });
        }
      }
    }

    Res.status(200).json({ success: true, users: finalUsersList });
  } catch (error) {
    Res.status(500).json({ success: false, error: 'የደንበኞችን ዝርዝር ማጠናቀር አልተቻለም' });
  }
});

App.put('/api/admin/users/block/:id', async (req, res) => {
  Try {
    Const { isBlocked } = req.body;
    Const userId = req.params.id;

    Const user = await User.findById(userId);
    If (user) {
      Await User.findByIdAndUpdate(userId, { isBlocked });
    } else {
      Const contactData = await Contact.findById(userId);
      If (contactData) {
        Const dummyPassword = await bcrypt.hash('BLOCKED_USER_PASS_123', 10);
        Const blockedUser = new User({
          Name: contactData.name,
          Email: contactData.email,
          Password: dummyPassword,
          Role: 'normal',
          IsBlocked: isBlocked
        });
        await blockedUser.save();
      }
    }

    Res.status(200).json({ success: true, message: 'የተጠቃሚው የብሎክ ሁኔታ ተቀይሯል!' });
  } catch (error) {
    Res.status(500).json({ success: false, error: 'ብሎክ ማድረግ አልተሳካም' });
  }
});

App.delete('/api/admin/users/delete/:id', async (req, res) => {
  Try {
    Const userId = req.params.id;
    Const user = await User.findById(userId);
    
    If (user) {
      Await User.findByIdAndDelete(userId);
    } else {
      Await Contact.findByIdAndDelete(userId);
    }
    
    Res.status(200).json({ success: true, message: 'ተጠቃሚው ሙሉ በሙሉ ተሰርዟል!' });
  } catch (error) {
    Res.status(500).json({ success: false, error: 'ተጠቃሚውን ማጥፋት አልተቻለም' });
  }
});

// ==========================================
// 7. የደንበኞች ማዘዣ መስመሮች (USER/ORDER ROUTES)
// ==========================================

App.post('/api/contact', async (req, res) => {
  Try {
    Const { name, email, message } = req.body;
    
    Const checkUser = await User.findOne({ email });
    If (checkUser && checkUser.isBlocked) {
      return res.status(403).json({ success: false, error: 'አካውንትዎ የታገደ በመሆኑ መልዕክት መላክ አይችሉም!' });
    }

    Const newContact = new Contact({ name, email, message });
    await newContact.save();
    Res.status(201).json({ success: true, message: 'ትዕዛዝዎ በስኬት ተቀምጧል!' });
  } catch (error) {
    Res.status(500).json({ success: false, error: 'ትዕዛዙን ማስቀመጥ አልተቻለም' });
  }
});

App.get('/api/user/orders/:email', async (req, res) => {
  Try {
    Const orders = await Contact.find({ email: req.params.email }).sort({ date: -1 });
    Res.status(200).json({ success: true, orders });
  } catch (error) {
    Res.status(500).json({ success: false, error: 'ማዘዣዎችዎን ማምጣት አልተቻለም' });
  }
});

App.put('/api/user/orders/edit/:id', async (req, res) => {
  Try {
    Const orderId = req.params.id;
    Const { message } = req.body;

    Const updatedOrder = await Contact.findByIdAndUpdate(
      OrderId,
      { message: message },
      { new: true }
    );

    If (!updatedOrder) {
      return res.status(404).json({ success: false, message: "መልዕክቱ አልተገኘም" });
    }

    Res.json({ success: true, message: "መልዕክቱ በተሳካ ሁኔታ ተስተካክሏል", order: updatedOrder });
  } catch (err) {
    Res.status(500).json({ success: false, message: "የባክኤንድ ስህተት ገጥሟል" });
  }
});

App.delete('/api/user/orders/delete/:id', async (req, res) => {
  Try {
    Const orderId = req.params.id;
    Const deletedOrder = await Contact.findByIdAndDelete(orderId);

    If (!deletedOrder) {
      return res.status(404).json({ success: false, message: "መልዕክቱ አልተገኘም" });
    }

    Res.json({ success: true, message: "መልዕክቱ በተሳካ ሁኔታ ጠፍቷል" });
  } catch (err) {
    Res.status(500).json({ success: false, message: "የባክኤንድ ስህተት ገጥሟል" });
  }
});

App.post('/api/admin/send-new-message', async (req, res) => {
  Try {
    Const { name, email, message } = req.body;
    
    If (!email || !message) {
      return res.status(400).json({ success: false, error: 'እባክዎ ኢሜይል እና መልዕክት በትክክል ያስገቡ!' });
    }

    Const adminNewOrder = new Contact({
      Name: name,
      Email: email,
      Message: `[የባለሙያ መልዕክት]፦ ${message}`, 
      Reply: message, 
      Status: 'ምላሽ ተሰጥቷል'
    });

    Await adminNewOrder.save();
    Res.status(201).json({ success: true, message: 'መልዕክትዎ ለደንበኛው ተልኳል!' });
  } catch (error) {
    Res.status(500).json({ success: false, error: 'መልዕክት መላክ አልተቻለም' });
  }
});

// ==========================================
// 8. የሰርቨር ጤንነት እና ማስነሻ (SERVER START)
// ==========================================
App.get('/api/health', (req, res) => {
  Res.status(200).json({ success: true, message: 'ሰርቨሩ ዝግጁ ነው!' });
});

Const PORT = process.env.PORT || 10000;
App.listen(PORT, () => console.log(`🚀 ሰርቨር በፖርት ${PORT} ላይ ስራ ጀመረ!`));
