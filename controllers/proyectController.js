import Proyect from "../models/Proyect.js";
import User from "../models/User.js";
import mongoose from "mongoose";

const getProyects = async (req, res) => {
    // getting only the proyects of the user
    const proyects = await Proyect.find({
        '$or': [
            {'collaborators': { $in: req.user}},
            {'creator': { $in: req.user}},
        ]
    })
    .select('-tasks'); 
    res.json(proyects)
}

// get a specific proyect and its respective tasks
const getProyect = async (req, res) => {
    const { id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error('Invalid project ID');
        return res.status(400).json({ msg: error.message });
    }

    try {
        const proyect = await Proyect.findById(id)
        .populate({path: 'tasks', populate: {path: 'completedBy', select: 'name'}})
        .populate('collaborators', 'name email');
        const proyectOwner = await User.findById(proyect.creator);

        if(!proyect) {
            const error = new Error('Project not found');
            return res.status(404).json({ msg: error.message });
        } 

        // Validate that the proyect belong to the user
        if(proyect.creator.toString() !== req.user._id.toString() && 
        !proyect.collaborators.some(col => col._id.toString() === req.user._id.toString() ) ) { 
            const error = new Error('Cannot Access');
            return res.status(401).json({ msg: error.message });
        }
        
        res.json({proyect, ownerName: proyectOwner.name})
    } catch (error) {
        return res.status(500).json({ msg: 'Internal Server Error' });
    }
    
}

const newProyect = async (req, res) => {
    const proyect = new Proyect(req.body);
    proyect.creator = req.user._id;

    try {
        const savedProyect = await proyect.save();
        res.json(savedProyect);
    } catch (error) {
        return res.status(500).json({ msg: 'Internal Server Error' });
    }
}

const editProyect = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error('Invalid project ID');
        return res.status(400).json({ msg: error.message });
    }
    try {
        const proyect = await Proyect.findById(id);
        if(!proyect) {
            const error = new Error('Project not found');
            return res.status(404).json({ msg: error.message });
        } 
        if(proyect.creator.toString() !== req.user._id.toString()) { // Validate that the proyect belong to the user
            const error = new Error('Invalid Action');
            return res.status(401).json({ msg: error.message });
        }
        proyect.name = req.body.name || proyect.name;
        proyect.description = req.body.description || proyect.description;
        proyect.date = req.body.date || proyect.date;
        proyect.client = req.body.client || proyect.client;

        const savedProyect = await proyect.save();
        res.json(savedProyect);
    } catch (error) {
        return res.status(500).json({ msg: 'Internal Server Error' });
    }
}

const deleteProyect = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error('Invalid project ID');
        return res.status(400).json({ msg: error.message });
    }

    try {
        const proyect = await Proyect.findById(id);
        if(!proyect) {
            const error = new Error('Project not found');
            return res.status(404).json({ msg: error.message });
        } 
        if(proyect.creator.toString() !== req.user._id.toString()) { // Validate that the proyect belong to the user
            const error = new Error('Invalid Action');
            return res.status(401).json({ msg: error.message });
        }
        await proyect.deleteOne();
        res.json({ msg: 'Project Deleted'});
    } catch (error) {
        return res.status(500).json({ msg: 'Internal Server Error' });
    }
} 

const findCollaborator = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({email}).select('-password -token -updatedAt -createdAt -confirmed -__v');

    if(!user) {
        const error = new Error('User not found');
        return res.status(404).json({ msg: error.message });
    }
    res.json(user);
} 

const addCollaborator = async (req, res) => {
    const { email, id } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error('Invalid project ID');
        return res.status(400).json({ msg: error.message });
    }
    
    try {
        const proyect = await Proyect.findById(id);
        if(!proyect) {
            const error = new Error('Project not found');
            return res.status(404).json({ msg: error.message });
        } 
        if(proyect.creator.toString() !== req.user._id.toString()) { // Validate that the proyect belong to the user
            const error = new Error('Invalid Action');
            return res.status(401).json({ msg: error.message });
        }

        const user = await User.findOne({email}).select('-password -token -updatedAt -createdAt -confirmed -__v');
        if(!user) {
            const error = new Error('User not found');
            return res.status(404).json({ msg: error.message });
        }
        if(proyect.creator.toString() === user._id.toString()) { // Creator cannot add himself as collaborator
            const error = new Error("You can't add yourself as collaborator");
            return res.status(403).json({ msg: error.message });
        }
        if(proyect.collaborators.includes(user._id)) { // Validate if the user is already in collaborators
            const error = new Error("The user already belongs to the project");
            return res.status(403).json({ msg: error.message });
        }
        
        proyect.collaborators.push(user._id)
        await proyect.save()
        res.json(user)
    } catch (error) {
        return res.status(500).json({ msg: 'Internal Server Error' });
    }
} 

const deleteCollaborator = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error('Invalid project ID');
        return res.status(400).json({ msg: error.message });
    }
    
    try {
        const proyect = await Proyect.findById(id);
        if(!proyect) {
            const error = new Error('Project not found');
            return res.status(404).json({ msg: error.message });
        } 
        if(proyect.creator.toString() !== req.user._id.toString()) { // Validate that the proyect belong to the user
            const error = new Error('Invalid Action');
            return res.status(401).json({ msg: error.message });
        }

        const { email } = req.body;
        const user = await User.findOne({email}).select('-password -token -updatedAt -createdAt -confirmed -__v');
        
        proyect.collaborators.pull(req.body.id);
        
        await proyect.save()
        res.json({msg: 'Collaborator removed successfully!'})

    } catch (error) {
        return res.status(500).json({ msg: 'Internal Server Error' });
    }
} 


export {
    getProyects,
    getProyect,
    newProyect,
    editProyect,
    deleteProyect,
    findCollaborator,
    addCollaborator,
    deleteCollaborator
}