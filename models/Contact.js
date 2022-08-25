const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

  full_name:{
    type : String
  },
  email:{
    type : String
  },

  telephone:{
    type : String
  },
  message:{
    type : String
  }



});

const Contact = mongoose.model('contact', userSchema);

module.exports = Contact;