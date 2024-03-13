import { useState, useEffect } from 'react';
import { XMarkIcon } from '@/components/icons/xmark';
import { Event, PillInputs } from '@/types';
import { useFormStore } from '@/zustand/create';
import { searchPoaps } from '../controllers/poap.controller';
import { EthPOAPs } from '@/src/ethPOAPs';
import Button from '@/components/ui/buttons/Button';
import {
  FiArrowLeft,
  FiPlusCircle,
  FiX,
  FiPlus,
  FiTrash2,
  FiArrowDown,
} from 'react-icons/fi';
import styles from '@/styles/createPoll.module.css';
import { getPoapEventDetails } from '../controllers/poap.controller';
const POAPEvents = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Event[]>([]);

  // Zustand
  const selectedEvents = useFormStore((state) => state.selectedEvents);
  const addEvent = useFormStore((state) => state.addEvent);
  const removeEvent = useFormStore((state) => state.removeEvent);
  const reset = useFormStore((state) => state.reset);

  const handleSearch = async (event: any) => {
    setSearchTerm(event.target.value);
    if (event.target.value !== '') {
      const response = await searchPoaps(event.target.value);
      setSearchResults(response?.data?.items);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectOption = (event: Event) => {
    if (selectedEvents.length) {
      setSearchTerm('');
      setSearchResults([]);
      addEvent(event);
    }
  };

  const removeOption = (id: number) => {
    removeEvent(id);
  };

  const addEthPoapEvents = async () => {
    for (const eventId of EthPOAPs) {
      try {
        console.log('fetching event', eventId);
        const response = await getPoapEventDetails(eventId, null);
        if (response.data) {
          const eventDetails: Event = response.data.event;
          addEvent(eventDetails);
        }
      } catch (error) {
        console.error('Error fetching event details:', error);
      }
    }
  };
  const deleteAllSelected = () => {
    reset();
  };

  const Pill = ({ event, onRemove }: PillInputs) => (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        border: '1px solid #c2c2c2',
        backgroundColor: '#ececec',
        borderRadius: '9999px',
        padding: '4px 8px',
        margin: '4px',
      }}
    >
      <img
        src={`${event.image_url}?size=small`}
        alt=""
        style={{
          width: '30px',
          height: '30px',
          marginRight: '8px',
          borderRadius: 100,
        }}
      />
      <span>{event.name}</span>
      <button onClick={() => onRemove(event?.id)} style={{ marginLeft: '8px' }}>
        {<XMarkIcon />}
      </button>
    </div>
  );

  return (
    <>
      <div className="flex justify-end items-center">
        {selectedEvents.length > 0 && (
          <Button
            className={`${styles.bottom_cta} button-font-size mr-4`}
            style={{ width: '10%' }}
            onClick={deleteAllSelected}
          >
            Delete all selected
          </Button>
        )}

        <Button
          className={styles.bottom_cta}
          rightIcon={FiPlus}
          onClick={addEthPoapEvents}
        >
          Auto-add Ethereum event POAPs
        </Button>
      </div>
      <div className="flex flex-col justify-center">
        <div className="w-full">
          <div className="flex border-2 border-gray-300 rounded-lg">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-4 py-2 text-sm focus:outline-none"
              placeholder="Search events by name or id..."
            />
            <button className="flex items-center justify-center px-4 bg-gray-300">
              <svg
                className="w-6 h-6 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </div>

        <div>
          {searchTerm &&
            searchResults.map((event) => (
              <div
                key={event.id}
                onClick={() => handleSelectOption(event)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #ccc',
                  padding: '4px 8px',
                  borderRadius: 4,
                  margin: '4px',
                }}
              >
                <img
                  src={`${event.image_url}?size=small`}
                  alt=""
                  style={{
                    width: '20px',
                    height: '20px',
                    marginRight: '8px',
                    borderRadius: 100,
                  }}
                />
                {event.name} - Id: {event.id}
              </div>
            ))}
        </div>
        <div>
          {selectedEvents.map((event) => (
            <Pill
              key={event?.id}
              event={event}
              onRemove={() => removeOption(event?.id)}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default POAPEvents;
