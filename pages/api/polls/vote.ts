import { NextApiRequest, NextApiResponse } from 'next';
import { verifyMessage } from 'ethers';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import getPoapOwnership from 'utils/getPoapOwnership';
import { supabase } from 'utils/supabaseClient';
import { CREDENTIALS } from '@/src/constants';
import { VerifySignatureInput, CheckPOAPOwnershipInput, ProcessVoteInput } from '@/types'
import { storeVote, checkNullifier, generateNullifier } from '@/utils/ceramicHelpers'
import { getBalanceAtBlock } from '@/utils/getBalanceAtBlock'
import { generateMessage } from '@/utils/generateMessage'

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

async function verifySignature({ poll_id, option_id, voter_identifier, signature }: VerifySignatureInput): Promise<string | undefined> {
    let signerAddress;
    const message = generateMessage(poll_id, option_id, voter_identifier);
    console.log("🚀 ~ verifySignature ~ signature:", signature)
    console.log("🚀 ~ verifySignature ~ message:", message)
    signerAddress = verifyMessage(message, signature);
    console.log("🚀 ~ verifySignature ~ signerAddress:", signerAddress)

    if (signerAddress !== voter_identifier) {
        throw new Error("Signature doesn't correspond with address.");
    }
    // Additional verification logic for other credentials can be added here
    return signerAddress;
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

async function processVote({ vote_hash, poll_id, option_id, weight }: ProcessVoteInput): Promise<void> {
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
    const { data: votesData, error } = await supabase
        .from('votes')
        .select('option_id')
        .eq('vote_hash', vote_hash)
        .eq('poll_id', poll_id);

    if (error) throw error;

    let existingVote = votesData ? votesData[0] : null;
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
    const { error: insertError } = await supabase
        .from('votes')
        .insert([{
            id: uuidv4(),
            option_id,
            vote_hash,
            poll_id,
            cast_at: new Date(),
            weight
        }]);

    if (insertError) throw insertError;

    // Increment the vote count for the new option
    const { error: incrementError } = await supabase
        .rpc('increment_vote', { option_id_param: option_id });

    if (incrementError) throw incrementError;
}

const containsSignatureCredential = (requiredCredentials: any[] | null) => {
    if (requiredCredentials === null) return;
    const signatureCredentials = [CREDENTIALS.GitcoinPassport.id, CREDENTIALS.POAPapi.id, CREDENTIALS.ProtocolGuildMember.id, CREDENTIALS.EthHoldingOffchain.id]

    return requiredCredentials.some(credential =>
        signatureCredentials.every(searchString => credential.id.includes(searchString))
    );
}

const containsCredentialById = (requiredCredentials: any[] | null, credId: string) => {
    if (requiredCredentials === null) return;
    return requiredCredentials.some(credential =>
        credential.id.includes(credId)
    );
}

const createVote = async (req: NextApiRequest, res: NextApiResponse) => {
    let weight;
    let signerAddress;
    try {
        await validateRequest(req);
        const { poll_id, option_id, voter_identifier, signature } = req.body;

        const { data: pollData } = await supabase
            .from('polls')
            .select('*')
            .eq('id', poll_id)
            .single();

        // Get required credentials so user can't inject them from the frontend
        const { data: requiredCredentials } = await supabase
            .from('pollcredentials')
            .select('*')
            .eq('poll_id', poll_id)

        const containsSingature = containsSignatureCredential(requiredCredentials)
        if (containsSingature) {
            signerAddress = await verifySignature({ poll_id, option_id, voter_identifier, signature });

            if (signerAddress === undefined) {
                res.status(401).json({ error: 'Signer not verified' });
            }
        }

        if (pollData?.poap_events && pollData?.poap_events.length) {
            await checkPOAPOwnership({ pollData, voter_identifier });
        }

        // EthHolding count
        const isEthHoldingPoll = containsCredentialById(requiredCredentials, CREDENTIALS.EthHoldingOffchain.id)
        console.log("🚀 ~ createVote ~ isEthHoldingPoll:", isEthHoldingPoll)
        if (isEthHoldingPoll) {
            const blockNumber = pollData.block_number;
            if (signerAddress) {
                weight = await getBalanceAtBlock(signerAddress, blockNumber);
                console.log("🚀 ~ createVote ~ ethCount:", weight)
            }
        }

        console.log('voter_identifier', voter_identifier);

        // // Generate a nullifier for the voterCredential
        // // TODO: Make one nullifier per credentialId and credentials used (i.e: POAP used)
        // const nullifier = generateNullifier(voter_identifier);

        // TODO: Uncomment when ceramic is ready
        // Check if the nullifier already exists (indicating vote reuse)
        // const isNullifierUsed = await checkNullifier(nullifier);
        // if (isNullifierUsed) {
        //     throw new Error('Credential has already been used.');
        // }

        // // Store the vote with the nullifier as an identifier
        // await storeVote(voteData, nullifier, weight);

        console.log("🚀 ~ createVote ~ weight:", weight)
        const vote_hash = crypto.createHash('sha256').update(voter_identifier).digest('hex');
        await processVote({ vote_hash, poll_id, option_id, weight });

        res.status(201).send('Vote recorded successfully');
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'An unexpected error occurred' });
    }

};

export default createVote;