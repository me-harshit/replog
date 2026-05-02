const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, default: 'New Athlete' }, 
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  profile: {
    dob: { type: Date },
    height: { type: Number }, 
    weight: { type: Number },
    avatarUrl: { type: String, default: '' } 
  }
}, { timestamps: true });

UserSchema.pre('save', async function() { 
  if (!this.isModified('password')) return; 
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);