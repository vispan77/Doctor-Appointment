const mongoose = require("mongoose");

const dbConnect = async () => {
    try {
        const url = process.env.MONGODB_URL;
        await mongoose.connect(url);
        console.log('MongoDB is connected successfully')
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = dbConnect;