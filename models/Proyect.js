import mongoose from 'mongoose';

const proyectSchema = mongoose.Schema({
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
    date: {
        type: Date,
        default: Date.now(),
        required: true
    },
    client: {
        type: String,
        trim: true,
        required: true,
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    tasks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task'
        }
    ],
    collaborators: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
},
{
    timestamps: true
})

const Proyect = mongoose.model('Proyect', proyectSchema);

export default Proyect