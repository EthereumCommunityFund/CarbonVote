import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../utils/supabaseClient';

interface VoteData {
    option_id: string;
    vote_credential: string;
}

interface OptionVoteCounts {
    [optionId: string]: {
        [credential: string]: number;
    };
}
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'GET') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    const { id: pollId } = req.query;

    if (!pollId) {
        res.status(400).send('Poll ID is required');
        return;
    }

    try {
        const { data: votesData, error: votesError } = await supabase
            .from('votes')
            .select('option_id, vote_credential')
            .eq('poll_id', pollId);

        if (votesError) throw votesError;

        const optionVoteCounts: OptionVoteCounts = votesData.reduce((acc: OptionVoteCounts, { option_id, vote_credential }: VoteData) => {
            if (!acc[option_id]) {
                acc[option_id] = {};
            }
            acc[option_id][vote_credential] = (acc[option_id][vote_credential] || 0) + 1;

            return acc;
        }, {});

        res.status(200).json(optionVoteCounts);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export default handler;
