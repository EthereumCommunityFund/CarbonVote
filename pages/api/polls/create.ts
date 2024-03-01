import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseClient';
import { getLatestBlockNumber } from '@/utils/getLatestBlockNumber';
import pollSchema from '@/schemas/pollSchema';

const createPoll = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    const { value, error } = pollSchema.validate(req.body);
    if (error) {
        console.log('error validating');
        res.status(400).json({ error: error.details[0].message });
        return;
    }

<<<<<<< HEAD
    let { title, description, time_limit, votingMethod, options, credentials, poap_events, poap_number, gitcoin_score, contractpoll_index } = value
=======
    let { title, description, time_limit, options, credentials, poap_events, poap_number, gitcoin_score, contractpoll_index } = value
>>>>>>> 6e42a8b1c3191d06781e533ba97785c5be3f545b

    try {
        const block_number = await getLatestBlockNumber();
        const { data, error: pollError } = await supabase
            .from('polls')
<<<<<<< HEAD
            .insert([{ title, description, time_limit, votingMethod, poap_events, block_number, poap_number, gitcoin_score, contractpoll_index }])
=======
            .insert([{ title, description, time_limit, poap_events, block_number, poap_number, gitcoin_score, contractpoll_index }])
>>>>>>> 6e42a8b1c3191d06781e533ba97785c5be3f545b
            .select("*");

        if (pollError) throw pollError;

        console.log('data', data)
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