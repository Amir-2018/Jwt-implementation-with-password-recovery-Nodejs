const Restaurant = require("../models/Restaurant");
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Food = require('../models/Food');
const Stat = require('../models/FindStat');
const Favoris = require('../models/Favoris');
var nodemailer = require('nodemailer');
const multer = require('multer');
const Storage = multer.diskStorage({
  destination: '/app/uploads',
  filename: function (req, file, cb) {
  //originalename Name of the file on the user’s computer
    cb(null, file.originalname );
  }
})
const upload = multer({
  storage : Storage
}).array('testImage',10)

module.exports.add_restaurant = (req, res) => {
  const token = req.cookies.jwt;
  var tab = []
  if (token) {
    jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        next();
      } else {

        let user = await User.findById(decodedToken.id);
        upload(req,res,(err)=>{
          if(err){
            console.log(err)  
          }else{
            var countI  = 0 ; 
            // Loop array of files 
            var str,slug ; 
            for (let i=0;i<req.files.length;i++){
              str = req.files[i].originalname;
              slug = str.split('.').pop();
              if(slug =='jpg' || slug =='png' || slug =='jpeg' || slug =='gif'|| slug =='bmp' ){
                 console.log('Thats ok...');
              }else{
                 countI  ++ ;
              }
            }
            
            
            if(countI == 0){
              const resto = new Restaurant({
                name : req.body.name,
                email : req.body.email,
                telephone : req.body.telephone,
                adresse : req.body.adresse,
                Gouvernorat : req.body.Gouvernorat,
                Categorie : req.body.Categorie,
                description : req.body.description,
                temps : req.body.temps,
                files : req.files 
              })
              var obj = resto
              obj['raiting'] = []
              obj['id_user'] = user._id ; 
              const result = Math.random().toString(36).substring(2,7);
              obj['identifiant'] = result
              obj.raiting_value = 0
              Restaurant.create(obj)
              .then(result=>{
                if(result){
                    res.status(200).json({
                        message : 'Restaurant created with success '
                    })
                }else{
                      res.status(200).json({
                          message : 'Restaurant does not be created'
                     })
                }
              })
          }else{
            res.status(500).json({
              message : 'Only image are accepted '
            })
          }
          }
        })
        
      }// token 
    })
  }



}
      
    function raitRestaurant(rait){
      var som = 0 ; 
      for(let i=0;i<rait.length;i++){
        for(let j=0;j<(rait[i].raiting).length;j++){
          som+=rait[i].raiting[j]
        }

        var uniqueArr = [...new Set(rait[i].raiting)]
      
          var somme = []
          for(let j=0;j<(uniqueArr).length;j++){
            var count = 0 ; 
            for(let k=0;k<rait[i].raiting.length;k++){
              if(uniqueArr[j]==(rait[i].raiting)[k]){
                  count ++
              }
            }
            somme.push(count)
          }
        

        var  average_rait = 0;
        for(var j=0;j<somme.length;j++){     
          average_rait +=(somme[j]*uniqueArr[j])
      }
       // // calcule total of raiting 
        var av_total = 0 ; 
        for(var a=0;a<uniqueArr.length;a++)
        av_total+=uniqueArr[a]
        av_total*=5
        console.log('av_totak = '+av_total)
        var raiting_final = average_rait/av_total
        console.log("rait "+raiting_final)
        rait[i].raiting_value = raiting_final
        console.log(rait[i].raiting_value)
      } 
      return rait ; 
    }

  module.exports.get_restlist = (req, res) => {
    const {page = 1,limit = 10} = req.query ;

    Restaurant.find({})
    .limit(limit *1)
    .skip((page -1)*limit) 
    .then(rait =>{
      if(rait){

       
        res.status(200).json({
          message : raitRestaurant(rait)
      })
              
      }else{
        res.status(500).json({
          message : 'No user found'
      })
      }
    })
    .catch({
        message : "Some error was occured"
    })
  }
  // get restaurant list by id 
 
  function calRait(rait){
      var som = 0 ; 
      for(var i=0;i<(rait.raiting).length;i++){
          som+=rait.raiting[i]  
      }

      var uniqueArr = [...new Set(rait.raiting)]
      var somme = []
      for(i=0;i<uniqueArr.length;i++){
          var count = 0 ; 
          for(var j=0;j<(rait.raiting).length;j++){
            if(uniqueArr[i]==(rait.raiting)[j]){
              count ++
            }
          }
          somme.push(count)
      }
      // calcaule raiting
      var  average_rait = 0;
      for(var j=0;j<somme.length;j++){     
        average_rait +=(somme[j]*uniqueArr[j])
      }
      // calcule total of raiting 
      var av_total = 0 ; 
      for(var i=0;i<uniqueArr.length;i++)
        av_total+=uniqueArr[i]
        av_total*=5
      var raiting_final = average_rait/av_total
      rait['raiting_value'] = raiting_final
      return rait
  }

  module.exports.get_restlistId = (req, res) => {
    Restaurant.findOne({_id:req.params.id})
    .then(rait =>{
      if(rait){
          res.status(200).json({
               message : calRait(rait) 
          })              
      }else{
          res.status(500).json({
            message : 'Restaurant not found'
          })
      }
    })
    .catch({
        message : "Some error was occured"
    })
  }


 
  module.exports.update_resto = (req, res) => {
    Restaurant.findOneAndUpdate({_id:req.params.id},{$set:{
        name:req.body.name,
        email:req.body.email,
        telephone:req.body.telephone,
        adresse:req.body.adresse,
        Gouvernorat : req.body.Gouvernorat,
        description : req.body.description,
        Catégorie : req.body.Catégorie,
        temps : req.body.temps
    }}).then(result=>{
        if(result)
            {
                res.status(200).json({
                    message : 'updated successfully'
                })
            }else{
                res.status(500).json({
                    message : 'Not updated ', 
                })
            }
    })
    .catch(err =>{
        res.status(500).json({
            message : err
        })
    })
  }
  // delete restaurant 
  module.exports.del_res = (req,res)=>{
  // search if user exist in favoris list
  
    Restaurant.findOne({_id:req.params.id}).then(result=>{
        if(result)
            {   
              User.findOne({_id : result.id_user}).then(user_fd=>{
                 
                if(user_fd){
                  var test = 0
                  for(let i=0;i<user_fd.favoris_resto.length;i++){
                    var id_us = user_fd.favoris_resto[i]._id
                    var param = req.params.id
                    test_equal = id_us == param 
                    if(test_equal){
                      test ++
                      User.updateOne( { _id: result.id_user }, { $pull: { favoris_resto: { _id: result._id } } } )
                      .then(up=>{
                        if(up){
                          Restaurant.deleteOne({_id:req.params.id}).then(del_resto =>{
                            if(del_resto){
                              res.status(200).json({
                                message : 'Delete with success'
                            })
                            }else{
                              res.status(200).json({
                                message : 'Restaurant not deleted'
                            })
                            }
                          })
                        }else{
                            res.status(500).json({
                              message : 'Not delete '
                          })
                        }
                      }).catch(err =>{
                        res.status(500).json({
                          message : err
                        })
                      })
                      
                     }
                     
                  }
                  if(test==0){
                    Restaurant.deleteOne({_id:req.params.id}).then(del_resto =>{
                      if(del_resto){
                        res.status(200).json({
                          message : 'Deleted but Not found in favoris list'
                        })
                      }else{
                        res.status(500).json({
                          message : 'Restaurant not deleted '
                        })
                      }
                    })
                   
                 }
                }else{
                   res.status(200).json({
                    message : 'User not found'
                })
                }
              }).catch(err =>{
                res.status(500).json({
                  message : err
              })
              })
               
            }else{
                res.status(500).json({
                    message : 'Restaurant not found '
                })
            }
    }).catch(err =>{
      res.status(500).json({
        message : err
    })
    })
  }
    // Add raiting to restaurant 
      module.exports.add_raiting = (req,res)=>{
        const token = req.cookies.jwt;
        if (token) {
          jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
            if (err) {
              res.locals.user = null;
              next();
            } else {
      
          let user = await User.findById(decodedToken.id);
          Restaurant.findOne({_id:req.params.id})
          .then(result =>{

              if(result){
                      
                      (result.raiting).push(req.body.raiting)
                      Restaurant.create(result).then(rait=>{
                          if(rait){
                            
                            User.findOne({_id:user._id}).then(fd =>{
                              if(fd.my_raiting_to_resto.length==  0){
                                User.findOneAndUpdate({_id : user._id},{$push:{
                                  my_raiting_to_resto : {
                                    restaurant : rait.name,
                                    avis : req.body.raiting
                                  }
                                }}).then(result =>{
                                  if(result){
                                    res.status(200).json({
                                      message :"New raiting added"
                                  })
                                  }else{
                                    res.status(200).json({
                                      message :"No raiting added"
                                  })
                                  }
                                }).catch(err =>{
                                  res.status(200).json({
                                    message :err
                                })
                                })
                              }else{
                                for(let i=0;i<fd.my_raiting_to_resto.length;i++){
                                  if(fd.my_raiting_to_resto[i].restaurant==rait.name){
                                    User.findOneAndUpdate({_id : user._id},{$set:{
                                      my_raiting_to_resto : {
                                        restaurant : rait.name,
                                        avis : req.body.raiting
                                      }
                                    }}).then(findR=>{
                                      res.status(200).json({
                                        message :"Find and update"
                                    })
                                    }).catch(err =>{
                                      res.status(200).json({
                                        message :err
                                    })
                                    })
                                   }//else{
                                       
                                  // }
                                }
                              }
                              
                            })
                                 

                          }else{
                              res.status(500).json({
                                  message : 'Raiting not added'
                              })
                          }
                      })                    
              }else{
                    res.status(500).json({
                    message : 'Restaurant not found'
                    })
              }
              }).catch({
                  message : "Some error was occured"
              })
          }
        })
      }
  }





