const { Schema, model} = require('mongoose');

const Post = new Schema({
    title: { type: String, required: true },
    description: { type: String},
    cats: [{ type: Schema.Types.ObjectId, ref: 'Cat' }],
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    img: { type: String, default: null },
})

module.exports = model('Post', Post);
