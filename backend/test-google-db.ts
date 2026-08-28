import mongoose from 'mongoose';
import { env } from './src/config/env.js';
import { UserModel } from './src/models/user.model.js';
import { hashPassword } from './src/utils/password.js';

async function run() {
  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected to DB');
  
  const googlePayload = {
    name: 'Demo User (Google)',
    email: 'demo.google@example.com',
    picture: 'https://lh3.googleusercontent.com/a/mock-profile-pic'
  };
  
  console.log('Simulating Google Login Data Reception:', googlePayload);
  
  let user = await UserModel.findOne({ email: googlePayload.email });
  if (!user) {
    console.log('User not found, saving new Google entry to database...');
    user = await UserModel.create({
      name: googlePayload.name,
      email: googlePayload.email,
      passwordHash: await hashPassword('random-secure-string'),
      profile: { avatar: googlePayload.picture }
    });
  }
  
  console.log('\n--- Entry successfully saved in MongoDB! ---');
  console.log(user);
  
  await mongoose.disconnect();
}
run();

