import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../utils/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const createVote = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    const { option_id, voter_identifier } = req.body;

    if (!option_id || !voter_identifier) {
        res.status(400).send('Option ID and Voter Identifier are required');
        return;
    }

    try {
        // Create a hash for the voter to maintain anonymity
        const vote_hash = crypto.createHash('sha256').update(voter_identifier).digest('hex');

        // Check if this voter has already voted for this option (to prevent double voting)
        const { data: existingVote } = await supabase
            .from('Votes')
            .select('*')
            .eq('vote_hash', vote_hash)
            .eq('option_id', option_id)
            .single();

        if (existingVote) {
            res.status(409).send('Voter has already voted for this option');
            return;
        }

        // Insert the vote
        const { error: insertError } = await supabase
            .from('Votes')
            .insert([{
                id: uuidv4(),
                option_id,
                vote_hash,
                cast_at: new Date()
            }]);

        if (insertError) throw insertError;

        res.status(201).send('Vote recorded successfully');
    } catch (error: any) {
        // Handle errors
        res.status(500).json({ error: error.message || 'An unexpected error occurred' });
    }
};

export default createVote;
