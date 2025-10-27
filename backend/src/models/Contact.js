const mongoose = require("mongoose");

const ContactSchema = mongoose.Schema(
  {
    // MongoDB automatically creates an _id field for the primary key
    name: {
      type: String,
      required: [true, "Please add the contact name"],
    },
    email: {
      type: String,
      required: [true, "Please add the contact email address"],
      unique: true, // Ensures email addresses are unique
    },
    phone: {
      type: String,
      required: [true, "Please add the contact phone number"],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

// Export the model based on the schema
module.exports = mongoose.model("Contact", ContactSchema);
