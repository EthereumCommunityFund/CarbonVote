import Joi from 'joi';

const optionSchema = Joi.object({
    option_description: Joi.string().required(),
});

const pollSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().allow(''),
    time_limit: Joi.number().required(),
    votingMethod: Joi.string().valid('headCount').required(),
    options: Joi.array().items(optionSchema).required(),
    credentials: Joi.array().items(Joi.string().guid({ version: 'uuidv4' })).required(),
    poap_events: Joi.array()
});

export default pollSchema;