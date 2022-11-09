const mongoose = require("mongoose");

const todeSchema = new mongoose.Schema({
    todos : {
        type : String,
        required : true
    }
})

const todomodel = new mongoose.model("todomodel", todeSchema);

module.exports = todomodel;