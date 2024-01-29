import React, { useState } from 'react';
import { Label } from '@radix-ui/react-label';
import ToggleSwitchButton from '../ui/buttons/ToggleSwitchButton';
import POAPEvents from '../POAPEvents';
import { useFormStore } from "@/zustand/create";
import { CREDENTIALS } from '@/src/constants'

type CredentialFormProps = {
  selectedCredentials: string[];
  onCredentialsChange: (credentials: string[]) => void;
};

export const CredentialForm = ({
  selectedCredentials,
  onCredentialsChange,
}: CredentialFormProps) => {
  const [isPOAPapiRequired, setIsPOAPapiRequired] = useState(false);
  const [isPOAPsRequired, setIsPOAPsRequired] = useState(false);
  const [isProtocolGuildMemberRequired, setIsProtocolGuildMemberRequired] = useState(false);
  const [isZuPassRequired, setIsZuPassRequired] = useState(false);
  const [isGitcoinPassportRequired, setIsGitcoinPassportRequired] = useState(false);
  const [selectedCredentialText, setSelectedCredentialText] = useState("Select Credential");

  const resetEvents = useFormStore((state) => state.resetEvents)

  const updateCredentials = (credentialUUID: string) => {
    onCredentialsChange([credentialUUID]);
    console.log(credentialUUID, 'credential selected');
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
    updateCredentials(CREDENTIALS.POAPSVerification.id);
    resetEvents();
  }

  const handlePOAPapiSelect = () => {
    setIsPOAPapiRequired(!isPOAPapiRequired);
    setIsPOAPsRequired(false);
    setIsZuPassRequired(false);
    setIsGitcoinPassportRequired(false);
    setIsProtocolGuildMemberRequired(false);
    // TODO: There;s no POAP api credentials
    updateCredentials('');
  }
  const handleGitCoinSelect = () => {
    setIsGitcoinPassportRequired(!isGitcoinPassportRequired);
    setIsPOAPapiRequired(false);
    setIsPOAPsRequired(false);
    setIsZuPassRequired(false);
    setIsProtocolGuildMemberRequired(false);
    updateCredentials(CREDENTIALS.GitcoinPassport.id);
    resetEvents();
  }

  const handleProtocolGuildMemberSelect = () => {
    setIsGitcoinPassportRequired(false);
    setIsPOAPapiRequired(false);
    setIsPOAPsRequired(false);
    setIsZuPassRequired(false);
    setIsProtocolGuildMemberRequired(!isProtocolGuildMemberRequired);
    updateCredentials(CREDENTIALS.ProtocolGuildMember.id);
    resetEvents();
  }

  const handleZuPassSelect = () => {
    setIsGitcoinPassportRequired(false);
    setIsPOAPapiRequired(false);
    setIsPOAPsRequired(false);
    setIsZuPassRequired(!isZuPassRequired);
    setIsProtocolGuildMemberRequired(false);
    updateCredentials(CREDENTIALS.ZuConnectResident.id);
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
              <option value={CREDENTIALS.ZuConnectResident.id}>{CREDENTIALS.ZuConnectResident.name}</option>
              <option value={CREDENTIALS.DevConnect.id}>{CREDENTIALS.DevConnect.name}</option>
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
          <Label className="text-lg">Ethereum POAPS Checking - Onchain verification</Label>
          <Label className="text-lg">(The test version stores only 2 events)</Label>
        </div>
      </div>

      {/* POAP Event - w/ API */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-5 gap-2">
          <ToggleSwitchButton
            checked={isPOAPapiRequired}
            onClick={handlePOAPapiSelect}
          />
          <Label className="text-lg">Ethereum POAPs - Offchain verification</Label>
        </div>
      </div>

      {/* Protocol Guild Member Toggle */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-5 gap-2">
          <ToggleSwitchButton
            checked={isProtocolGuildMemberRequired}
            onClick={handleProtocolGuildMemberSelect}
          />
          <Label className="text-lg">Protocol Guild Member Credential</Label>
        </div>
      </div>

      {/* ZuPass Credentials Toggle */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-5 gap-2">
          <ToggleSwitchButton
            checked={isZuPassRequired}
            onClick={handleZuPassSelect}
          />
          <Label className="text-lg">ZuPass Credentials</Label>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-5 gap-2">
          <ToggleSwitchButton
            checked={isGitcoinPassportRequired}
            onClick={handleGitCoinSelect}
          />
          <Label className="text-lg">Gitcoin Passport Credential</Label>
        </div>
      </div>

      <CredentialSelector />
    </div>
  );
};