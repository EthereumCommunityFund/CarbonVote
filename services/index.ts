import { getSupabaseClient } from '@/server/supabase';

export async function getPollData(pollId: string) {
  const supabase = getSupabaseClient();

  let { data: poll, error: pollError } = await supabase
    .from('polls')
    .select('*')
    .eq('id', pollId)
    .single();

  if (pollError) throw pollError;

  let { data: options, error: optionsError } = await supabase
    .from('options')
    .select('*')
    .eq('poll_id', pollId);

  if (optionsError) throw optionsError;

  let { data: credentials, error: credentialsError } = await supabase
    .from('pollcredentials')
    .select(
      `
      credential_id,
      credentials!inner (
        credential_name,
        credential_detail
      )
    `
    )
    .eq('poll_id', pollId);

  if (credentialsError) throw credentialsError;

  if (poll) {
    poll.options = options;
    poll.options.sort((a: any, b: any) => a.option_index - b.option_index);
    if (credentials) {
      poll.credentials = credentials.map((cred) => ({
        id: cred.credential_id,
        ...cred.credentials,
      }));
    }
  }

  return poll;
}
