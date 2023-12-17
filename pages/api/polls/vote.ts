import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../utils/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const createVote = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    const { option_id, voter_identifier, poll_id } = req.body;

    if (!option_id || !voter_identifier || !poll_id) {
        res.status(400).send('Option ID, Poll ID, and Voter Identifier are required');
        return;
    }

    try {
        const vote_hash = crypto.createHash('sha256').update(voter_identifier).digest('hex');

        // Check if the user has already voted for the same option in the same poll
        const { data: existingVoteOnOption } = await supabase
            .from('votes')
            .select('*')
            .eq('vote_hash', vote_hash)
            .eq('poll_id', poll_id)
            .eq('option_id', option_id)
            .single();

        if (existingVoteOnOption) {
            res.status(409).send('You have already voted for this option in this poll.');
            return;
        }

        // Check if this voter has already voted in the poll
        const { data, error: existingVoteError } = await supabase
            .from('votes')
            .select('option_id')
            .eq('vote_hash', vote_hash)
            .eq('poll_id', poll_id)
            .select();

        console.log(existingVoteError)
        let existingVote;
        if (data) {
            existingVote = data[0]
        }



        if (existingVoteError) throw existingVoteError;

        if (existingVote) {
            // If they voted for a different option, update the previous option's vote count
            if (existingVote.option_id !== option_id) {
                const { error: decrementError } = await supabase
                    .rpc('decrement_vote', { option_id_param: existingVote.option_id });

                if (decrementError) {
                    console.log(decrementError)
                    throw decrementError;

                }

            }

            // Delete the previous vote
            const { error: deleteError } = await supabase
                .from('votes')
                .delete()
                .match({ vote_hash, poll_id });

            if (deleteError) throw deleteError;
        }

        // Insert the new vote
        const { error: insertError } = await supabase
            .from('votes')
            .insert([{
                id: uuidv4(),
                option_id,
                vote_hash,
                poll_id,
                cast_at: new Date()
            }]);

        if (insertError) throw insertError;

        // Increment the vote count for the new option
        const { error: incrementError } = await supabase
            .rpc('increment_vote', { option_id_param: option_id });

        if (incrementError) throw incrementError;

        res.status(201).send('Vote recorded successfully');
    } catch (error: any) {
        // Handle errors
        res.status(500).json({ error: error.message || 'An unexpected error occurred' });
    }
};

export default createVote;