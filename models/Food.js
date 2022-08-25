const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

  id_resto:{
    type : String
  },
  nom : {
    type:String
  },
  categorie:{
    type:String
  },
  prix:{
    type:String
  },
  ingredients:{
    type : String
  },

  advertissement:{
    type:String
  },
  images: [Object],
  videos: [Object],
  raiting_value:{
    type : Number
  },
  raiting:{
    type : []
  },
});

const Food = mongoose.model('food', userSchema);

module.exports = Food;