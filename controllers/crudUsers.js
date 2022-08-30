const User = require("../models/User");
const Admin = require("../models/Admin");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const Partner = require("../models/Partner");
const Contact = require("../models/Contact");

module.exports.del_user = (req,res)=>{
  User.deleteOne({_id:req.params.id})
  .then(result=>{
      if(result)
          {
              res.status(200).json({
                  message : 'removed successfully'
              })
          }else{
              res.status(500).json({
                  message : 'not removed '
              })
          }
  }).catch(err=>{
    res.status(500).json({
      message : 'Execption while updating user '+err 
  })
  })
}

const Storage = multer.diskStorage({
  destination: '../app/uploads/',
  filename: function (req, file, cb) {
  //originalename Name of the file on the user’s computer
    cb(null, file.originalname );
  }
})

const upload = multer({
  storage : Storage,
  limits: {
    fileSize: 5000000,
  },
}).single('testImage')

module.exports.update_user = (req,res)=>{
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        next();
      } else {
            var userF = await User.findById(decodedToken.id);

      upload(req,res,(err)=>{
        if(err){
          if(err.code == 'LIMIT_FILE_SIZE'){
            res.status(500).json({
                message : "Image size is over than 5MB"
            })   
        }     
        }  
        else{

          const str = req.file.originalname;
          const slug = str.split('.').pop();
          if(slug =='jpg' || slug =='png' || slug =='jpeg' || slug =='gif'|| slug =='bmp' ){
                const user = new User({
                  full_name : req.body.full_name,
                  email : req.body.email,
                  sexe : req.body.sexe,
                  categorie : req.body.categorie,
                  picture:{
                    data : req.file.filename,
                    contentType : 'image/png'
                  }

                })
                const obj = {
                  full_name : user.full_name,
                  email : user.email,
                  sexe : user.sexe,
                  picture:{
                    data : req.file.filename,
                    contentType : 'image/png'
                  },
                  categorie : user.categorie
                }
                User.findOneAndUpdate({_id:userF._id},{$set:obj})
                .then(result=>{
                    if(result)
                        {
                            res.status(200).json({
                                message : 'updated successfully'
                            })
                        }else{
                            res.status(500).json({
                                message : 'Not updated ' 
                            })
                        }
                }).catch(err=>{
                  res.status(500).json({
                    message : 'Execption while updating user '+err 
                })
                })
              }else{
                res.status(500).json({
                  message : 'Only image are accepted '
              })
              }
            } // else 
          }) // upload
    }
  })
  }
}

module.exports.getAllUsers = (req, res) => {
  const {page = 1,limit = 10} = req.query ;
  User.find({})
  .limit(limit *1)
  .skip((page -1)*limit) 
  .then(result =>{
    if(result){
      res.status(200).json({
        message : result
    })
            
    }else{
      res.status(500).json({
        message : 'No user found'
    })
    }
  }).catch(err =>{
    res.status(500).json({
      message : 'Exception while getting all users'+err
  })
  })
}

module.exports.getUserById = (req, res) => {
  User.findOne({_id:req.params.id}).then(result =>{
    if(result){
      res.status(200).json({
        message : result
    })
            
    }else{
      res.status(500).json({
        message : 'No user found'
    })
    }
  }).catch(err =>{
    res.status(500).json({
      message : 'Exception while getting all users'+err
  })
  })
} 



module.exports.change_password = (req,res)=>{
  var obj = 
  {
    actual_pass:req.body.actual_pass,
    new_pass:req.body.new_pass,
    confirm_pass:req.body.confirm_pass
  }
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        next();
      } else {
        let user = await User.findById(decodedToken.id);
        if(user){
          if(obj.new_pass==obj.confirm_pass){
          const auth = await bcrypt.compare(obj.actual_pass, user.password);
            if(auth){ 
              console.log('thr same ')
              const hashedPassword = await bcrypt.hash(obj.new_pass,10);
              User.findOneAndUpdate({_id:user._id},{$set:{password: hashedPassword}})
              .then(modify =>{
                if(modify){
                  res.status(200).json({
                    message : 'Password modified with success   '
                  })
                }else{  
                  res.status(500).json({
                    message : 'Password not modified'
                  })
                }
              }).catch(err=>{
                res.status(500).json({
                  message : 'Error while updating password of user '+err
                })
              })
            }else{
              res.status(500).json({
                message : 'Acual password and password that you search for change are not the same' 
              })
            }
        }else{
          res.status(500).json({
           
            message : ' password and confirm password are not the same'
          })
        }
      }else{
        res.status(500).json({
          message : 'You are not authenticated'
        })
      }
      }
    })
  }else{
    res.status(500).json({
      message : 'You are not authenticated'
    })
  }
}


module.exports.signup_admin = (req, res) => {
Admin.findOne({email:req.body.email}).then(email_founded =>{
  if(email_founded){
    res.status(500).json({
      message : 'That email exist'
    })
  }else{
    Admin.create(req.body).then(result =>{
      if(result){
        res.status(200).json({
          message : 'Admin created with success'
        })
      }else{
        res.status(200).json({
          message : 'Failed to create Admin'
        })
      }
    }).catch(err =>{
      console.log(err);
    })
  }
})

}
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, 'net ninja secret', {
    expiresIn: maxAge
  });
};
module.exports.login_super_user = async (req, res) => {

    //const token = createToken(admin._id);
    //res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
  Admin.findOne({email : req.body.email})
  .then( async result =>{
    if(result){

      const auth = await bcrypt.compare(req.body.password, result.password);
      if(auth){
        try{
        const token = createToken(result._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        }catch(err){
          console.log(err)
        }
        res.status(200).json({
          message : result
        })
      }

    }else{
      res.status(500).json({
        message : 'Admin not founded'
      })
    }
  })
  .catch(err =>{
    res.status(500).json({
      message : 'There is some exception'
    })
  })

}
module.exports.add_partner = async (req, res) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        next();
      } else {
        let admin = await Admin.findById(decodedToken.id);
        if(admin){
          let email_admin = await Admin.findOne({email:req.body.email});
          if(email_admin){
            res.status(500).json({
              message : 'email already exist'
            })
          }else{
            Partner.create(req.body).then(partner =>{
              if(partner){
                console.log(partner._id);
                var obj = {
                  id_partner : partner._id,
                  full_name :partner.full_name,
                  email : partner.email,
                  password : partner.password
  
                }
                Admin.create(obj).then( obj_c=>{
                  if(obj_c){
                    res.status(200).json({
                      message : 'Partner added as admin'
                    })
                  }else{
                    res.status(500).json({
                      message : 'Partner not added as admin'
                    })
                  }
                }).catch(err =>{
                  console.log(err)
                })
              }
            }).catch(err =>{
              console.log(err)
            })
          }

          // res.status(200).json({
          //   message : 'Partner created'
          // })
        }else{
            res.status(500).json({
              message : 'You are not authenticated admin'
            })
        }

      }
    })
  }else{
    res.status(500).json({
      message : 'Please verify your authentication'
    })
  }
}


module.exports.contact_us = async (req, res) => {
Contact.create(req.body).then(msg =>{
  if(msg){
    res.status(200).json({
      message : 'Message sent with success'
    })
  }
  else{
    res.status(500).json({
      message : 'Message does not be sent'
    })
  }
})
}
