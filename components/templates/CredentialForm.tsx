import React, { useState, useEffect } from 'react';
import { Label } from '@radix-ui/react-label';
import ToggleSwitchButton from '../ui/buttons/ToggleSwitchButton';
import POAPEvents from '../POAPEvents';
import { Event } from '@/types'

type CredentialFormProps = {
  selectedCredentials: string[];
  onCredentialsChange: (credentials: string[]) => void;
};

interface CredentialsMapping {
  [key: string]: string;
}

export const CredentialForm = ({
  selectedCredentials,
  onCredentialsChange,
}: CredentialFormProps) => {
  const [credential, setCredential] = useState('');
  const [isProtocolGuildMemberRequired, setIsProtocolGuildMemberRequired] = useState(false);
  const [isZuPassRequired, setIsZuPassRequired] = useState(false);

  const [isPOAPsRequired, setIsPOAPsRequired] = useState(false);


  const credentialsMapping: CredentialsMapping = {
    'Protocol Guild Member': '635a93d1-4d2c-47d9-82f4-9acd8ff68350',
    'ZuConnect Resident': '76118436-886f-4690-8a54-ab465d08fa0d',
    'DevConnect': '3cc4b682-9865-47b0-aed8-ef1095e1c398',
  };

  useEffect(() => {
    if (isProtocolGuildMemberRequired) {
      const uuid = credentialsMapping['Protocol Guild Member'];
      setCredential(uuid);
      onCredentialsChange([uuid]);
      setIsZuPassRequired(false);
    } else if (isZuPassRequired) {
      setCredential('');
    } else {
      setCredential('')
      onCredentialsChange([]);
    }
  }, [isProtocolGuildMemberRequired, isZuPassRequired, onCredentialsChange]);

  const handleCredentialSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCredentialUUID = event.target.value;
    setCredential(selectedCredentialUUID);
    onCredentialsChange([selectedCredentialUUID]);
  };

  return (
    <div className="flex flex-col gap-8 py-2.5">
      {/* POAP Event */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-5 gap-2">
          <ToggleSwitchButton
            checked={isPOAPsRequired}
            onClick={() => setIsPOAPsRequired(!isPOAPsRequired)}
          />
          <Label className="text-lg">Add POAP Events</Label>
        </div>
      </div>

      {isPOAPsRequired && (
        <POAPEvents />
      )}

      {/* Protocol Guild Member Toggle */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-5 gap-2">
          <ToggleSwitchButton
            checked={isProtocolGuildMemberRequired}
            onClick={() => setIsProtocolGuildMemberRequired(!isProtocolGuildMemberRequired)}
          />
          <Label className="text-lg">Add Protocol Guild Member Credential</Label>
        </div>
      </div>

      {/* ZuPass Credentials Toggle */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-5 gap-2">
          <ToggleSwitchButton
            checked={isZuPassRequired}
            onClick={() => setIsZuPassRequired(!isZuPassRequired)}
          />
          <Label className="text-lg">Add ZuPass Credentials</Label>
        </div>
      </div>

      {/* Credentials Selector */}
      <div className="flex flex-col gap-2">
        <Label className="text-2xl font-semibold">Select Credentials</Label>
        <select
          className="..."
          title="Credentials"
          value={credential}
          onChange={handleCredentialSelect}
          disabled={!isProtocolGuildMemberRequired && !isZuPassRequired}
        >
          <option value="">Select Credential</option>
          {isProtocolGuildMemberRequired && (
            <option value={credentialsMapping['Protocol Guild Member']}>Protocol Guild Member</option>
          )}
          {isZuPassRequired && (
            <>
              <option value={credentialsMapping['ZuConnect Resident']}>ZuConnect Resident</option>
              <option value={credentialsMapping['DevConnect']}>DevConnect</option>
            </>
          )}
        </select>
      </div>
    </div>
  );
}
