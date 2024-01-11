import React, { useState, useEffect } from 'react';
import { Label } from '@radix-ui/react-label';
import ToggleSwitchButton from '../ui/buttons/ToggleSwitchButton';
//import POAPEvents from '../POAPEvents';

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

  useEffect(() => {

  }, [isProtocolGuildMemberRequired, isZuPassRequired, isGitcoinPassportRequired, isPOAPsRequired, onCredentialsChange]);


  const updateCredentials = (credentialKey: string) => {
    const uuid = credentialsMapping[credentialKey];
    setCredential(uuid);
    onCredentialsChange([uuid]);
  };

  const handleCredentialSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCredentialKey = event.target.value;
    const selectedText = event.target.options[event.target.selectedIndex].text;
    updateCredentials(selectedCredentialKey);
    setSelectedCredentialText(selectedText);
  };

  const handlePOAPSelect = () => {
    setIsPOAPsRequired(!isPOAPsRequired);
    setIsZuPassRequired(false);
    setIsGitcoinPassportRequired(false);
    setIsProtocolGuildMemberRequired(false);
  }

  const handleGitCoinSelect = () => {
    setIsGitcoinPassportRequired(!isGitcoinPassportRequired);
    setIsPOAPsRequired(false);
    setIsZuPassRequired(false);
    setIsProtocolGuildMemberRequired(false);
  }

  const handleProtocolGuildMemberSelect = () => {
    setIsGitcoinPassportRequired(false);
    setIsPOAPsRequired(false);
    setIsZuPassRequired(false);
    setIsProtocolGuildMemberRequired(!isProtocolGuildMemberRequired);
  }

  const handleZuPassSelect = () => {
    setIsGitcoinPassportRequired(false);
    setIsPOAPsRequired(false);
    setIsZuPassRequired(!isZuPassRequired);
    setIsProtocolGuildMemberRequired(false);
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

      {/* Credentials Selector */}
      <div className="flex flex-col gap-2">
        <Label className="text-2xl font-semibold">{selectedCredentialText}</Label>
        <select
          className="..."
          title="Credentials"
          value={credential}
          onChange={handleCredentialSelect}
          disabled={!isProtocolGuildMemberRequired && !isZuPassRequired && !isGitcoinPassportRequired && !isPOAPsRequired}
        >
          <option value="">Select Credential</option>
          {isProtocolGuildMemberRequired && (
            <option value="Protocol Guild Member">Protocol Guild Member</option>
          )}
          {isZuPassRequired && (
            <>
              <option value="ZuConnect Resident">ZuConnect Resident</option>
              <option value="DevConnect">DevConnect</option>
            </>
          )}
          {isPOAPsRequired && (
            <option value="POAPS Verification">POAPS Verification</option>
          )}
          {isGitcoinPassportRequired && (
            <option value="Gitcoin Passport">Gitcoin Passport</option>
          )}
        </select>
      </div>
    </div>
  );
};