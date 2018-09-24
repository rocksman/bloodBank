var mongoose = require('mongoose');

var bloodSchema = mongoose.Schema({
    blood     : {
        bloodType   : String,
        amount      : Number
    } 
})


module.exports = mongoose.model('Blood', bloodSchema);