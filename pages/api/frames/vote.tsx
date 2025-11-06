/* eslint-disable react/jsx-key */
import { createFrames, Button } from 'frames.js/next/pages-router/server';
import { base64Icon } from '@/src/constants';
import { farcasterHubContext } from 'frames.js/middleware';
import { getSupabaseClient } from '@/server/supabase';
import { FramePollData, PollOption } from '@/types';
import { CREDENTIALS } from '@/src/constants';
import { calculateTimeRemaining } from '@/utils';
import axios from 'axios';
import { getHost } from '@/utils/url';
const frames = createFrames({
  baseUrl: getHost(),
  basePath: '/api/frames/vote',
  middleware: [farcasterHubContext()],
});

export const POST = frames(async (ctx) => {
  try {
    const url = new URL(ctx.request.url);
    const pollId = url.searchParams.get('Id');
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .rpc('get_frame_poll_data', { poll_id_param: pollId })
      .single();
    const poll = data as FramePollData;
    const durationInMilliseconds = poll.time_limit;
    const startTime = new Date(poll.created_at + 'Z').getTime();
    const endTime = startTime + durationInMilliseconds * 1000;
    const timeRemaining = calculateTimeRemaining(endTime);
    const isEnded = timeRemaining === 'Time is up!';
    const STATUS = {
      CLOSED: {
        text: 'Closed',
        bgColor: 'bg-gray-500',
        timeDisplay: 'Closed',
        width: '70px',
      },
      LIVE: {
        text: 'Live',
        bgColor: 'bg-red-500',
        timeDisplay: timeRemaining,
        width: '50px',
      },
    };

    const currentStatus = isEnded ? STATUS.CLOSED : STATUS.LIVE;
    const options = poll.options.slice(0, 4);
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
                tw={`h-[24px] ${currentStatus.bgColor} text-white text-sm px-2 rounded-md flex items-center`}
                style={{ fontSize: '15px', width: currentStatus.width }}
              >
                {currentStatus.text}
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
                    {currentStatus.timeDisplay}
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
                options.length === 2
                  ? 'gap-3'
                  : options.length === 3
                    ? 'gap-1.5'
                    : 'gap-0'
              } mb-4`}
            >
              {options.map((option: PollOption, index: number) => (
                <div
                  key={option.id}
                  tw={`flex items-center bg-white rounded-lg ${
                    options.length === 2
                      ? 'p-4'
                      : options.length === 3
                        ? 'p-2.5'
                        : 'p-1'
                  }`}
                >
                  <span tw="mr-2 text-gray-500">{index + 1}.</span>
                  <span>
                    {option.option_description.length > 30
                      ? `${option.option_description.substring(0, 30)}...`
                      : option.option_description}
                  </span>
                </div>
              ))}
            </div>

            <div tw="mt-auto bg-[rgba(0,0,0,0.05)] p-4 rounded-lg text-sm flex flex-col">
              <div tw="flex items-center">
                <span
                  tw={`${options.length === 4 ? 'text-[18px]' : 'text-[24px]'} font-medium`}
                >
                  {credentialDisplay}
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
      buttons: !isEnded
        ? options.slice(0, 4).map((option: PollOption) => (
            <Button
              action="post"
              target={`${getHost()}/api/frames/result?Id=${pollId}&option_id=${option.id}&credential=${poll.credentials[0].id}`}
            >
              {option.option_description.length > 12
                ? option.option_description.substring(0, 12) + '...'
                : option.option_description}
            </Button>
          ))
        : [
            <Button
              action="post"
              key="results"
              target={`${getHost()}/api/frames/result?Id=${pollId}`}
            >
              View Results
            </Button>,
          ],
    };
  } catch (error) {
    console.error('Frame Error:', error);
    throw error;
  }
});

export default POST;
