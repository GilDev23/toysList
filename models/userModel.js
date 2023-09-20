const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    role: {
      type: String,
      default: "user",
    },
    //A characteristic that will be created by itself in each record we add
    //by the date the record was added by default
  },
  { timestamps: true }
);

exports.UserModel = mongoose.model("users", userSchema);

exports.createToken = (_id, role) => {
  // First parameter - coded content of token
  // second parameter - a secret word so that we can also decode the coding
  // This word must never be revealed
  // Third parameter - time range in which the validity expires
  // of the token and then it will be unusable
  const token = jwt.sign({ _id, role }, process.env.TOKEN_SECRET, {
    expiresIn: "600mins",
  });
  return token;
};

exports.validateUser = (_reqBody) => {
  const joiSchema = Joi.object({
    name: Joi.string().min(2).max(150).required(),
    email: Joi.string().min(2).max(150).email().required(),
    password: Joi.string().min(3).max(16).required(),
  });
  return joiSchema.validate(_reqBody);
};

// וולדזציה להתחברות
exports.validateLogin = (_reqBody) => {
  const joiSchema = Joi.object({
    email: Joi.string().min(2).max(150).email().required(),
    password: Joi.string().min(3).max(16).required(),
  });
  return joiSchema.validate(_reqBody);
};
