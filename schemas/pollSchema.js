import Joi from 'joi';

const optionSchema = Joi.object({
    option_description: Joi.string().required(),  
    votes: Joi.number().integer().min(0).default(0), 
    total_weight: Joi.number().min(0).default(0) 
});

const pollSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().allow(''),
    time_limit: Joi.date().iso().required(),
    voting_method: Joi.string().valid('headCount').required(),
    options: Joi.array().items(optionSchema).required(),
    credentials: Joi.array().items(Joi.string().guid({ version: 'uuidv4' })).required()
});

export default pollSchema;