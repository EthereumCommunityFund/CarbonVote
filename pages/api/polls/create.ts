import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../utils/supabaseClient';
import pollSchema from '../../../schemas/pollSchema';


const createPoll = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    const { value, error } = pollSchema.validate(req.body);
    if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
    }

    let { title, description, time_limit, voting_method, options, credentials } = value;

    // time_limit = Math.floor(time_limit / 1000);


    try {

        const { data, error: pollError } = await supabase
            .from('polls')
            .insert([{ title, description, time_limit, voting_method }])
            .select("*");


        if (pollError) throw pollError;


        console.log(data)
        let pollData = data[0];


        const optionsWithPollId = options.map((option: any) => ({
            ...option,
            poll_id: pollData.id
        }));

        const { error: optionsError } = await supabase
            .from('options')
            .insert(optionsWithPollId);

        if (optionsError) throw optionsError;


        const pollCredentials = credentials.map((credentialId: any) => ({
            poll_id: pollData.id,
            credential_id: credentialId
        }));

        const { error: credentialsError } = await supabase
            .from('pollcredentials')
            .insert(pollCredentials);

        if (credentialsError) throw credentialsError;


        res.status(201).json(pollData);
    } catch (error: any) {
        // Handle errors
        res.status(500).json({ error: error.message || 'An unexpected error occurred' });
    }
};

export default createPoll;

