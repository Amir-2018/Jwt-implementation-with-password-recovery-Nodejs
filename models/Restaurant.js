const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,   
    // required: [true, 'Please enter a password'],
    // minlength: [6, 'Minimum password length is 6 characters'],
  },
  telephone: {
    type: Number,   
    // required: [true, 'Please enter a password'],
    // minlength: [6, 'Minimum password length is 6 characters'],
  },
  adresse: {
    type: String,   
    // required: [true, 'Please enter a password'],
    // minlength: [6, 'Minimum password length is 6 characters'],
  },
  Gouvernorat: {
    type: String,
  },
  Categorie: {
    type: String
  },
  description: {
    type: String,   
    // required: [true, 'Please enter descript'],
    minlength: [6, 'Minimum password length is 6 characters'],
  },

  temps: [] ,
  files: [Object],
  raiting:{
    type : []
  },
  raiting_value:{
    type : Number
  },
  id_user : {
    type :String
  },
  id_fan : {
    type : String
  },
  identifiant : {
    type :String
  },
  
});






const Restaurant = mongoose.model('restaurant', userSchema);

module.exports = Restaurant;