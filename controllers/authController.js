const User = require("../models/User");
const Admin = require("../models/Admin");
const jwt = require('jsonwebtoken');

// handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: '', password: '' };

  // incorrect email
  if (err.message === 'incorrect email') {
    errors.email = 'That email is not registered';
  }

  // incorrect password
  if (err.message === 'incorrect password') {
    errors.password = 'That password is incorrect';
  }

  // duplicate email error
  if (err.code === 11000) {
    errors.email = 'that email is already registered';
    return errors;
  }

  // validation errors
  if (err.message.includes('user validation failed')) {
    // console.log(err);
    Object.values(err.errors).forEach(({ properties }) => {
      // console.log(val);
      // console.log(properties);
      errors[properties.path] = properties.message;
    });
  }

  return errors;
}

// create json web token
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, 'net ninja secret', {
    expiresIn: maxAge
  });
};

// controller actions
module.exports.signup_get = (req, res) => {
  res.render('signup');
}

module.exports.login_get = (req, res) => {
  res.render('login');
}


module.exports.signup_post = async (req, res) => {
  // const { name_lastname,email,catégorie,sexe, password,confirm_password } = req.body;
  try {
    

        if(req.body.password == req.body.confirm_password){
              const user = new User({
                full_name : req.body.full_name,
                email : req.body.email,
                sexe : req.body.sexe,
                password : req.body.password,
                categorie : req.body.categorie
                
              })
              // const user = await User.create({ name_lastname,email,catégorie,sexe, password,image{}});
              user.save()
              .then(result =>{
                if(result){
                  const token = createToken(user._id);
                  res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
                  res.status(201).json({
                    message : 'Account created with success'
                  });
                }else{
                  res.status(201).json({
                    message : 'Account does not be saved to the database'
                  });
                }
              })
              .catch(err =>{
                res.status(201).json({
                  message : 'Email already registred'
                });
              })
            
        }else{
              res.status(500).json({
                message : 'password and confirm_password are not the same '
              });
        }


  }
  catch(err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
 
}

module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({
      message : user
    });
  } 
  catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }

}

module.exports.logout_get = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 });
  res.status(200).json({message : 'You are logged out'});
}

module.exports.addAdmin = async (req, res) => {
  const { name,lastname,email, password } = req.body;
  try {
    const admin = await Admin.create({ name,lastname,email, password });
    const token = createToken(admin._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ admin: admin._id });
  }
  catch(err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
}

