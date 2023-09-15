import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Validate if user have the token to show his profile
const checkAuth = async (req, res, next) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password -confirmed -token -createdAt -updatedAt -__v');
            return next();
        } catch (error) {
            return res.status(404).json({ msg: 'Invalid Token'});
        }
    }

    if(!token) {
        const error = new Error('Ups... an error ocurred');
        return res.status(401).json({ msg: error.message });
    }
}

export default checkAuth