import mongoose from 'mongoose';

const taskSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String,
        trim: true,
        required: true
    },
    state: {
        type: Boolean,
        default: false,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now()
    },
    priority: {
        type: String,
        required: true,
        enum: ['Low', 'Medium', 'High']
    },
    proyect: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Proyect'
    },
    completedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
},
{
    timestamps: true
})

const Task = mongoose.model('Task', taskSchema);

export default Task