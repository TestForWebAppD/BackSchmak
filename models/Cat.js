const { Schema, model} = require('mongoose');

const Cat = new Schema({
    name: { type: String, required: true },
    breed: { type: String, default: "unknown"},
    sex: { type: String, default: "unknown" },
    age: { type: Number, default: "unknown" },
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    story: { type: String, default: "unknown" },
    img: { type: String, default: "/kitty.jpg"},
})

module.exports = model('Cat', Cat);
