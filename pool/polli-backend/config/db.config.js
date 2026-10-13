import mongoose from 'mongoose'

const connectDB = async () => {
    const mongoUri = process.env.MONGODB_URI ;

    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB')
    } catch (err) {
        console.log('MongoDB connection error', err)
        process.exit(1)
    }
}


export default connectDB;