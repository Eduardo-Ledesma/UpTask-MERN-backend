import express from "express";
import { register, 
        authentication, 
        confirm, 
        forgetPassword, 
        validateToken,
        resetPassword,
        profile
} from "../controllers/userController.js"
import checkAuth from "../middleware/checkAuth.js";

const router = express.Router();

// Users register, autentication and confirmation
router.post('/', register); // create a new user
router.post('/login', authentication) // authenticate user
router.get('/confirm/:token', confirm) // confirm account
router.post('/forgot-password', forgetPassword) // password forgotten
router.route('/forgot-password/:token').get(validateToken).post(resetPassword) // reset password
router.get('/profile', checkAuth, profile) // show profile


export default router