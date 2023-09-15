import express from "express";
import {
    newTask,
    getTask,
    updateTask,
    deleteTask,
    changeTaskState
} from "../controllers/taskController.js";
import checkAuth from "../middleware/checkAuth.js";

const router = express.Router();

router.post('/', checkAuth, newTask);
router.route('/:id').get(checkAuth, getTask).put(checkAuth, updateTask).delete(checkAuth, deleteTask);
router.post('/state/:id', checkAuth, changeTaskState);


export default router