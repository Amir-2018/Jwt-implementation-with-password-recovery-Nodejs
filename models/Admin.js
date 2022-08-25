const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  full_name: {
    type: String,
  },

  email: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlength: [6, 'Minimum password length is 6 characters'],
  },
  id_partner:{
    type:String
  }
});


// fire a function before doc saved to db
userSchema.pre('save', async function(next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// static method to login user
userSchema.statics.login_admin = async function(email, password) {
  const admin = await this.findOne({ email });
  if (admin) {
    const auth = await bcrypt.compare(password, admin.password);
    if (auth) {
      return admin;
    }
    throw Error('incorrect password');
  }
  throw Error('incorrect email');
};

const Admin = mongoose.model('admin', userSchema);

module.exports = Admin;