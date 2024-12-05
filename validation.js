const Joi = require('joi');

const usersSchema = Joi.object({
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
    password: Joi.string().min(8).required() // Example: Minimum 8 characters
});

function validateUserdata(info){
    return usersSchema.validate(info);
}

const urlSchema = Joi.object({
    longurl: Joi.string().required()
});
function validateUrl(url){
    return urlSchema.validate(url);
}

module.exports = {
    validateUserdata,
    validateUrl
}