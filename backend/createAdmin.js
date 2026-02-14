const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User Schema (simplified version)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
});

const User = mongoose.model('User', userSchema);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/smart-garbage-reporting', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('✅ Connected to MongoDB');
  
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@smartgarbage.com' });
    
    if (existingAdmin) {
      console.log('❌ Admin user already exists with email: admin@smartgarbage.com');
      console.log('To login: Email: admin@smartgarbage.com | Password: admin123');
      process.exit(0);
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Create admin user
    const admin = new User({
      name: 'Admin',
      email: 'admin@smartgarbage.com',
      password: hashedPassword,
      role: 'admin'
    });
    
    await admin.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('  Admin Login Credentials:');
    console.log('═══════════════════════════════════════');
    console.log('  Email:    admin@smartgarbage.com');
    console.log('  Password: admin123');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('⚠️  Please change the password after first login!');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error.message);
  process.exit(1);
});
