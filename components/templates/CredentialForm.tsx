// import { Label } from '@radix-ui/react-label';
// import ToggleSwitchButton from '../ui/buttons/ToggleSwitchButton';

// export const CredentialForm = ({selectedCredentials, onCredentialsChange}) => {
//   return (
//     <div className="flex flex-col gap-8 py-2.5">
//       {/* ZuPass Credentials*/}
//       <div className="flex flex-col gap-2">
//         <div className="flex flex-5 gap-2">
//           <ToggleSwitchButton />
//           <Label className="text-lg">Add ZuPass Credentials</Label>
//         </div>
//         {/* <Label className="text-sm text-black/60">This is the ZuPass Credentials</Label> */}
//       </div>
//       <div className="flex flex-col gap-2">
//         <Label className="text-2xl font-semibold">Select Credentials</Label>
//         <select className="flex w-full text-black outline-none rounded-lg py-2.5 pr-3 pl-2.5 bg-inputField gap-2.5 items-center border border-white/10 border-opacity-10" title="ZuPass Credentials">
//           <option className="bg-componentPrimary origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" value="once">
//             ZuConnect Resident
//           </option>
//         </select>
//       </div>
//{
  /* <div className="flex flex-col gap-2">
        <div className="flex flex-5 gap-2">
          <ToggleSwitchButton />
          <Label className="text-lg">Add GitCoin Passport Credentials</Label>
        </div>
        <Label className="text-sm text-black/60">This is the GitCoin Passport Credentials</Label>
      </div> */
//}
//{
  /* <div className="flex flex-col gap-2">
        <Label className="text-2xl font-semibold">Select Credentials</Label>
        <select
          className="flex w-full text-black outline-none rounded-lg py-2.5 pr-3 pl-2.5 bg-inputField gap-2.5 items-center border border-white/10 border-opacity-10"
          title="GitCoin Credentials"
        >
          <option className="bg-componentPrimary origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" value="once">
            GitCoin Resident
          </option>
          <option className="bg-componentPrimary origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" value="everyday">
            GitCoin Resident
          </option>
          <option className="bg-componentPrimary origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" value="weekly">
            GitCoin Resident
          </option>
        </select>
      </div> */
//}
//{
  /* <div className="flex flex-col gap-2">
        <Label className="text-2xl font-semibold">Select Other Signals</Label>
        <select
          className="flex w-full text-black outline-none rounded-lg py-2.5 pr-3 pl-2.5 bg-inputField gap-2.5 items-center border border-white/10 border-opacity-10"
          title="Other Signals"
        >
          <option className="bg-componentPrimary origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" value="once">
            Protocol Guild Member
          </option>
          <option className="bg-componentPrimary origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" value="everyday">
            Protocol Guild Member
          </option>
          <option className="bg-componentPrimary origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" value="weekly">
            Protocol Guild Member
          </option>
        </select>
      </div> */
//}
//     </div>
//   );
// };

import React, { useState, useEffect } from 'react';
import { Label } from '@radix-ui/react-label';
import ToggleSwitchButton from '../ui/buttons/ToggleSwitchButton';

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
      setCredential('');
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
  );}
