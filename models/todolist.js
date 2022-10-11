const { Schema, model } = require("mongoose");

const todolistSchema = new Schema({
    workName: {
        type: String,
        required: [true, "Work name is must."],
        // unique: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});

exports.TodoList = new model("TodoList", todolistSchema);

const listNameSchema = new Schema({
    name: {
        type: String,
        required: [true, "There must be a name"],
        unique: true,
    },
    work: {
        type: [todolistSchema],
        required: true,
    },
});

exports.List = new model("List", listNameSchema);

// module.exports = TodoList;
