import { NextApiRequest, NextApiResponse } from 'next';
import { verifyMessage } from 'ethers';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import getPoapOwnership from 'utils/getPoapOwnership';
import { supabase } from 'utils/supabaseClient';
import { CREDENTIALS } from '@/src/constants';
import { VerifySignatureInput, CheckPOAPOwnershipInput, ProcessVoteInput } from '@/types'
import { storeVote, checkNullifier, generateNullifier } from '@/utils/ceramicHelpers'

const poapApiKey = process.env.POAP_API_KEY ?? "";

async function validateRequest(req: NextApiRequest) {
    if (req.method !== 'POST') {
        throw new Error('Method Not Allowed');
    }

    const { option_id, voter_identifier, poll_id } = req.body;
    if (!option_id || !voter_identifier || !poll_id) {
        throw new Error('Option ID, Poll ID, and Voter Identifier are required');
    }
}

async function verifySignature({ pollId, option_id, voter_identifier, requiredCred, signature }: VerifySignatureInput): Promise<void> {
    if (requiredCred === CREDENTIALS.GitcoinPassport.id || requiredCred === CREDENTIALS.POAPapi.id || requiredCred === CREDENTIALS.ProtocolGuildMember.id) {
        const message = `{ poll_id: ${pollId}, option_id: ${option_id}, voter_identifier: ${voter_identifier}, requiredCred: ${requiredCred}`;
        const signerAddress = verifyMessage(message, signature);

        if (signerAddress !== voter_identifier) {
            throw new Error("Signature doesn't correspond with address.");
        }
    }
    // Additional verification logic for other credentials can be added here
}

async function checkPOAPOwnership({ pollData, voter_identifier }: CheckPOAPOwnershipInput): Promise<void> {
    const ownershipPromises = pollData.poap_events.map(eventId =>
        getPoapOwnership(poapApiKey, voter_identifier, eventId)
    );
    const responses = await Promise.all(ownershipPromises);

    for (const response of responses) {
        if (!response?.data?.owner) {
            throw new Error("You don't qualify to vote for this poll.");
        }
    }
}

async function processVote({ vote_hash, poll_id, option_id }: ProcessVoteInput): Promise<void> {
    const { data: existingVoteOnOption } = await supabase
        .from('votes')
        .select('*')
        .eq('vote_hash', vote_hash)
        .eq('poll_id', poll_id)
        .eq('option_id', option_id)
        .single();

    if (existingVoteOnOption) {
        throw new Error('You have already voted for this option in this poll.');
    }

    // Check if the voter has already voted in the poll and process accordingly
    const { data, error } = await supabase
        .from('votes')
        .select('option_id')
        .eq('vote_hash', vote_hash)
        .eq('poll_id', poll_id);

    if (error) throw error;

    let existingVote = data ? data[0] : null;
    if (existingVote) {
        const { error: deleteError } = await supabase
            .from('votes')
            .delete()
            .match({ vote_hash, poll_id });

        if (deleteError) throw deleteError;

        if (existingVote.option_id !== option_id) {
            const { error: decrementError } = await supabase
                .rpc('decrement_vote', { option_id_param: existingVote.option_id });

            if (decrementError) throw decrementError;
        }
    }

    // // Insert the new vote
    // const { error: insertError } = await supabase
    //     .from('votes')
    //     .insert([{
    //         id: uuidv4(),
    //         option_id,
    //         vote_hash,
    //         poll_id,
    //         cast_at: new Date()
    //     }]);

    // if (insertError) throw insertError;

    // Increment the vote count for the new option
    const { error: incrementError } = await supabase
        .rpc('increment_vote', { option_id_param: option_id });

    if (incrementError) throw incrementError;
}

const createVote = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        await validateRequest(req);
        const { pollId, option_id, voter_identifier, poll_id, requiredCred, signature } = req.body;

        await verifySignature({ pollId, option_id, voter_identifier, requiredCred, signature });

        const voteData = req.body;

        const { data: pollData } = await supabase
            .from('votes')
            .select('*')
            .eq('poll_id', poll_id)
            .single();

        if (pollData?.poap_events && pollData?.poap_events.length) {
            await checkPOAPOwnership({ pollData, voter_identifier });
        }

        console.log('voter_identifier', voter_identifier);

        // Generate a nullifier for the voterCredential
        const nullifier = generateNullifier(voter_identifier);

        // Check if the nullifier already exists (indicating vote reuse)
        // const isNullifierUsed = await checkNullifier(nullifier);
        // if (isNullifierUsed) {
        //     throw new Error('Credential has already been used.');
        // }

        // Store the vote with the nullifier as an identifier
        await storeVote(voteData, nullifier);

        const vote_hash = crypto.createHash('sha256').update(voter_identifier).digest('hex');
        await processVote({ vote_hash, poll_id, option_id });

        res.status(201).send('Vote recorded successfully');
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'An unexpected error occurred' });
    }
};

export default createVote;