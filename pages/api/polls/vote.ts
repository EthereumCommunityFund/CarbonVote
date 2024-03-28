import { NextApiRequest, NextApiResponse } from 'next';
import { verifyMessage } from 'ethers';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { supabase } from 'utils/supabaseClient';
import { CREDENTIALS } from '@/src/constants';
import { VerifySignatureInput, CheckPOAPOwnershipInput, ProcessVoteInput } from '@/types'
//import { storeVote, checkNullifier, generateNullifier } from '@/utils/ceramicHelpers'
import { getBalanceAtBlock } from '@/utils/getBalanceAtBlock'
import { generateMessage } from '@/utils/generateMessage'
import { ProtocolGuildMembershipList } from '@/src/protocolguildmember';
import { SoloStakerList } from '@/src/solostaker';
const poapApiKey = process.env.POAP_API_KEY ?? "";
import { getPoapOwnership } from '@/controllers/poap.controller';

async function validateRequest(req: NextApiRequest) {
    if (req.method !== 'POST') {
        throw new Error('Method Not Allowed');
    }

    const { option_id, voter_identifier, poll_id, vote_credential } = req.body;
    if (!option_id || !voter_identifier || !poll_id || !vote_credential) {
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
        getPoapOwnership(voter_identifier, eventId)
    );
    const responses = await Promise.all(ownershipPromises);

    for (const response of responses) {
        if (!response?.data?.owner) {
            throw new Error("You don't qualify to vote for this poll.");
        }
    }
}

async function processVote({ vote_hash, poll_id, option_id, weight, vote_credential, voter_identifier }: ProcessVoteInput): Promise<void> {
    const { data: existingVoteOnOption } = await supabase
        .from('votes')
        .select('*')
        .eq('vote_hash', vote_hash)
        .eq('poll_id', poll_id)
        .eq('option_id', option_id)
        .eq('vote_credential', vote_credential)
        .single();

    if (existingVoteOnOption) {
        throw new Error('You have already voted for this option in this poll.');
    }

    // Check if the voter has already voted in the poll and process accordingly
    const { data: votesData, error } = await supabase
        .from('votes')
        .select('option_id')
        .eq('vote_hash', vote_hash)
        .eq('vote_credential', vote_credential)
        .eq('poll_id', poll_id)

    if (error) throw error;

    let existingVote = votesData ? votesData[0] : null;
    if (existingVote) {
        const { error: deleteError } = await supabase
            .from('votes')
            .delete()
            .match({ vote_hash, poll_id, vote_credential });
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
            weight,
            vote_credential,
            voter_identifier
        }]);
    // if (insertError) throw insertError;
    // Increment the vote count for the new option
    const { error: incrementError } = await supabase
        .rpc('increment_vote', { option_id_param: option_id });
    if (incrementError) throw incrementError;
}

const isSignatureCredential = (credential: string) => {
    const signatureCredentials = [
        CREDENTIALS.GitcoinPassport.id,
        CREDENTIALS.POAPapi.id,
        CREDENTIALS.ProtocolGuildMember.id,
        CREDENTIALS.EthHoldingOffchain.id,
        CREDENTIALS.EthSoloStaker.id,
    ];

    return signatureCredentials.includes(credential);
}

const containsCredentialById = (requiredCredentials: any[] | null, credId: string) => {
    if (requiredCredentials === null) return;
    return requiredCredentials.some(credential =>
        credential.credential_id.includes(credId)
    );
}

const createVote = async (req: NextApiRequest, res: NextApiResponse) => {
    let weight;
    let signerAddress;
    try {
        await validateRequest(req);
        const { poll_id, option_id, voter_identifier, signature, vote_credential, gitscore } = req.body;
        console.log(poll_id, option_id, voter_identifier, signature, vote_credential, 'all info');

        const { data: pollData } = await supabase
            .from('polls')
            .select('*')
            .eq('id', poll_id)
            .single();


        const containsSingature = isSignatureCredential(vote_credential)
        if (containsSingature) {
            signerAddress = await verifySignature({ poll_id, option_id, voter_identifier, signature });

            if (signerAddress === undefined) {
                res.status(401).json({ error: 'Signer not verified' });
            }

            // POAP verification
            if (vote_credential === CREDENTIALS.POAPapi.id) {
                if (pollData?.poap_events && pollData?.poap_events.length) {
                    await checkPOAPOwnership({ pollData, voter_identifier });
                }
            }

            // EthHolding count
            if (vote_credential === CREDENTIALS.EthHoldingOffchain.id) {
                const blockNumber = pollData.block_number;
                if (signerAddress !== undefined) {
                    weight = await getBalanceAtBlock(signerAddress, blockNumber);
                }
            }

            // Protocol Guild
            if (vote_credential === CREDENTIALS.ProtocolGuildMember.id) {
                if (!ProtocolGuildMembershipList.includes(voter_identifier)) {
                    res.status(403).json({ error: "You don't qualify to vote for this poll." });
                }
            }

            // Eth solo staker
            if (vote_credential === CREDENTIALS.EthSoloStaker.id) {
                if (!SoloStakerList.includes(voter_identifier)) {
                    res.status(403).json({ error: "You don't qualify to vote for this poll." });
                }
            }

            if (vote_credential === CREDENTIALS.GitcoinPassport.id) {
                if (gitscore < pollData.gitcoin_score)
                    res.status(403).json({ error: "You don't have enough score to vote for this poll." });
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
        await processVote({ vote_hash, poll_id, option_id, weight, vote_credential, voter_identifier });

        res.status(201).send('Vote recorded successfully');
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'An unexpected error occurred' });
    }

};

export default createVote;