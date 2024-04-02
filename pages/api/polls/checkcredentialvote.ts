import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../utils/supabaseClient';
import { VoteData} from '@/types';
import { CREDENTIALS } from '@/src/constants';
interface VoteCountData {
  option_id: string;
  vote_credential: string;
}


const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const { id: pollId, isEthHolding } = req.query;
  if (!pollId || typeof pollId !== 'string') {
    res.status(400).send('Poll ID is required and must be a string');
    return;
  }

  try {
    if(isEthHolding === 'true'){
        const { data: votesData, error: votesError } = await supabase
        .from('votes')
        .select(`
          option_id,
          voter_identifier
        `)
        .eq('poll_id', pollId)
        .eq('vote_credential', CREDENTIALS.EthHoldingOffchain.id);
      
      if (votesError) throw votesError;
      
      if (votesData === null || votesData.length === 0) {
        return res.status(200).json("no votes data");
      }
      
      const optionIds = [...new Set(votesData.map(vote => vote.option_id))];
      
      const optionsDescriptions = await Promise.all(optionIds.map(async (id) => {
        const { data, error } = await supabase
          .from('options')
          .select('id, option_description')
          .eq('id', id)
          .single(); 
      
        if (error) throw error;
        return { id, description: data?.option_description || 'No description' };
      }));
      
      const descriptionLookup = optionsDescriptions.reduce<{ [key: string]: string }>((acc, { id, description }) => {
        acc[id] = description;
        return acc;
      }, {});
          
      const transformedData: VoteData[] = votesData.reduce((acc: VoteData[], { option_id, voter_identifier }) => {
        const description = descriptionLookup[option_id] || 'No description';
        let entry = acc.find(x => x.id === option_id);
        if (entry) {
          entry.votes += 1;
          entry.voters_account!.push(voter_identifier); 
        } else {
          acc.push({ 
            id: option_id, 
            votes: 1, 
            credential: CREDENTIALS.EthHoldingOffchain.id, 
            description,
            voters_account: [voter_identifier] 
          });
        }
        return acc;
      }, []);
      res.status(200).json(transformedData);
    }
    else{
    const { data: votesData, error: votesError } = await supabase
    .from('votes')
    .select(`
      option_id,
      vote_credential
    `)
    .eq('poll_id', pollId);
    
    if (votesError) throw votesError;

    if (votesData === null) {
        return res.status(200).json("no votes data" );
      }
    const optionIds = [...new Set(votesData.map(vote => vote.option_id))];

    const optionsDescriptions = await Promise.all(optionIds.map(async (id) => {
    const { data, error } = await supabase
        .from('options')
        .select('id, option_description')
        .eq('id', id)
        .single(); 

    if (error) throw error;
    return { id, description: data?.option_description || 'No description' };
    }));

    const descriptionLookup = optionsDescriptions.reduce<{ [key: string]: string }>((acc, { id, description }) => {
        acc[id] = description;
        return acc;
      }, {});
      
     const transformedData: VoteData[] = votesData.reduce((acc: VoteData[], { option_id, vote_credential }) => {
        const description = descriptionLookup[option_id] || 'No description';
        let entry = acc.find(x => x.id === option_id && x.credential === vote_credential);
        if (entry) {
          entry.votes += 1;
        } else {
          acc.push({ 
            id: option_id, 
            votes: 1, 
            credential: vote_credential, 
            description 
          });
        }
        return acc;
      }, []);

    res.status(200).json(transformedData);
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default handler;
