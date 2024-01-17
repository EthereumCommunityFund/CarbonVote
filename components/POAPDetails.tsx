import { useEffect, useState } from 'react';
import { getPoapEventDetails } from '../controllers/poap.controller';
import { Loader } from '@/components/ui/Loader';

type PoapEventsIds = {
  poapEvents: number[]
  account: string | null
}

const PoapDetails = ({ poapEvents, account }: PoapEventsIds) => {
  const [isLoading, setIsLoading] = useState(true)
  const [eventDetails, setEventDetails] = useState<any[]>([])

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const responses = await Promise.all(
          poapEvents.map(eventId => getPoapEventDetails(eventId, account))
        );
        setEventDetails(prevDetails => [...prevDetails, ...responses]);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    fetchEventDetails();
  }, [poapEvents]);


  return (
    <div>
      {isLoading ?
        <Loader />
        : eventDetails.map(({ data }) => {
          const { event, tokenId, owner } = data;
          return (
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                border: '1px solid #ccc',
                borderRadius: '9999px',
                padding: '4px 8px',
                margin: '4px',
              }}>
                <img src={`${event.image_url}?size=small`} alt="" style={{ width: '20px', height: '20px', borderRadius: 100 }} />
                <span className="text-sm mx-2">{event.name}</span>
                <div>{!!owner ? "✅" : "🔴"}</div>
              </div>
            </div>
          )
        })}
    </div>
  )
}
export default PoapDetails;