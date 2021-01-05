const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
let isConnected;

const DB_URL = 'mongodb+srv://dbUser:dbUserPassword@cluster0.j19qw.mongodb.net/?retryWrites=true&w=majority'

const connectToDatabase = () => {
    if (isConnected) {
        console.log('Use existing databse connection.')
        return Promise.resolve();
    }

    console.log('Using new database connection.')
    return mongoose.connect(DB_URL, { useNewUrlParser: true }).then(db => {
        isConnected = db.connections[0].readyState;
    });
};

module.exports = connectToDatabase;