const express=require('express')
const userController=require('D:\\Backend\\4-natours\\starter\\controllers\\userController.js')
const authController=require('D:\\Backend\\4-natours\\starter\\controllers\\authController.js')
const router=express.Router()

router.post('/signup',authController.signup)
router.post('/login',authController.login)
router.get('/logout',authController.loggOut)

router.post('/forgotpassword',authController.forgotPassword)
router.patch('/resetpassword/:token',authController.resetPassword)
router.patch('/updatepassword',authController.protect,authController.updatePassword)

//Middleware function to check if the user is authenticated
router.use(authController.protect)

router.get('/me',userController.getme,userController.getUser)

router.patch('/updateuserdata',
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateUserData)
    
router.delete('/deleteuser',userController.deleteUser)
 
router.use(authController.restrict("admin"))

router
.route('/')
.get(userController.getUsers)

router
.route('/:id')
.get(userController.getUser)
.patch(userController.updateUser)
.delete(userController.delUser)

module.exports=router