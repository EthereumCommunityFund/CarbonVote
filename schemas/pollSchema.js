import Joi from 'joi';

const optionSchema = Joi.object({
    option_description: Joi.string().required(),
});

const pollSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().allow(''),
    time_limit: Joi.number().required(),
    options: Joi.array().items(optionSchema).required(),
    credentials: Joi.array().items(Joi.string().guid({ version: 'uuidv4' })).required(),
    poap_events: Joi.array().allow(''),
    poap_number: Joi.string().allow(''),
    gitcoin_score: Joi.number().allow(''),
    contractpoll_index: Joi.array().allow(''),
});

export default pollSchema;