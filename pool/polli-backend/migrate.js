import connectDB from "./config/db.config.js";
import User from "./models/user.model.js"

const run = async () => {
    try {
        await connectDB();
        await User.init();
        console.log("initialized user model indexes");
        process.exit(0);
    } catch (err) {
        console.log("Error on initializing indexes", err);
        process.exit(1);
    }
}

run()
