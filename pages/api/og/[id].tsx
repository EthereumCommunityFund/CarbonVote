import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { getSupabaseClient } from '@/server/supabase';
import { calculateTimeRemaining } from '@/utils';
import { FramePollData } from '@/types';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const { origin } = url;
    let id = url.searchParams.get('id');
    const timestamp = url.searchParams.get('t'); // Support timestamp for cache busting

    if (!id) {
      const pathParts = url.pathname.split('/');
      id = pathParts[pathParts.length - 1];
    }

    if (!id) {
      return new ImageResponse(
        (
          <div
            style={{
              display: 'flex',
              fontSize: 32,
              color: 'black',
              background:
                'linear-gradient(49.41deg, #FF7373 -45.09%, #FFE2E2 43.62%)',
              width: '100%',
              height: '100%',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div>Missing poll ID</div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }

    // Fetch poll data
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .rpc('get_frame_poll_data', { poll_id_param: id })
      .single();

    if (error || !data) {
      console.error(
        '[OG Image] Failed to load poll data for ID:',
        id,
        'Error:',
        error
      );
      return new ImageResponse(
        (
          <div
            style={{
              display: 'flex',
              fontSize: 32,
              color: 'black',
              background:
                'linear-gradient(49.41deg, #FF7373 -45.09%, #FFE2E2 43.62%)',
              width: '100%',
              height: '100%',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div>Poll not found</div>
            <div style={{ fontSize: 20, marginTop: 10, opacity: 0.7 }}>
              Check if the poll ID is correct
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }

    const poll = data as FramePollData;
    const options = poll.options.slice(0, 3); // Show top 3 options

    // Helper function to truncate text
    const truncateText = (text: string, maxLength: number) => {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength - 3) + '...';
    };

    // Calculate poll status
    const durationInMilliseconds = poll.time_limit;
    const startTime = new Date(poll.created_at + 'Z').getTime();
    const endTime = startTime + durationInMilliseconds * 1000;
    const timeRemaining = calculateTimeRemaining(endTime);
    const isEnded = timeRemaining === 'Time is up!';

    // Fetch real vote data
    let voteCounts = options.map(() => ({
      percent: '0',
      eth: '0 ETH',
      count: 0,
    }));

    try {
      const { data: voteData } = await supabase.rpc('get_poll_results', {
        poll_id_param: id,
      });

      if (voteData && voteData.length > 0) {
        const totalVotes = voteData.reduce(
          (sum: number, vote: any) => sum + (vote.vote_count || 0),
          0
        );

        voteCounts = options.map((option, index) => {
          const optionVotes = voteData.find(
            (vote: any) => vote.option_id === option.id
          );
          const voteCount = optionVotes?.vote_count || 0;
          const ethAmount = optionVotes?.total_eth || 0;
          const percentage =
            totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

          return {
            percent: percentage.toString(),
            eth:
              ethAmount > 0
                ? `${parseFloat(ethAmount).toFixed(1)} ETH`
                : '0 ETH',
            count: voteCount,
          };
        });
      }
    } catch (error) {
      console.error(
        '[OG Image] Failed to fetch vote data for poll:',
        id,
        error
      );
      // Continue with default vote counts rather than failing
    }

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            background:
              'linear-gradient(49.41deg, #FF7373 -45.09%, #FFE2E2 43.62%)',
            padding: '40px',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {/* Left content area */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '45%',
              gap: '10px',
            }}
          >
            <div
              style={{
                height: '32px',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                marginBottom: '20px',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${origin}/favicon-32x32.png`}
                alt="Carbonvote Logo"
                width="32"
                height="32"
                style={{
                  width: '32px',
                  height: '32px',
                }}
              />
              <div
                style={{
                  fontSize: '28px',
                  color: 'rgba(248, 74, 74, 1)',
                  display: 'flex',
                  fontWeight: '1000',
                }}
              >
                Carbonvote.com
              </div>
            </div>

            {/* Poll title */}
            <div
              style={{
                fontSize: '32px',
                fontWeight: '1200',
                color: 'rgba(0, 0, 0, 1)',
                display: 'flex',
              }}
            >
              VOTE ON POLL:
            </div>

            {/* Poll content */}
            <div
              style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '40px',
                lineHeight: '1.2',
                display: 'flex',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              &quot;{truncateText(poll.title, 60)}&quot;
            </div>

            {/* Countdown */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: 'auto',
                fontSize: '24px',
                color: '#333',
              }}
            >
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: '#333',
                  marginRight: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                ⏱
              </div>
              {isEnded ? 'Voting ended' : timeRemaining}
            </div>
          </div>

          {/* Right results area */}
          <div
            style={{
              width: '55%',
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#666',
                  display: 'flex',
                }}
              >
                MOST VOTES: (TOP 3)
              </div>
              <div
                style={{
                  background: '#FF7373',
                  color: 'white',
                  padding: '4px 20px',
                  borderRadius: '8px',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  display: 'flex',
                }}
              >
                LIVE
              </div>
            </div>

            {/* Voting options */}
            {options.map((option, index) => (
              <div
                key={index}
                style={{
                  marginBottom: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      display: 'flex',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '300px',
                    }}
                  >
                    {truncateText(option.option_description, 30)}
                  </div>
                  <div
                    style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      display: 'flex',
                    }}
                  >
                    {voteCounts[index].percent}%
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    height: '24px',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(parseInt(voteCounts[index].percent) || 30, 100)}%`,
                      background: '#FF7373',
                      borderRadius: '4px',
                      display: 'flex',
                    }}
                  ></div>
                  <div
                    style={{
                      height: '100%',
                      flex: 1,
                      background: '#EEEEEE',
                      borderTopRightRadius: '4px',
                      borderBottomRightRadius: '4px',
                      display: 'flex',
                    }}
                  ></div>
                </div>

                <div
                  style={{
                    textAlign: 'right',
                    color: '#666',
                    fontSize: '18px',
                    marginTop: '4px',
                    display: 'flex',
                    justifyContent: 'flex-end',
                  }}
                >
                  {voteCounts[index].eth}
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
      {
        width: 1200, // Twitter recommended width
        height: 630, // Twitter recommended height
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=60, s-maxage=60', // Simple 1-minute cache
        },
      }
    );
  } catch (error) {
    console.error(
      '[OG Image] Unexpected error generating image for poll:',
      new URL(req.url).searchParams.get('id') || 'unknown',
      error
    );
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            fontSize: 32,
            color: 'black',
            background:
              'linear-gradient(49.41deg, #FF7373 -45.09%, #FFE2E2 43.62%)',
            width: '100%',
            height: '100%',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div>Error generating image</div>
          <div style={{ fontSize: 20, marginTop: 10, opacity: 0.7 }}>
            Please try again later
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}
