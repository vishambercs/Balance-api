const mongoose      = require('mongoose');
const validator     = require('validator');
const addressPool = new mongoose.Schema
    ({
        id: {
            type: String,
            required: true,
            unique: true,
        },
        network_id: {
            type: String,
            required: true,
        },
        address: 
        {
            type: String,
            required: true,
            unique: true,
        },
        created_at: 
        {
            type: String,
            required: true,
        },
       
       
      
      
    },
        { timestamps: true }
    )
module.exports = mongoose.model('addressPool', addressPool)