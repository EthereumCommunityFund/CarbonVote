import Joi from 'joi';

const optionSchema = Joi.object({
    poll_id: Joi.string().guid({ version: 'uuidv4' }).required(), //poll_id from poll just created
    option_description: Joi.string().required(), 
    votes: Joi.number().integer().min(0).default(0), 
    total_weight: Joi.number().default(0) 
});

export default optionSchema;
