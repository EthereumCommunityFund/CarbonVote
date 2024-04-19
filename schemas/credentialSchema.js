import Joi from 'joi';

const credentialSchema = Joi.object({
  poll_id: Joi.string().guid({ version: 'uuidv4' }).required(),
  credential_id: Joi.string().guid({ version: 'uuidv4' }).required(),
  credential_detail: Joi.string().default('credential detail'),
});

export default credentialSchema;
