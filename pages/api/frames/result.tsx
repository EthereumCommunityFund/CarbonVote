import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { getSupabaseClient } from '@/server/supabase';
import { getBalanceAtBlock } from '@/utils/getBalanceAtBlock';
import { ProtocolGuildMembershipList } from '@/src/protocolguildmember';
import { SoloStakerList } from '@/src/solostaker';
import getPoapOwnership from '@/utils/getPoapOwnership';
import { base64Icon, CREDENTIALS } from '@/src/constants';
import { getFrameMessage, validateFrameMessage } from 'frames.js';
import { createFrames, Button } from 'frames.js/next/pages-router/server';
import { farcasterHubContext } from 'frames.js/middleware';
import { calculateTimeRemaining } from '@/utils';
import { getLatestBlockNumber } from '@/utils/getLatestBlockNumber';
import { FramePollData } from '@/types';
import { getFarcasterAddresses } from '@/utils/neynarApi';
import axios from 'axios';
import { getHost } from '@/utils/url';
interface EligibleAddress {
  address: string;
  weight: string;
}

interface OptionData {
  id: string;
  option_description: string;
  votes: number;
  ethBalance?: number;
  percentage?: number;
  displayText?: string;
}

async function validateRequest(req: any) {
  const method = req.request?.method || req.method;
  if (method !== 'POST') {
    throw new Error('Method Not Allowed');
  }
  const { Id, option_id, credential } = req.searchParams;
  const fid = req.message.requesterFid;
  const addresses = await getFarcasterAddresses(fid);
  if (!Id || !option_id || !fid || !credential) {
    throw new Error(
      `Missing required fields: ${JSON.stringify({
        Id: !!Id,
        option_id: !!option_id,
        fid: !!fid,
        credential: !!credential,
      })}`
    );
  }

  return {
    Id: Id as string,
    option_id: option_id as string,
    fid,
    credential: credential as string,
    addresses,
  };
}

async function checkVotingEligibility(
  pollData: any,
  addresses: string[],
  credential: string
) {
  if (new Date() > new Date(pollData.end_time)) {
    throw new Error('Voting has ended');
  }

  const eligibleAddresses: { address: string; weight: string }[] = [];

  for (const address of addresses) {
    try {
      switch (credential) {
        case CREDENTIALS.POAPapi.id:
          if (pollData?.poap_events?.length && pollData.poap_number) {
            const ownershipPromises = pollData.poap_events.map(
              (eventId: string) =>
                getPoapOwnership(
                  process.env.POAP_API_KEY as string,
                  address,
                  eventId
                )
            );
            const responses = await Promise.all(ownershipPromises);

            const ownedPoapCount = responses.filter((response) => {
              if (!response.error && response.owner) {
                const ownerAddress = response.owner.toLowerCase();
                const currentAddress = address.toLowerCase();
                const hasPoap = ownerAddress === currentAddress;

                return hasPoap;
              }
              return false;
            }).length;

            if (ownedPoapCount >= Number(pollData.poap_number)) {
              eligibleAddresses.push({ address, weight: '1' });
            }
          }
          break;

        case CREDENTIALS.EthHoldingOffchain.id:
          /*const balance = await getBalanceAtBlock(
            address,
            pollData.block_number
          );
          if (balance && balance !== '0') {
            eligibleAddresses.push({ address, weight: balance });
          }*/
          eligibleAddresses.push({ address, weight: '1' });
          break;

        case CREDENTIALS.EthSoloStaker.id:
          if (SoloStakerList.includes(address.toLowerCase())) {
            eligibleAddresses.push({ address, weight: '1' });
          }
          break;

        case CREDENTIALS.GitcoinPassport.id:
          const response = await fetch(`${getHost()}/api/gitcoin_passport`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              address: address,
              scorerId: '6347',
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.score >= pollData.gitcoin_score) {
              eligibleAddresses.push({ address, weight: '1' });
            }
          }
          break;
      }
    } catch (error) {
      console.error(
        `Error checking eligibility for address ${address}:`,
        error
      );
    }
  }

  return eligibleAddresses;
}

/*async function processVote(voteData: any) {
  const { poll_id, option_id, fid, eligibleAddresses, credential } = voteData;

  const voteHashes = eligibleAddresses.map(({ address }: EligibleAddress) =>
    crypto.createHash('sha256').update(address).digest('hex')
  );

  const { data: existingVotesOnOption } = await supabase
    .from('votes')
    .select('*')
    .in('vote_hash', voteHashes)
    .eq('poll_id', poll_id)
    .eq('option_id', option_id)
    .eq('vote_credential', credential)
    .single();

  if (existingVotesOnOption) {
    return;
  }

  const { data: existingVotes } = await supabase
    .from('votes')
    .select('option_id')
    .in('vote_hash', voteHashes)
    .eq('poll_id', poll_id)
    .eq('vote_credential', credential);

  if (existingVotes && existingVotes.length > 0) {
    await supabase
      .from('votes')
      .delete()
      .in('vote_hash', voteHashes)
      .eq('poll_id', poll_id)
      .eq('vote_credential', credential);

    await supabase.rpc('update_vote_count', {
      option_id_param: existingVotes[0].option_id,
      vote_count: -existingVotes.length,
    });
  }

  const voteRecords = eligibleAddresses.map(
    ({ address, weight }: EligibleAddress) => ({
      id: uuidv4(),
      poll_id,
      option_id,
      vote_hash: crypto.createHash('sha256').update(address).digest('hex'),
      weight,
      voter_identifier: address,
      vote_credential: credential,
      cast_at: new Date(),
      farcaster_fid: fid,
    })
  );

  await supabase.from('votes').insert(voteRecords);

  await supabase.rpc('update_vote_count', {
    option_id_param: option_id,
    vote_count: eligibleAddresses.length,
  });
}*/

