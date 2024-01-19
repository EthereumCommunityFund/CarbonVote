import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../utils/supabaseClient';
import crypto from 'crypto';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'GET') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    const { id: pollId, identifier: voter_identifier } = req.query;

    if (!pollId) {
        res.status(400).send('Poll ID is required');
        return;
    }

    try {
        console.log(voter_identifier);

        //Fetch votes of the poll and see if the user is already voted
        if (voter_identifier) {

            const identifier = Array.isArray(voter_identifier) ? voter_identifier[0] : voter_identifier;
            const vote_hash = crypto.createHash('sha256').update(identifier).digest('hex');

            let { data: vote, error: voteError } = await supabase
                .from('votes')
                .select('option_id')
                .eq('vote_hash', vote_hash)
                .eq('poll_id', pollId)
                .single()
            console.log(vote);
            console.log(vote_hash);
            if (!vote) {
                vote = { option_id: null };
            }
            res.status(200).json(vote);
        } else {
            res.status(204).send('');
        }
    } catch (error: any) {
        // Handle errors
        res.status(500).json({ error: error.message || 'An unexpected error occurred' });
    }
};

export default handler;