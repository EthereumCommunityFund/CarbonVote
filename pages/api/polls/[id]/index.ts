import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../../utils/supabaseClient';

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
        // Fetch the poll by ID
        let { data: poll, error: pollError } = await supabase
            .from('polls')
            .select('*')
            .eq('id', pollId)
            .single();

        if (pollError) throw pollError;

        // Fetch options for the poll
        let { data: options, error: optionsError } = await supabase
            .from('options')
            .select('*')
            .eq('id', pollId);

        if (optionsError) throw optionsError;

        // Fetch credential details for the poll
        let { data: credentials, error: credentialsError } = await supabase
            .from('pollcredentials')
            .select(`
                credential_id,
                credentials!inner (
                    credential_name,
                    credential_type,
                    credential_detail
                )
            `)
            .eq('poll_id', pollId);

        if (credentialsError) throw credentialsError;

        // Merge options and credential details into the poll object
        if (poll) {
            poll.options = options;
            if (credentials) {
                poll.credentials = credentials.map(cred => ({
                    id: cred.credential_id,
                    ...cred.credentials
                }));
            }

        }

        // Send response with the poll and its associated data
        res.status(200).json(poll);
    } catch (error: any) {
        // Handle errors
        res.status(500).json({ error: error.message || 'An unexpected error occurred' });
    }
};

export default handler;
