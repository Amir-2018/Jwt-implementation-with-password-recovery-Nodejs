const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

  full_name:{
    type : String
  },
  email:{
    type : String
  },
  password:{
    type : String
  },
  telephone:{
    type : String
  },
  enseigne:{
    type : String
  },
  categorie:{
    type : Number
  },
  adresse:{
    type : String
  },
  matricule:{
    type : Number
  }


});

const Partner = mongoose.model('partner', userSchema);

module.exports = Partner;