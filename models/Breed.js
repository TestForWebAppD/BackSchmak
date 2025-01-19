const mongoose = require("mongoose");

const BreedSchema = new mongoose.Schema(
    {
        name: { type: String, unique: true, required: true },
        description: { type: String, required: false },
        character: { type: String, required: false },
        appearance: { type: String, required: false },
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Breed", BreedSchema);

