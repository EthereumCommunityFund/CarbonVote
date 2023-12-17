import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../utils/supabaseClient';
import optionSchema from '../../../schemas/optionSchema';

const createOption = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    const { value, error } = optionSchema.validate(req.body);
    if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
    }


    const { data, error: insertError } = await supabase.from('options').insert([value]);
    if (insertError) {
        res.status(500).json({ error: insertError.message });
        return;
    }

    res.status(201).json(data);
};

export default createOption;
//export default withAuthorization(createOptions);