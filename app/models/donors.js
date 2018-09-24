var mongoose = require('mongoose');

var donorSchema = mongoose.Schema({
    donor         : {
        name      : String,
        age       : Number,
        height    : Number,
        gender    : String,
        bloodType : String
    } 
})


module.exports = mongoose.model('Donor', donorSchema);