// Add item to menu 

module.exports.add_item_to_menu = (req, res) => {
    const token = req.cookies.jwt;
    if (token) {
      jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
        if (err) {
          res.locals.user = null;
          next();
        } else {
          let user = await User.findById(decodedToken.id);

          upload(req,res,(err)=>{
            if(err){
                console.log(err)    
            }  
            
            else{

          const item = new Food({
            nom : req.body.nom,
            categorie : req.body.categorie,
            prix : req.body.prix,
            ingredients : req.body.ingredients,
            advertissement : req.body.advertissement,
            images : [],
            videos  : [],
        })
        
        for(i = 0;i<req.files.length;i++){
          if(req.files[i].mimetype.slice(0,9)=='video/mp4'){
            item.videos.push(req.files[i])
          }else{
            item.images.push(req.files[i])

          }
        }

          var obj = item ; 
          obj['raiting'] = []
          obj.raiting_value = 0


          Restaurant.findOne({id_user:user._id})
          .then(result =>{
            if(result){
                obj['id_resto'] = result._id  
                Food.create(obj)
                    .then(fd =>{
                        if(fd){
                            res.status(200).json({
                                message : 'Item added to menu'
                            })
                        }else{
                            res.status(500).json({
                                message : 'Item not added to menu'
                            })
                        }
                     })
                     .catch(err =>{
                        res.status(500).json({
                            message : 'Error with creating food '
                        })
                     })
            }else{
              res.status(500).json({
                message : 'Please verify your authentication'
            })
            }
          }).catch(err =>{
            res.status(500).json({
                message : 'Error with finding restaurant '
            })
         })
        }
      })
//
        }
      });
    } else {
      res.locals.user = null;
      next();
    }

}

    module.exports.add_raiting_to_food = (req,res)=>{
        Food.findOne({_id:req.params.id})
        .then(result =>{

            if(result){
                    (result.raiting).push(req.body.raiting)
                    Food.create(result).then(rait=>{
                        if(rait){
                          var som = 0 ; 
                          for(var i=0;i<(rait.raiting).length;i++){
                              som+=rait.raiting[i]
                          }
                              //////////////////////////////////

                              var uniqueArr = [...new Set(rait.raiting)]
                              var somme = []
                              for(i=0;i<uniqueArr.length;i++){
                                var count = 0 ; 
                                for(var j=0;j<(rait.raiting).length;j++){
                                  if(uniqueArr[i]==(rait.raiting)[j]){
                                    count ++
                                  }
                                }
                                somme.push(count)
                              }
                              
                              ///////////////////////////////////
                              // calcaule raiting
                            var  average_rait = 0;
                            console.log(uniqueArr)
                            console.log(somme)
                            for(var j=0;j<somme.length;j++){
                              
                              average_rait +=(somme[j]*uniqueArr[j])
                            }
                            // calcule total of raiting 
                            var av_total = 0 ; 
                            for(var i=0;i<uniqueArr.length;i++)
                              av_total+=uniqueArr[i]
                              av_total*=5
                            var raiting_final = average_rait/av_total
                            res.status(200).json({
                                message : "Raiting added to item with success "
                            })
                        }else{
                            res.status(500).json({
                                message : 'Raiting not added'
                            })
                        }
                    }) 


                    
            }else{
                res.status(500).json({
                message : 'Food not found'
            })
            }

            })
            .catch({
                message : "Some error was occured"
            })
        }

        module.exports.get_restaurant_menu = (req, res) => {
            Restaurant.findOne({_id:req.params.id})
            .then(result =>{
              if(result){
               Food.find({id_resto : result._id})
               .then(fn =>{
                if(fn){
                    res.status(200).json({
                        message : raitRestaurant(fn)
                    })
                }else{
                    res.status(500).json({
                        message : "No menu founded"
                    })
                }
               })
               .catch(err=>{
                res.status(500).json({
                    message : "Some error ocurred with retriving data"
                })
               })       
              }else{
                res.status(500).json({
                  message : 'No Restaurant found'
              })
              }
            })
            .catch({
                message : "Some error was occured with finding restaurant "
            })
          }
