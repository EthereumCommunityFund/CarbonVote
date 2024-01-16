import { useState } from "react";
import axios from 'axios';
import { XMarkIcon } from '@/components/icons/xmark';
import { Event, PillInputs } from '@/types'
import { useFormStore } from "@/zustand/create";

const POAPEvents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Event[]>([]);

  // Zustand
  const selectedEvents = useFormStore((state) => state.selectedEvents)
  const addEvent = useFormStore((state) => state.addEvent)
  const removeEvent = useFormStore((state) => state.removeEvent)


  const handleSearch = async (event: any) => {
    setSearchTerm(event.target.value);
    if (event.target.value !== "") {

      const response = await axios.get(`/api/poap/searchPoaps?searchText=${event.target.value}`)
      setSearchResults(response?.data?.items);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectOption = (event: Event) => {
    if (selectedEvents.length < 5) {
      setSearchTerm("");
      setSearchResults([]);
      addEvent(event)
    }
  };

  const removeOption = (id: number) => {
    removeEvent(id)
  };

  const Pill = ({ event, onRemove }: PillInputs) => (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      border: '1px solid #ccc',
      borderRadius: '9999px',
      padding: '4px 8px',
      margin: '4px',
    }}>
      <img src={`${event.image_url}?size=small`} alt="" style={{ width: '30px', height: '30px', marginRight: '8px', borderRadius: 100 }} />
      <span>{event.name}</span>
      <button onClick={() => onRemove(event?.id)} style={{ marginLeft: '8px' }}>{<XMarkIcon />}</button>
    </div>
  );

  return (
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
        {searchTerm && searchResults.map(event => (
          <div key={event.id} onClick={() => handleSelectOption(event)} style={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #ccc',
            padding: '4px 8px',
            borderRadius: 4,
            margin: '4px'
          }}>
            <img src={`${event.image_url}?size=small`} alt="" style={{ width: '20px', height: '20px', marginRight: '8px', borderRadius: 100 }} />
            {event.name} - Id: {event.id}
          </div>
        ))}
      </div>
      <div>
        {selectedEvents.map(event => (
          <Pill key={event?.id} event={event} onRemove={() => removeOption(event?.id)} />
        ))}
      </div>
    </div>
  )
}

export default POAPEvents;