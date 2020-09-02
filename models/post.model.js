const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let post = new Schema({
    subject: {
        type: String
    },
    body: {
        type: String
    },
    author: {
        type: String
    },
    user_id: {
        type: String
    }

});
module.exports = mongoose.model('Posts', post);