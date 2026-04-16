import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createSuperadmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if superadmin already exists
    const existingUser = await User.findOne({ email: '12kishan97@gmail.com' });
    if (existingUser) {
      console.log('Superadmin already exists:', existingUser.username);
      await mongoose.connection.close();
      return;
    }

    // Create superadmin user
    const superadmin = new User({
      username: 'superadmin',
      email: '12kishan97@gmail.com',
      password: 'kishan121997',
      plainPassword: 'kishan121997',
      role: 'superadmin',
      isActive: true,
    });

    await superadmin.save();
    console.log('Superadmin created successfully!');
    console.log('Email:', superadmin.email);
    console.log('Username:', superadmin.username);
    console.log('Role:', superadmin.role);
    console.log('Password (Plain):', 'kishan121997');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error creating superadmin:', error.message);
    process.exit(1);
  }
};

createSuperadmin();