const frames = createFrames({
  baseUrl: getHost(),
  basePath: '/api/frames/result',
  middleware: [farcasterHubContext()],
});

const handleRequest = frames(async (ctx) => {
  try {
    let eligibleAddresses: EligibleAddress[] = [];
    const url = new URL(ctx.request.url);
    const Id = url.searchParams.get('Id');
    const option_id = url.searchParams.get('option_id');
    const credential = url.searchParams.get('credential');
    const isFromVote = Id && option_id && credential;
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .rpc('get_frame_poll_data', { poll_id_param: Id })
      .single();
    const poll = data as FramePollData;
    const durationInMilliseconds = poll.time_limit;
    const startTime = new Date(poll.created_at + 'Z').getTime();
    const endTime = startTime + durationInMilliseconds * 1000;

    const timeRemaining = calculateTimeRemaining(endTime);
    const isEnded = timeRemaining === 'Time is up!';
    if (isFromVote) {
      const validatedData = await validateRequest(ctx);
      const allAddresses = validatedData.addresses;

      eligibleAddresses = await checkVotingEligibility(
        poll,
        allAddresses,
        validatedData.credential
      );
      if (eligibleAddresses.length > 0) {
        try {
          const { data, error } = await supabase.rpc('process_vote_batch', {
            p_poll_id: Id,
            p_option_id: option_id,
            p_fid: validatedData.fid,
            p_addresses: eligibleAddresses,
            p_credential: credential,
          });
        } catch (error) {
          console.error('Error processing vote batch:', error);
        }
      }
    }

    const { data: pollResults } = await supabase
      .from('options')
      .select('id, option_description, votes')
      .eq('poll_id', Id)
      .order('option_index', { ascending: true });

    const isEthVoting =
      poll.credentials[0].id === CREDENTIALS.EthHoldingOffchain.id;
    let displayData: OptionData[] = pollResults || [];
    const getCredentialDisplay = async (credentialId: string) => {
      switch (credentialId) {
        case CREDENTIALS.EthHoldingOffchain.id:
          return 'The real-time quantity of ETH held in the address that participates in the voting are counted as votes.';
        case CREDENTIALS.GitcoinPassport.id:
          return `Voters are users of Gitcoin Passport indicating participation or contribution within the Gitcoin ecosystem. User needs to have a miminum ${poll.gitcoin_score} to participate.`;
        case CREDENTIALS.EthSoloStaker.id:
          return 'Ether Solo Staker voters are individuals who stake their Ethereum (ETH) independently, without relying on a staking pool or service.';
        case CREDENTIALS.POAPapi.id:
          try {
            const MAX_DISPLAY_EVENTS = 5;
            const totalEvents = poll.poap_events.length;

            const eventPromises = poll.poap_events
              .slice(0, MAX_DISPLAY_EVENTS)
              .map(async (eventId) => {
                const eventDetails = {
                  method: 'GET',
                  url: `https://api.poap.tech/events/id/${eventId}`,
                  headers: {
                    accept: 'application/json',
                    'x-api-key': process.env.POAP_API_KEY,
                  },
                };

                const eventdetails = await axios.request(eventDetails);
                return eventdetails.data.name;
              });

            const eventNames = await Promise.all(eventPromises);

            let displayText = `Must have at least ${poll.poap_number} POAPs from: `;
            if (totalEvents <= MAX_DISPLAY_EVENTS) {
              displayText += eventNames.join(', ');
            } else {
              displayText += `${eventNames.join(', ')} and ${totalEvents - MAX_DISPLAY_EVENTS} more events`;
            }

            return displayText;
          } catch (error) {
            console.error('Error fetching POAP event details:', error);
            return `Must have at least ${poll.poap_number} POAPs from ${poll.poap_events.length} specific events`;
          }
        default:
          return credentialId;
      }
    };
    const credentialDisplay = await getCredentialDisplay(
      poll.credentials[0].id
    );
    if (isEthVoting && pollResults) {
      const latestBlock = await getLatestBlockNumber();
      const optionsWithVotes = await Promise.all(
        pollResults.map(async (option) => {
          const { data: votes } = await supabase
            .from('votes')
            .select('voter_identifier')
            .eq('option_id', option.id)
            .eq('poll_id', Id);

          const balances = await Promise.all(
            (votes || []).map((vote) =>
              getBalanceAtBlock(vote.voter_identifier, latestBlock as number)
            )
          );

          const totalBalance = balances.reduce(
            (sum, balance) => sum + Number(balance),
            0
          );

          return {
            ...option,
            ethBalance: totalBalance,
          };
        })
      );

      displayData = optionsWithVotes;
    }

    const totalVotes = (pollResults || []).reduce(
      (sum, option) => sum + (option.votes || 0),
      0
    );
    displayData = displayData.map((option) => {
      const voteCount = option.votes || 0;
      const percentage =
        totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
      const description =
        option.option_description.length > 30
          ? `${option.option_description.substring(0, 30)}...`
          : option.option_description;
      const stats = `(${voteCount} votes${
        isEthVoting ? `, ${option.ethBalance || 0} ETH` : `, ${percentage}%`
      })`;

      return {
        ...option,
        percentage,
        displayText: description + '                    ' + stats,
      };
    });
    return {
      image: (
        <div tw="bg-white w-full h-full flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={base64Icon}
            tw="absolute left-[40px] top-[40px] w-[186px] h-[40px]"
            alt="logo"
          />
          <div tw="absolute top-[90px] w-[90%] bg-[rgba(0,0,0,0.05)] rounded-xl p-6 mb-10 flex flex-col">
            <div tw="flex items-center mb-3">
              <div
                tw={`h-[24px] ${isEnded ? 'bg-gray-500' : 'bg-red-500'} text-white text-sm px-2 rounded-md flex items-center`}
                style={{ fontSize: '15px', width: isEnded ? '70px' : '50px' }}
              >
                {isEnded ? 'Closed' : 'Live'}
              </div>
              {!isEnded && (
                <div tw="flex items-center ml-2 text-gray-600">
                  <span
                    tw="flex items-center ml-2 text-gray-600"
                    style={{ fontSize: '20px' }}
                  >
                    🕐
                  </span>
                  <span tw="ml-1" style={{ fontSize: '16px' }}>
                    {timeRemaining}
                  </span>
                </div>
              )}
            </div>
            <div
              tw="text-[30px] font-bold mb-4 leading-tight whitespace-pre-wrap break-words"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: '3',
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {`Motion: ${poll.title}`}
            </div>
            <div
              tw={`flex flex-col ${
                displayData.length === 2
                  ? 'gap-3'
                  : displayData.length === 3
                    ? 'gap-1.5'
                    : 'gap-0'
              } mb-4`}
            >
              {displayData.map((option: OptionData, index) => (
                <div
                  key={option.id}
                  tw={`flex bg-white rounded-lg items-center justify-between ${
                    displayData.length === 2
                      ? 'p-4'
                      : displayData.length === 3
                        ? 'p-2.5'
                        : 'p-1'
                  }`}
                >
                  <div tw="flex items-center">
                    <span tw="mr-2 text-gray-500">{index + 1}.</span>
                    <span>
                      {option.option_description.length > 30
                        ? `${option.option_description.substring(0, 30)}...`
                        : option.option_description}
                    </span>
                  </div>
                  <span tw="font-bold text-right">
                    {isEthVoting
                      ? `${option.votes} votes · ${option.ethBalance?.toFixed(4) || '0'} ETH`
                      : `${option.votes} votes (${option.percentage}%)`}
                  </span>
                </div>
              ))}
            </div>

            <div tw="mt-auto bg-[rgba(0,0,0,0.05)] p-4 rounded-lg text-sm flex flex-col">
              <div tw="flex items-center">
                <span
                  tw={`${displayData.length === 4 ? 'text-[18px]' : 'text-[24px]'} font-medium`}
                >
                  {isFromVote && eligibleAddresses?.length === 0
                    ? "You don't have the required credential to vote"
                    : credentialDisplay}
                </span>
              </div>
            </div>
          </div>
        </div>
      ),
      imageOptions: {
        dynamic: true,
        headers: {
          'Cache-Control': 'max-age=10',
        },
      },
      buttons: [
        ...(!isEnded
          ? [
              <Button
                action="post"
                key="return-to-vote"
                target={`${getHost()}/api/frames/vote?Id=${Id}`}
              >
                Vote
              </Button>,
            ]
          : [
              <Button
                action="post"
                key="return-to-poll"
                target={`${getHost()}/api/frames/vote?Id=${Id}`}
              >
                Return to Poll
              </Button>,
            ]),
        <Button
          action="link"
          key="create-poll"
          target={`${getHost()}/poll?id=${Id}`}
        >
          View Poll
        </Button>,
        <Button
          action="link"
          key="create-poll"
          target={`https://beta.carbonvote.com/`}
        >
          Create a poll
        </Button>,
      ],
    };
  } catch (error) {
    console.error('Vote Error:', error);
    return {
      image: `data:image/svg+xml,${encodeURIComponent(`
        <svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="1200" height="630" fill="white"/>
          <text x="600" y="315" text-anchor="middle" font-size="48" fill="red">Error processing vote</text>
        </svg>
      `)}`,
      buttons: [
        <Button
          action="post"
          key="retry"
          target={`${getHost()}/api/frames/vote?Id=${ctx.searchParams.Id}`}
        >
          Retry
        </Button>,
      ],
    };
  }
});

export default handleRequest;