// Filter by name
module.exports.find_by_name = (req, res) => {
    Restaurant.findOne({name:req.body.name})
    .then(result =>{
      if(result){
            res.status(200).json({
              message : calRait(result)
          })
          }else{
            res.status(500).json({
              message : "No restaurant found"
          })
          }
        }) 
    .catch({
        message : "Some error was occured"
    })
  }
  module.exports.find_by_identifiant = (req, res) => {
    Restaurant.findOne({identifiant:req.body.identifiant})
    .then(result =>{
      if(result){
        console.log(result)
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        today = mm + '/' + dd + '/' + yyyy;
        Stat.create({stat : today}).then(ress=>{
          if(ress){
            res.status(200).json({
              message :calRait(result)
          })
          }else{
            res.status(500).json({
              message : "Error  to registrate date"
          })
          }
        })
      
              
      }else{
        res.status(500).json({
          message : 'Restaurant not found'
      })
      }
    })
    .catch({
        message : "Some error was occured"
    })
  }
  module.exports.upload = (req, res) => {
    res.send({
        success : true,
        message : req.files
    })
  }
  module.exports.get_dash_data = (req, res) => {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = mm + '/' + dd + '/' + yyyy;
    Stat.find({stat:today})
    .then(result =>{
      if(result){
        Restaurant.find({}) 
          .then(fn=>{
          if(fn){
            res.status(200).json({
              recherche_par_idetifiant_par_jour : result.length,
              nombre_de_battandes : fn.length
          })
          }else{
            res.status(500).json({
              message : "Error with getting data about restaurant "
          })
          }
        })
       
      }else{
        res.status(200).json({
          message : 0
      })
      }
    })
    .catch(err=>{
      res.status(500).json({
        message : "Error with retriving data"
    })
    })
  }
  module.exports.filter = (req, res) => {

    var filter_request = {
      name:req.body.name,
      Gouvernorat:req.body.Gouvernorat,
      Categorie:req.body.Categorie
    };

    // delete attribute with null or any

    Object.keys(filter_request).forEach(key => {
      if(filter_request[key]=="null"|| filter_request[key]=="any" || filter_request[key]==undefined|| filter_request[key]=="" ){
        delete filter_request[key]
      }
    });
    // calculate raiting of restaurant
    Restaurant.find(filter_request)
    .then(result=>{
      if(result){
        if(req.body.score =="" || req.body.score=="any" ||req.body.score=="null")
          {
            res.status(200).json({
              message : result
            })
          }else{
            if(result.length>0){
              var tab = []
              for(let i=0 ;i<result.length;i++){
                if(req.body.score == calRait(result[i]).raiting_value){
                  tab.push(result[i])
                }
              }
              res.status(200).json({
                message : tab
            })
            }
          }
      
    
      }else{
        res.status(500).json({
          message : 'No data founded'
      })
      } 
    })
    .catch(err=>{
      console.log(err)
    })
  }

  
  module.exports.get_dash_categories = (req, res) => {
    Food.find({})
    .then(result =>{
      if(result){
        var tab = []
        for(var a=0;a<result.length;a++){
          tab.push(result[a].categorie)
        }
        var uniqueArr = [...new Set(tab)]
        var som = []
        for(i=0;i<uniqueArr.length;i++){
          var count = 0 ; 
          for(var j=0;j<tab.length;j++){
            if(uniqueArr[i]==tab[j]){
              count ++
            }
          }
          som.push(count)
        }
            res.status(200).json({
              message : uniqueArr,
              unique : som
          })
          }else{
            res.status(500).json({
              message : "Error  to registrate date"
          })
          }
        }) 
    .catch({
        message : "Some error was occured"
    })
  }
  module.exports.add_resto_to_favoris = (req, res) => {
    const token = req.cookies.jwt;
    if (token) {
      jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
        if (err) {
          res.locals.user = null;
          next();
        } else {
          let user = await User.findById(decodedToken.id);
          Restaurant.findOne({_id:req.params.id})
          .then(result =>{
            if(result){
              User.findOne({_id : user._id})
              .then(fuser =>{
                User.updateOne(
                  { _id: fuser._id },
                  { $push: { favoris_resto: result } }
               ).then(up =>{
                if(up){
                  res.status(200).json({
                    message : 'Updated with success'
                  })
                }else{
                  res.status(500).json({
                    message : 'Not updated'
                  })
                }
               })
              }).catch(err =>{
                res.status(500).json({
                  message : 'Error occured while searching for user'
                })
              })
            }else{
              console.log('not added to favorite');            }
          }).catch(err =>{
            res.status(500).json({
              message : 'Error occured while searching for restaurant'
            })
          })
        }
      })
    }
  }

  module.exports.add_item_to_favoris = (req, res) => {
    const token = req.cookies.jwt;
    if (token) {
      jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
        if (err) {
          res.locals.user = null;
          next();
        } else {
          let user = await User.findById(decodedToken.id);
          Food.findOne({_id:req.params.id})
          .then(result =>{
            if(result){
              User.findOne({_id : user._id})
              .then(fuser =>{
                User.updateOne(
                  { _id: fuser._id },
                  { $push: { favoris_item: result } }
               ).then(up =>{
                if(up){
                  res.status(200).json({
                    message : 'Updated with success'
                  })
                }else{
                  res.status(500).json({
                    message : 'Not updated'
                  })
                }
               })
              }).catch(err =>{
                res.status(500).json({
                  message : 'Error occured while searching for user'
                })
              })
            }else{
              console.log('not added to favorite');            }
          }).catch(err =>{
            res.status(500).json({
              message : 'Error occured while searching for restaurant'
            })
          })
        }
      })
    }
  }

  module.exports.get_favoris_resto = (req, res) => {
    const token = req.cookies.jwt;
    if (token) {
      jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
        if (err) {
          res.locals.user = null;
          next();
        } else {
          let user = await User.findById(decodedToken.id);

            if(user){
              var tab = [] ; 
              // for(let i=0;i<user.favoris_resto.length;i++){
                
              //   tab.push(raitRestaurant(user.favoris_resto[i]))
              // }

              res.status(200).json({
                message : raitRestaurant(user.favoris_resto)
              })
            }else{
              res.status(500).json({
                message : 'User not found'
              })
            }
          }
        })  
    }else{
      res.status(500).json({
        message : 'You are not the specific user'
      })
    }
}
module.exports.get_favoris_item = (req, res) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        next();
      } else {
        let user = await User.findById(decodedToken.id);
          if(user){
            res.status(200).json({
              message : raitRestaurant(user.favoris_item) 
            })
          }else{
            res.status(500).json({
              message : 'User not found'
            })
          }
        }
      })  
  }else{
    res.status(500).json({
      message : 'You are not the specific user'
    })
  }
}
const generateCode = ()=>{
  let code = Math.floor(Math.random() * 100000);
  return code.toString() ; 
}

