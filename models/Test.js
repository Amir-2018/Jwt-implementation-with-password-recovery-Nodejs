const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

  name:{
    type : String
  },
  image : {
    data : Buffer,
    contentType : String
  }

});

const Test = mongoose.model('test', userSchema);

module.exports = Test;