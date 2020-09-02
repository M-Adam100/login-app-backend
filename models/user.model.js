const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let user = new Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    

});
module.exports = mongoose.model('Users', user);