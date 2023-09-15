import Task from "../models/Task.js";
import Proyect from "../models/Proyect.js";
import mongoose from "mongoose";

const newTask = async (req, res) => {
    const { proyect } = req.body;

    const proyectExist = await Proyect.findById(proyect);
    if(!proyectExist) {
        const error = new Error('Project not found');
        return res.status(404).json({ msg: error.message });
    }
    if(proyectExist.creator.toString() !== req.user._id.toString()) {
        const error = new Error("You don't have permision to add a task");
        return res.status(403).json({ msg: error.message });
    }

    try {
        const savedTask = await Task.create(req.body);
        // Save task ID in the proyect
        proyectExist.tasks.push(savedTask._id)
        await proyectExist.save()
        
        res.json(savedTask);
    } catch (error) {
        return res.status(500).json({ msg: 'Internal Server Error' });
    }
}

const getTask = async (req, res) => {
    const { id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error('Invalid task ID');
        return res.status(400).json({ msg: error.message });
    }

    try {
        const task = await Task.findById(id).populate('proyect');

        if(!task) {
            const error = new Error('Task not found');
            return res.status(404).json({ msg: error.message });
        } 
        if(task.proyect.creator.toString() !== req.user._id.toString()) {
            const error = new Error("You don't have permision to access");
            return res.status(403).json({ msg: error.message });
        }
        res.json(task);
    } catch (error) {
        return res.status(500).json({ msg: 'Internal Server Error' });
    }
}

const updateTask = async (req, res) => {
    const { id } = req.params;
    
    if(!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error('Invalid task ID');
        return res.status(400).json({ msg: error.message });
    }

    try {
        const task = await Task.findById(id).populate('proyect');

        if(!task) {
            const error = new Error('Task not found');
            return res.status(404).json({ msg: error.message });
        } 
        if(task.proyect.creator.toString() !== req.user._id.toString()) {
            const error = new Error("You don't have permision to access");
            return res.status(403).json({ msg: error.message });
        }
        
        task.name = req.body.name || task.name;
        task.description = req.body.description || task.description;
        task.priority = req.body.priority || task.priority;
        task.date = req.body.date || task.date;
        const updatedTask = await task.save();
        res.json(updatedTask);
    } catch (error) {
        return res.status(500).json({ msg: 'Internal Server Error' });
    }
}

const deleteTask = async (req, res) => {
    const { id } = req.params;
    
    if(!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error('Invalid task ID');
        return res.status(400).json({ msg: error.message });
    }

    try {
        const task = await Task.findById(id).populate('proyect');

        if(!task) {
            const error = new Error('Task not found');
            return res.status(404).json({ msg: error.message });
        } 
        if(task.proyect.creator.toString() !== req.user._id.toString()) {
            const error = new Error("You don't have permision to access");
            return res.status(403).json({ msg: error.message });
        }

        const proyect = await Proyect.findById(task.proyect);
        proyect.tasks.pull(task._id)
        await Promise.allSettled([await proyect.save(), await task.deleteOne()]);
        res.json({ msg: 'Task Deleted'});
    } catch (error) {
        return res.status(500).json({ msg: 'Internal Server Error' });
    }
}

const changeTaskState = async (req, res) => {
    const { id } = req.params;
    const task = await Task.findById(id).populate('proyect');

    try {
        if(!task) {
            const error = new Error('Task not found');
            return res.status(404).json({ msg: error.message });
        }  
        if(task.proyect.creator.toString() !== req.user._id.toString() &&
        !task.proyect.collaborators.some(col => col._id.toString() === req.user._id.toString())) {
            const error = new Error("You don't have permision to access");
            return res.status(403).json({ msg: error.message });
        }
        task.state = !task.state;
        task.completedBy = req.user._id;
        await task.save();

        const savedTask = await Task.findById(id).populate('proyect').populate({path: 'completedBy', select: 'name'});
        
        res.json(savedTask);
    } catch (error) {
        return res.status(500).json({ msg: 'Internal Server Error' });
    }
}

export {
    newTask,
    getTask,
    updateTask,
    deleteTask,
    changeTaskState
}