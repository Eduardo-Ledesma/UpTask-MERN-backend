import User from "../models/User.js";
import generateId from "../helpers/generateId.js";
import generateJWT from "../helpers/generateJWT.js";
import { registerEmail, forgetPasswordEmail } from "../helpers/emails.js";

// User Register
const register = async (req, res) => {
    // Validating duplicated registers
    const { email } = req.body;
    const userExist = await User.findOne({email})

    if(userExist) {
        const error = new Error('The user already exist');
        return res.status(400).json({ msg: error.message });
    }

    try {
        const user = new User(req.body);
        user.token = generateId(); // Add token to user
        await user.save();

        // Send confirmation email
        const { name, email, token } = user;
        registerEmail({ name, email, token })

        res.json({ msg: 'Successfully signed up! Check your email to validate your account.'});
    } catch (error) {
        console.log(error);
    }
}

// User Authentication
const authentication = async (req, res) => {
    const { email, password } = req.body;
    
    // Verify if user exist
    const user = await User.findOne({email});
    if(!user) {
        const error = new Error('User not found')
        return res.status(404).json({ msg: error.message });
    }

    // Verify if user is confirmed
    if(!user.confirmed) {
        const error = new Error('You account was not confirmed yet')
        return res.status(403).json({ msg: error.message });
    }

    // Verify password
    if(await user.validatePassword(password)) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateJWT(user._id)
        })
    } else {
        const error = new Error('Password incorrect')
        return res.status(403).json({ msg: error.message });
    }
}

// Confirm account with one-use token
const confirm = async (req, res) => {
    const { token } = req.params;
    const confirmUser = await User.findOne({token});
    if(!confirmUser) {
        const error = new Error('Invalid Token')
        return res.status(403).json({ msg: error.message });
    }

    try {
        confirmUser.confirmed = true;
        confirmUser.token = '';
        await confirmUser.save();
        res.json({ msg: 'Your account was confirmed!' });
    } catch (error) {
        console.log(error);
    }
}

// if user forgot the password
const forgetPassword = async (req, res) => {
    const { email } = req.body;
    const userExist = await User.findOne({email})

    if(!userExist) {
        const error = new Error('Email not found');
        return res.status(400).json({ msg: error.message });
    }
    if(userExist.token.length) {
        const error = new Error('The password reset request has already been sent for this email address');
        return res.status(409).json({ msg: error.message });
    }

    try {
        userExist.token = generateId();
        await userExist.save();
        const { name, token } = userExist;
        forgetPasswordEmail({ name, email, token });
        res.json({ msg: 'We have sent you an email with the instructions.' });
    } catch (error) {
        console.log(error);
    }
}

// Validating the token sent by email
const validateToken = async (req, res) => {
    const { token } = req.params;
    const validToken = await User.findOne({token});

    if(!validToken) {
        const error = new Error('Invalid token');
        return res.status(400).json({ msg: error.message });
    } 
    res.json({ msg: 'Token is valid'})
}

const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    const user = await User.findOne({token});

    if(!user) {
        const error = new Error('User not found');
        return res.status(400).json({ msg: error.message });
    }

    user.password = password;
    user.token = '';
    try {
        await user.save();
        return res.json({ msg: 'Password changed successfully'});
    } catch (error) {
        console.log(error);
    }
}

const profile = (req, res) => {
    const { user } = req;
    res.json(user)
}

export {
    register,
    authentication,
    confirm,
    forgetPassword,
    validateToken,
    resetPassword,
    profile
}