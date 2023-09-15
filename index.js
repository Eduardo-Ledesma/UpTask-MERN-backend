import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import conectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import proyectRoutes from "./routes/proyectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

import { Server } from 'socket.io'

const app = express();
app.use(express.json());

dotenv.config();
// Configure CORS
const whitelist = ['https://uptask-lac.vercel.app/'];
const corsOptions = {
    origin: function(origin, callback) {
        if(whitelist.includes(origin)) {
            callback(null, true); // Can query the api
        } else {
            callback(new Error('Cors Error')); // Cannot access
        }
    }
}
app.use(cors(corsOptions))
conectDB();

// Routing
app.use('/api/users', userRoutes);
app.use('/api/proyects', proyectRoutes);
app.use('/api/tasks', taskRoutes);

const PORT = process.env.PORT || 4000

const server = app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
})

// Socket.io
const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL,
    }
});

io.on('connection', socket => {

    // Define socket io events
    socket.on('open project', project => {
        socket.join(project);
    })

    socket.on('new task', task => {
        const proyect = task.proyect;
        socket.to(proyect).emit('added task', task);
    })

    socket.on('delete task', task => {
        const proyect = task.proyect;
        socket.to(proyect).emit('deleted task', task);
    })

    socket.on('update task', task => {
        const proyect = task.proyect._id
        socket.to(proyect).emit('updated task', task);
    })

    socket.on('complete task', task => {
        const proyect = task.proyect._id
        socket.to(proyect).emit('completed task', task);
    })
})