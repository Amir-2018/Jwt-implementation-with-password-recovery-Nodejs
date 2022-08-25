const { Router } = require('express');
const authController = require('../controllers/authController');
const restoController = require('../controllers/restaurant.controller');
const crudController = require('../controllers/crudUsers');
const { requireAuth, checkUser } = require('../middleware/authMiddleware');
const router = Router();

router.post('/signup', authController.signup_post);
//router.post('/verif', authController.verif);
router.post('/login', authController.login_post);
router.get('/logout', authController.logout_get);
router.get('/getUserById/:id',requireAuth,checkUser, crudController.getUserById);
router.get('/getAllUsers',requireAuth,checkUser, crudController.getAllUsers);

router.delete('/delUser/:id',requireAuth,checkUser, crudController.del_user);
router.put('/updateUser/',requireAuth,checkUser, crudController.update_user);
// Restaurant functions
router.post('/add_restaurant',requireAuth,checkUser,restoController.add_restaurant);
// Get restaurant list by Id
router.get('/getRestoList',requireAuth,checkUser, restoController.get_restlist);
// update by id
router.put('/update_resto/:id',requireAuth,checkUser, restoController.update_resto);//
//get restaurant list and info by id
router.get('/getRestoListId/:id',requireAuth,checkUser, restoController.get_restlistId);
// delete restaurant by Id
router.delete('/del_res/:id',requireAuth,checkUser, restoController.del_res);
// Add raiting to restaurant 
router.post('/add_raiting/:id',requireAuth,checkUser,restoController.add_raiting);
router.post('/add_item/',restoController.add_item_to_menu);
// Add raiting to restaurant 
router.post('/add_raiting_to_food/:id',requireAuth,checkUser,restoController.add_raiting_to_food );
router.get('/get_restaurant_menu/:id',requireAuth,checkUser,restoController.get_restaurant_menu);
router.post('/find_by_name/',requireAuth,checkUser,restoController.find_by_name);
router.post('/filter/',requireAuth,checkUser,restoController.filter);//
router.get('/get_dash_data/',requireAuth,checkUser,restoController.get_dash_data);
router.post('/find_by_identifiant/',requireAuth,checkUser,restoController.find_by_identifiant);
router.put('/change_password/',requireAuth,checkUser,crudController.change_password );
router.get('/get_dash_categories/',requireAuth,checkUser,restoController.get_dash_categories);
// add restaurant to favoris
router.post('/favoris_resto/:id',requireAuth,checkUser,restoController.add_resto_to_favoris);
router.get('/get_favoris_resto/',requireAuth,checkUser,restoController.get_favoris_resto);
router.get('/get_favoris_item/',requireAuth,checkUser,restoController.get_favoris_item  );
router.post('/favoris_item/:id',requireAuth,checkUser,restoController.add_item_to_favoris);
router.post('/send_email/',restoController.send_email);
router.post('/verify_code/',restoController.verify_code);
router.put('/change_pass/',restoController.change_pass);
router.get('/mes_avis/',requireAuth,checkUser,restoController.mes_avis  );
router.post('/signup_admin/',crudController.signup_admin);
router.post('/login_admin/',crudController.login_super_user);
router.post('/add_partner/',crudController.add_partner);
router.post('/contact_us/',crudController.contact_us);




// Crud of food 




module.exports = router;