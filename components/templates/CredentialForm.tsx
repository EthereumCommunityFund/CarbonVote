import React, { useState, useEffect } from 'react';
import { Label } from '@radix-ui/react-label';
import ToggleSwitchButton from '../ui/buttons/ToggleSwitchButton';
import POAPEvents from '../POAPEvents';
import { useFormStore } from "@/zustand/create";

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
  const [isPOAPapiRequired, setIsPOAPapiRequired] = useState(false);
  const [isPOAPsRequired, setIsPOAPsRequired] = useState(false);
  const [isProtocolGuildMemberRequired, setIsProtocolGuildMemberRequired] = useState(false);
  const [isZuPassRequired, setIsZuPassRequired] = useState(false);
  const [isGitcoinPassportRequired, setIsGitcoinPassportRequired] = useState(false);
  const [selectedCredentialText, setSelectedCredentialText] = useState("Select Credential");
  const credentialsMapping: CredentialsMapping = {
    'Protocol Guild Member': '635a93d1-4d2c-47d9-82f4-9acd8ff68350',
    'ZuConnect Resident': '76118436-886f-4690-8a54-ab465d08fa0d',
    'DevConnect': '3cc4b682-9865-47b0-aed8-ef1095e1c398',
    'Gitcoin Passport': '6ea677c7-f6aa-4da5-88f5-0bcdc5c872c2',
    'POAPS Verification': '600d1865-1441-4e36-bb13-9345c94c4dfb',
  };

  const resetEvents = useFormStore((state) => state.resetEvents)

  const updateCredentials = (credentialKey: string) => {
    const uuid = credentialsMapping[credentialKey];
    setCredential(uuid);
    onCredentialsChange([uuid]);
    console.log(uuid, 'credential selected');
  };

  const handleCredentialSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCredentialKey = event.target.value;
    const selectedText = event.target.options[event.target.selectedIndex].text;
    updateCredentials(selectedCredentialKey);
    setSelectedCredentialText(selectedText);
  };

  const handlePOAPSelect = () => {
    setIsPOAPsRequired(!isPOAPsRequired);
    setIsPOAPapiRequired(false);
    setIsZuPassRequired(false);
    setIsGitcoinPassportRequired(false);
    setIsProtocolGuildMemberRequired(false);
    updateCredentials('POAPS Verification');
    resetEvents();
  }

  const handlePOAPapiSelect = () => {
    setIsPOAPapiRequired(!isPOAPapiRequired);
    setIsPOAPsRequired(false);
    setIsZuPassRequired(false);
    setIsGitcoinPassportRequired(false);
    setIsProtocolGuildMemberRequired(false);
    updateCredentials('POAPS Verification');
  }
  const handleGitCoinSelect = () => {
    setIsGitcoinPassportRequired(!isGitcoinPassportRequired);
    setIsPOAPapiRequired(false);
    setIsPOAPsRequired(false);
    setIsZuPassRequired(false);
    setIsProtocolGuildMemberRequired(false);
    updateCredentials('Gitcoin Passport');
    resetEvents();
  }

  const handleProtocolGuildMemberSelect = () => {
    setIsGitcoinPassportRequired(false);
    setIsPOAPapiRequired(false);
    setIsPOAPsRequired(false);
    setIsZuPassRequired(false);
    setIsProtocolGuildMemberRequired(!isProtocolGuildMemberRequired);
    updateCredentials('Protocol Guild Member');
    resetEvents();
  }

  const handleZuPassSelect = () => {
    setIsGitcoinPassportRequired(false);
    setIsPOAPapiRequired(false);
    setIsPOAPsRequired(false);
    setIsZuPassRequired(!isZuPassRequired);
    setIsProtocolGuildMemberRequired(false);
    updateCredentials('ZuConnect Resident');
    resetEvents();
  }

  const CredentialSelector = () => {
    if (isPOAPsRequired) {
      return (
        <div className="flex flex-col gap-2">
          <Label className="text-2xl font-semibold">Select Event</Label>
          <POAPEvents />
        </div>)
    } else if (isZuPassRequired) {
      return (
        <div className="flex flex-col gap-2">
          <Label className="text-2xl font-semibold">Select Credential</Label>
          <select
            title="Credentials"
            value={selectedCredentialText}
            onChange={handleCredentialSelect}
            disabled={!isProtocolGuildMemberRequired && !isZuPassRequired && !isGitcoinPassportRequired && !isPOAPsRequired}
          >
            <option value="">Select an option</option>
            <>
              <option value="ZuConnect Resident">ZuConnect Resident</option>
              <option value="DevConnect">DevConnect</option>
            </>
          </select>
        </div>
      )
    }
  }

  return (
    <div className="flex flex-col gap-8 py-2.5">
      {/* POAP Event */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-5 gap-2">
          <ToggleSwitchButton
            checked={isPOAPsRequired}
            onClick={handlePOAPSelect}
          />
          <Label className="text-lg">Add Ethereum POAPS Checking (The test version stores only 10 events)</Label>
        </div>
      </div>

      {/* POAP Event - w/ API */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-5 gap-2">
          <ToggleSwitchButton
            checked={isPOAPapiRequired}
            onClick={handlePOAPapiSelect}
          />
          <Label className="text-lg">Add Ethereum POAPs (Offchain Verification) (The test version stores only 2 events)</Label>
        </div>
      </div>

      {/* Protocol Guild Member Toggle */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-5 gap-2">
          <ToggleSwitchButton
            checked={isProtocolGuildMemberRequired}
            onClick={handleProtocolGuildMemberSelect}
          />
          <Label className="text-lg">Add Protocol Guild Member Credential</Label>
        </div>
      </div>

      {/* ZuPass Credentials Toggle */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-5 gap-2">
          <ToggleSwitchButton
            checked={isZuPassRequired}
            onClick={handleZuPassSelect}
          />
          <Label className="text-lg">Add ZuPass Credentials</Label>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-5 gap-2">
          <ToggleSwitchButton
            checked={isGitcoinPassportRequired}
            onClick={handleGitCoinSelect}
          />
          <Label className="text-lg">Add Gitcoin Passport Credential</Label>
        </div>
      </div>

      <CredentialSelector />
    </div>
  );
};