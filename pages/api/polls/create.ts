import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseClient';
import { getLatestBlockNumber } from '@/utils/getLatestBlockNumber';
import pollSchema from '@/schemas/pollSchema';
interface Option {
    option_description: string;
    option_index: number;
  }

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

    let { title, description, time_limit, options, credentials, poap_events, poap_number, gitcoin_score, contractpoll_index } = value

    try {
        const start_block_number = await getLatestBlockNumber();
        const averageBlockTimeS = 12;
        const estimatedBlocks = time_limit / averageBlockTimeS;
        const end_block_number = start_block_number + Math.round(estimatedBlocks);

        const { data, error: pollError } = await supabase
            .from('polls')
            .insert([{ title, description, time_limit, poap_events, start_block_number, end_block_number, poap_number, gitcoin_score, contractpoll_index }])
            .select("*");

        if (pollError) throw pollError;

        console.log('data', data)
        let pollData = data[0];

        const optionsWithPollId = options.map((option : Option) => ({
            option_description: option.option_description,
            option_index: option.option_index,
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