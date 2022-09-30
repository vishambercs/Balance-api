const mongoose      = require('mongoose');
const validator     = require('validator');
const networkSchema = new mongoose.Schema
    ({
        id: {
            type: String,
            required: true,
            unique: true,
        },
        coin: {
            type: String,
            required: true,
        },
        libaraytype: {
            type: String,
           
            required: true,
         },

        cointype: {
            type: String,
           
            required: true,
         },
        contractaddress: {
            type: String,
            required: true,
        },
        nodeurl: {
            type: String,
            required: true,
        },
        icon: {
            type: String,
            required: false,
            default     : "",
        },
        timestamps: {
            type: String,
            required: false,
            default     : "",
        },
    },
        { timestamps: true }
    )
module.exports = mongoose.model('network', networkSchema)