import React, { useCallback, useMemo, memo, useEffect } from 'react';
import { HiArrowRight, HiCheck, HiPlus } from 'react-icons/hi';
import { CREDENTIALS } from '@/src/constants';
import Modal from '@/components/ui/Modal';
import Image from 'next/image';
interface VotingProcess {
  credentialId: string;
  status: string;
  contractpoll?: string;
}

interface ConfirmationPopupProps {
  votingProcess: VotingProcess[];
  onClose: () => void;
  option_description: string;
  isOpen?: boolean;
  onRefresh: () => void;
}

const CREDENTIAL_DETAILS_MAP: Record<string, { imgSrc: string; text: string }> =
  {
    [CREDENTIALS.ProtocolGuildMember.id]: {
      imgSrc: '/images/guild.png',
      text: 'Protocol Guild Membership',
    },
    [CREDENTIALS.EthHoldingOffchain.id]: {
      imgSrc: '/images/eth_logo.svg',
      text: 'Eth Holding',
    },
    [CREDENTIALS.ZuConnectResident.id]: {
      imgSrc: '/images/zupass.svg',
      text: 'Zupass',
    },
    [CREDENTIALS.DevConnect.id]: {
      imgSrc: '/images/zupass.svg',
      text: 'Zupass',
    },
    [CREDENTIALS.ZuzaluResident.id]: {
      imgSrc: '/images/zupass.svg',
      text: 'Zupass',
    },
    [CREDENTIALS.GitcoinPassport.id]: {
      imgSrc: '/images/gitcoin.svg',
      text: 'Gitcoin Passport',
    },
    [CREDENTIALS.POAPapi.id]: { imgSrc: '/images/poaps.svg', text: 'POAPs' },
    [CREDENTIALS.EthSoloStaker.id]: {
      imgSrc: '/images/solo_staker.svg',
      text: 'Solo Staker',
    },
    [CREDENTIALS.WhitelistedAddresses.id]: {
      imgSrc: '/images/address_book.svg',
      text: 'Whitelisted Addresses',
    },
  };

function getCredentialDetails(credential: VotingProcess): {
  imgSrc: string;
  text: string;
} {
  if (
    credential.credentialId &&
    CREDENTIAL_DETAILS_MAP[credential.credentialId]
  ) {
    return CREDENTIAL_DETAILS_MAP[credential.credentialId];
  }

  if (credential.contractpoll) {
    if (credential.contractpoll.includes('ProtocolGuild on-chain')) {
      return { imgSrc: '/images/guild.png', text: 'Protocol Guild Membership' };
    }
    if (credential.contractpoll.includes('EthHolding on-chain')) {
      return { imgSrc: '/images/eth_logo.svg', text: 'Eth Holding' };
    }
  }

  return { imgSrc: '', text: '' };
}

