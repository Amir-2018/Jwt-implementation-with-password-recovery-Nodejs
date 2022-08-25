const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

restaurant : [],
item : [],
});

const Favoris = mongoose.model('favoris', userSchema);

module.exports = Favoris;