function sendMail(user){
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'amir.maalaoui27@gmail.com',
        pass: 'xbrwuldvynvidhdy'
      }
    });

    var mailOptions = {
      from: 'amir.maalaoui27@gmail.com',
      to: user,
      subject: 'Sending Email using Node.js',
      text: codeV
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
} 
var codeV = generateCode();

const store = require("store2");

module.exports.send_email = (req, res) => {  
  User.findOne({email : req.body.email })
  .then(user =>{
    if(user){
      const use = req.body.email
      sendMail(use);
      store('Code', {code:codeV,email:req.body.email}); 
      res.status(500).json({
        message : 'Verification code is sent to your email'
      })
    }else{
      res.status(500).json({
        message : 'User not found'
      })
    }
  }).catch(err=>{
    res.status(200).json({
      message : err
    })
  })
}
module.exports.verify_code = (req, res) => {
   
  // User.findOne({email : req.body.email })
  const code  = (store.getAll().Code.code)
  if((req.body.code)== code){  
    res.status(200).json({
      message : 'The same code now you can change your password'
    })
  }else{
    res.status(500).json({
      message : 'Verify your verification code '
    })
  }

}
const bcrypt = require('bcrypt');

module.exports.change_pass = async (req, res) => {   
  // User.findOne({email : req.body.email })
  const newpass = req.body.newpass ; 
  const hashedPassword = await bcrypt.hash(newpass,10);
  User.findOne({email:(store.getAll().Code.email)})
  .then(user =>{
    if(user){
      User.findOneAndUpdate({email:(store.getAll().Code.email)},{$set:{
        password : hashedPassword
      }})
      .then(pass =>{
        if(pass){
          res.status(200).json({
            message : 'password updated with success'
          })
        }else{
          res.status(500).json({
            message : 'password not updated'
          })
        }
      })
    }else{
      res.status(500).json({
        message : 'User not found'
      })
    }
  }).catch(err=>{
    res.status(200).json({
      message : err
    })
  })
}

module.exports.mes_avis =  (req, res) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        next();
      } else {
        let user = await User.findById(decodedToken.id);
        User.findOne({_id:user._id})
        .then(result=>{
          if(result){
            res.status(200).json({
              message : result.my_raiting_to_resto
            })
          }else{
            res.status(500).json({
              messagr404 : "User not found"
            })
          }
        }).catch(err =>{
          res.status(200).json({
            eroor : err
          })
        })
      }
    })
  }  
}