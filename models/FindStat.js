const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

  stat:{
    type : String
  },

});

const FindStat = mongoose.model('findstat', userSchema);

module.exports = FindStat;