const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({
  votingProcess,
  onClose,
  option_description,
  isOpen = true,
  onRefresh,
}) => {
  const getStatusIcon = useCallback(
    (credentialId: string) => {
      const process = votingProcess.find(
        (voting) => voting.credentialId === credentialId
      );
      if (!process) return null;

      const iconUrl =
        process.status === 'success'
          ? '/images/check.svg'
          : process.status === 'error'
            ? '/images/info_circle.svg'
            : getCredentialDetails(process).imgSrc;

      const altText =
        process.status === 'success'
          ? 'Success'
          : process.status === 'error'
            ? 'Error'
            : 'Credential';

      return <Image src={iconUrl} alt={altText} width={22} height={22} />;
    },
    [votingProcess]
  );

  const confirmationText = useMemo(() => {
    return votingProcess
      .map((process, index) => {
        if (process.status !== 'success') {
          const { imgSrc: imagePath, text } = getCredentialDetails(process);
          return (
            <div
              key={index}
              className="flex justify-center items-center flex-wrap gap-0"
            >
              <div className="flex items-center justify-center gap-[10px] w-fit bg-black/[0.05] px-[6px] py-[4px] rounded-[10px]">
                <Image src={imagePath} alt={text} width={24} height={24} />
                <span className="text-[14px] font-[700] text-black/50">
                  {text}
                </span>
              </div>
              {index < votingProcess.length - 1 ? (
                <span className="mx-[4px]">+</span>
              ) : null}
            </div>
          );
        }
        return null;
      })
      .filter((component) => component !== null);
  }, [votingProcess]);

  const confirmedVotePrompt = useMemo(() => {
    const allConfirmed = votingProcess.every(
      (vote) => vote.status === 'success'
    );

    if (!allConfirmed) {
      return (
        <div className="w-full flex items-center gap-2.5 border border-[#e3e3e3] rounded-[10px] p-2.5">
          <div className="animate-spin">
            <Image
              src="/images/loader.png"
              alt="Loading"
              width={30}
              height={30}
            />
          </div>
          <span>Verifying vote...</span>
        </div>
      );
    }

    return (
      <div className="w-full flex items-center gap-2.5 border border-[#e3e3e3] rounded-[10px] p-2.5">
        <Image
          src="/images/vote_check.svg"
          alt="Vote Confirmed"
          width={30}
          height={30}
        />
        <span>Your vote is confirmed!</span>
      </div>
    );
  }, [votingProcess]);

  const allCompleted = useMemo(() => {
    return votingProcess.every(
      (vote) =>
        vote.status === 'success' ||
        vote.status === 'error' ||
        vote.status === 'unauthorized' ||
        vote.status === 'popup_disabled'
    );
  }, [votingProcess]);

  useEffect(() => {
    const allSuccess = votingProcess.every((vote) => vote.status === 'success');
    if (allSuccess && votingProcess.length > 0) {
      onRefresh();
    } else if (allCompleted) {
      onRefresh();
    }
  }, [votingProcess, allCompleted, onRefresh]);

  const handleClose = useCallback(() => {
    onRefresh();
    onClose();
  }, [onClose, onRefresh]);

  // TODO handle case about user reject or error
  const confirmedButton = useMemo(() => {
    if (!allCompleted) {
      return (
        <button className="bg-[#ececec] text-[#4d4d4d] font-bold flex items-center justify-center p-2.5 gap-2.5 text-lg rounded-[50px] mt-[30px] w-full">
          <span>Confirming...</span>
        </button>
      );
    }

    return (
      <button
        className="bg-[#ececec] text-[#4d4d4d] font-bold flex items-center justify-center p-2.5 gap-2.5 text-lg rounded-[50px] mt-[30px] w-full hover:bg-black/30"
        onClick={handleClose}
      >
        <HiCheck />
        <span>Done</span>
      </button>
    );
  }, [allCompleted, handleClose]);

  const processIcons = useMemo(() => {
    return votingProcess.map((process, index) => (
      <React.Fragment key={index}>
        <div className="flex justify-center items-center rounded-[8px] bg-white border border-black/10 shadow-[0px_4.4px_9.9px_0px_rgba(0,0,0,0.10)] p-[6px]">
          {getStatusIcon(process.credentialId)}
        </div>
        {index < votingProcess.length - 1 &&
          (index % 2 === 0 ? <HiArrowRight /> : <HiPlus />)}
      </React.Fragment>
    ));
  }, [votingProcess, getStatusIcon]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      contentClassName="p-[30px] w-[400px] flex flex-col items-center"
      keepMounted
    >
      <div className="w-full">
        <div>
          <div className="flex flex-wrap justify-center">
            {confirmationText}
          </div>
          <p className="text-[13px] leading-[26px] text-center opacity-60 font-[500] mt-[10px]">
            You voted for
          </p>
          <p className="uppercase text-[16px] text-black font-[700] leading-[1.4] text-center">
            {option_description || ''}
          </p>
        </div>

        <div className="w-full mt-[30px]">
          <div className="flex justify-center items-center gap-[7px]">
            {processIcons}
          </div>

          <div className="w-full mt-[20px]">{confirmedVotePrompt}</div>
        </div>

        {confirmedButton}
      </div>
    </Modal>
  );
};

ConfirmationPopup.displayName = 'ConfirmationPopup';

export default ConfirmationPopup;
