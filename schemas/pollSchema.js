import Joi from 'joi';

const pollSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().allow(null),
    time_limit: Joi.date().required(),
    voting_method: Joi.string().valid('headCount').required(),
});

export default pollSchema;
