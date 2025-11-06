import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '@/server/supabase';

const viewAllPolls = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed');
    return;
  }
  const supabase = getSupabaseClient();

  try {
    let { data: polls, error: pollsError } = await supabase.from('polls')
      .select(`
        *,
        options (*),
        pollcredentials (
          credential_id,
          credentials (
            credential_name,
            credential_detail
          )
        )
      `);

    if (pollsError) throw pollsError;

    for (let poll of polls as any) {
      let durationInMilliseconds = poll.time_limit;
      let startTime = new Date(poll.created_at + 'Z').getTime();
      let endTime = startTime + durationInMilliseconds * 1000;
      poll.endTime = endTime;
      poll.startTime = startTime;

      const structuredCredentials = poll.pollcredentials
        ?.map((pc: any) => {
          if (pc.credentials) {
            return {
              id: pc.credential_id,
              credential_name: pc.credentials.credential_name,
              credential_detail: pc.credentials.credential_detail,
            };
          }
          return null;
        })
        .filter((cred: any) => cred !== null) as
        | {
            id: string;
            credential_name: string;
            credential_detail: string | null;
          }[]
        | undefined;

      poll.credentials = structuredCredentials;
    }
    res.status(200).json(polls);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || 'An unexpected error occurred' });
  }
};

export default viewAllPolls;
