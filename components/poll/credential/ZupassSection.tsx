import React from 'react';
import { Label } from '@/components/ui/Label';
import { CheckCircleIcon } from '@/components/icons/checkcircle';
import { CheckCircleIconWhite } from '@/components/icons/checkcirclewhite';
import { LockIcon } from '@/components/icons/lock';
import Button from '@/components/ui/buttons/Button';
import { CREDENTIALS } from '@/src/constants';
import { CredentialTable } from '@/types';
import Image from 'next/image';
import CredentialItemContainer from './CredentialItemContainer';
import { CredentialsSectionProps } from './CredentialsSection';

const ZupassSection = ({
  credentialTable,
  userAvailableCredentials,
  expandedIds,
  setExpandedIds,
  zupasspoll,
  isPassportConnected,
  signIn,
  handleZupassConnect,
}: Pick<
  CredentialsSectionProps,
  | 'credentialTable'
  | 'userAvailableCredentials'
  | 'expandedIds'
  | 'setExpandedIds'
  | 'zupasspoll'
  | 'isPassportConnected'
  | 'signIn'
  | 'handleZupassConnect'
>) => {
  const zupassCredentials = credentialTable.filter((credential) =>
    [
      CREDENTIALS.DevConnect.id,
      CREDENTIALS.ZuConnectResident.id,
      CREDENTIALS.ZuzaluResident.id,
    ].includes(credential.id)
  );

  if (zupassCredentials.length === 0) return null;

  const zupassLabel = (
    <Label className="text-sm text-black font-bold">
      <div className="flex items-center gap-[10px]">
        <Image
          src="/images/zupass.svg"
          alt="Credential"
          className="image-class-name"
          width={24}
          height={24}
        />
        <span className="opacity-50">Zupass</span>
      </div>
    </Label>
  );

  const statusIcon = zupasspoll ? (
    <div className="flex items-center gap-[10px] bg-black text-white rounded-[50px] py-[7px] px-[10px] font-['Inter'] text-[14px] font-[500] mt-[7px]">
      ZuPass
      <CheckCircleIconWhite className="text-white w-[20px]" />
    </div>
  ) : (
    <LockIcon className="w-[28px] h-[28px] text-black opacity-20" />
  );

  const detailContent = isPassportConnected ? (
    <div className="flex flex-col gap-2.5">
      {zupassCredentials.map((credential) => {
        const credentialDetail = userAvailableCredentials.find(
          (item: CredentialTable) => item.id === credential.id
        );
        const votedOption = userAvailableCredentials.find(
          (credentialItem: CredentialTable) =>
            credentialItem.id === credential.id &&
            credentialItem.votedOptionName
        );

        return (
          <div
            key={credential.id}
            className="flex flex-col p-2.5 gap-2.5 bg-black bg-opacity-5 rounded-lg"
          >
            {credentialDetail ? (
              <>
                <CheckCircleIcon className="w-7 h-7" />
                <span className="text-black opacity-75">
                  {credential.credential}
                </span>
                {votedOption && (
                  <span className="text-sm">
                    Voted: {votedOption.votedOptionName}
                  </span>
                )}
              </>
            ) : (
              <>
                <LockIcon className="w-7 h-7 text-black opacity-25" />
                <span className="text-black opacity-75">
                  {credential.credential}
                </span>
                <Button
                  className="bg-transparent shadow-none py-2 px-4 text-black/80 rounded-lg focus:outline-none"
                  onClick={() => handleZupassConnect(credential.id)}
                >
                  Connect {credential.credential}
                </Button>
              </>
            )}
          </div>
        );
      })}
    </div>
  ) : (
    <Button
      className="rounded-[10px] bg-transparent shadow-none"
      onClick={signIn}
    >
      {isPassportConnected ? (
        <div className="flex items-center gap-[10px] flex-wrap">
          <div className="bg-black text-white flex items-center gap-[5px] py-[5px] px-[10px] pr-[5px] rounded-[50px]">
            <span>ZuConnect Resident</span>
            <Image
              src="/images/check.svg"
              alt="Check icon"
              width={16}
              height={16}
            />
          </div>
          <span>OR</span>
          <div className="bg-[#d0d0d0] text-black py-[6px] px-[15px] rounded-[50px]">
            Zuzalu Resident
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-[10px]">
          <Image
            src="/images/zupass_login.svg"
            alt="Zupass login"
            width={24}
            height={24}
          />
          <span>Zupass Login</span>
        </div>
      )}
    </Button>
  );

  return (
    <CredentialItemContainer
      id="Zupass"
      expandedIds={expandedIds}
      setExpandedIds={setExpandedIds}
      label={zupassLabel}
      statusIcon={statusIcon}
      detailContent={detailContent}
    />
  );
};

export default ZupassSection;
