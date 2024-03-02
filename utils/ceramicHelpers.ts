
import { DID } from 'dids';
import { getResolver } from 'key-did-resolver';
import { Ed25519Provider } from 'key-did-provider-ed25519';
import { CeramicClient } from '@ceramicnetwork/http-client';
import { keccak256, toUtf8Bytes } from 'ethers';
import { IDX } from '@ceramicstudio/idx';
import { TileDocument } from '@ceramicnetwork/stream-tile';
import cleanObject from '@/utils/cleanObject';

const CERAMIC_SECRET = process.env.CERAMIC_SECRET ?? "";
const secretKeyBytes = Uint8Array.from(Buffer.from(CERAMIC_SECRET, 'hex'));


// Initialize Ceramic client
const ceramiNodeUrl = 'http://localhost:7007' // TODO: Add 'https://your-ceramic-node.com' for staging and production
const ceramic = new CeramicClient(ceramiNodeUrl);

// FIXME: we need to store and retrieve. Can we always use the same StreamId?
// This assumes you know the stream ID where nullifiers are stored
const streamId = 'carbon_vote_stream';
// const streamId = stream.id


// Utility function to generate a nullifier
export const generateNullifier = (credential: string) => {
    // Using Ethers.js to create a SHA-256 hash of the credential
    const hash = keccak256(toUtf8Bytes(credential));
    return `nullifier-${hash}`;
};

// Function to check if a nullifier already exists
export const checkNullifier = async (nullifier: any) => {
    const idx = new IDX({ ceramic });

    try {
        // Example: Checking if the nullifier exists in a specific stream
        const stream = await ceramic.loadStream(streamId);
        // Assuming the stream data is an object that contains nullifiers
        // You'll need to adjust this based on your actual data structure
        if (stream.content.nullifiers && stream.content.nullifiers.includes(nullifier)) {
            return true; // Nullifier exists
        }
    } catch (error) {
        console.error('Error querying Ceramic:', error);
        // Handle errors, e.g., stream not found
    }
};

/**
 * Stores vote data in a Ceramic stream, using a nullifier for uniqueness.
 * @param {Object} voteData - The data of the vote to store.
 * @param {String} nullifier - A unique identifier derived from the voter's credential to prevent double voting.
 */
export const storeVote = async (voteData: any, nullifier: string, ethCount: number | undefined) => {
    try {
        // Create a DID instance with the Ed25519Provider
        const did = new DID({
            provider: new Ed25519Provider(secretKeyBytes),
            resolver: getResolver(),
        });

        await did.authenticate();
        ceramic.did = did;

        // Define the content of the stream
        // const content = { hello: 'world' }
        const content = {
            ...voteData,
            nullifier,
            timestamp: new Date().toISOString(), // Optional: add a timestamp for when the vote was recorded
            weight: ethCount
        };

        const cleanContent = cleanObject(content);
        console.log("🚀 ~ storeVote ~ cleanContent:", cleanContent)


        // checkNullifier()

        // Create or update a TileDocument stream with the vote data
        const stream = await TileDocument.create(
            ceramic,
            cleanContent,
            {
                // schema: 'ceramic://yourSchemaIDHere',
                controllers: [did.id], // Use the authenticated DID as the controller
                tags: ['vote', 'carbon-vote', cleanContent?.poll_id, nullifier], // Use tags for easy querying later
            }
        );

        console.log(`StreamID: ${stream.id.toString()}`);

        console.log(`Vote stored with stream ID: ${stream.id.toString()}`);
        return stream.id.toString();
    } catch (error) {
        console.error('Failed to store vote:', JSON.stringify(error));
        throw new Error('Failed to store vote data in Ceramic.');
    }
};



