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
{
  /* <div className="flex flex-col gap-2">
        <div className="flex flex-5 gap-2">
          <ToggleSwitchButton />
          <Label className="text-lg">Add GitCoin Passport Credentials</Label>
        </div>
        <Label className="text-sm text-black/60">This is the GitCoin Passport Credentials</Label>
      </div> */
}
{
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
}
{
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
}
//     </div>
//   );
// };

import { useState } from 'react';
import { Label } from '@radix-ui/react-label';
import ToggleSwitchButton from '../ui/buttons/ToggleSwitchButton';

type CredentialFormProps = {
  selectedCredentials: string[];
  onCredentialsChange: (credentials: string[]) => void;
};

export const CredentialForm = ({ selectedCredentials, onCredentialsChange }: CredentialFormProps) => {
  const [credential, setCredential] = useState('');
  const [isZuPassRequired, setIsZuPassRequired] = useState(false);

  const credentialsMapping = {
    'ZuConnect Resident': '76118436-886f-4690-8a54-ab465d08fa0d',
    // ... add other credential mappings
  };

  // Handler for when the credential requirement toggle is changed
  const handleToggleChange = (isRequired: boolean) => {
    setIsZuPassRequired(isRequired);
    // If ZuPass is no longer required, clear the selected credentials
    if (!isRequired) {
      onCredentialsChange([]);
    }
  };

  const handleCredentialSelect = (event: any) => {
    const credentialName = event.target.value;
    setCredential(credentialName); // Update the local state to reflect the UI change
    const credentialUUID = credentialsMapping[credentialName];
    onCredentialsChange([credentialUUID]); // Update the parent component's state
  };

  return (
    <div className="flex flex-col gap-8 py-2.5">
      {/* ZuPass Credentials Toggle */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-5 gap-2">
          <ToggleSwitchButton checked={isZuPassRequired} onClick={() => handleToggleChange(!isZuPassRequired)} />
          <Label className="text-lg">Add ZuPass Credentials</Label>
        </div>
      </div>

      {/* ZuPass Credentials Selector */}
      {isZuPassRequired && (
        <div className="flex flex-col gap-2">
          <Label className="text-2xl font-semibold">Select Credentials</Label>
          <select
            className="flex w-full text-black outline-none rounded-lg py-2.5 pr-3 pl-2.5 bg-inputField gap-2.5 items-center border border-white/10 border-opacity-10"
            title="ZuPass Credentials"
            value={credential}
            onChange={handleCredentialSelect}
          >
            <option value="">Select Credential</option>
            {/* <option value="zuConnectResident">ZuConnect Resident</option> */}
            {/* Add more options for different credentials as needed */}

            {Object.keys(credentialsMapping).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
