import React, { useState, useEffect } from 'react';
import styles from "@/styles/confirmationPopup.module.css"
import { HiArrowRight, HiCheck, HiPlus } from 'react-icons/hi';
import { CREDENTIALS } from '@/src/constants';
interface VotingProcess {
    credentialId: string;
    status: string;
    contractpoll?: string;
}

interface ConfirmationPopupProps {
    votingProcess: VotingProcess[];
    onClose: () => void;
    option_description: string;
  }

  function getCredentialDetails(credential: VotingProcess): { imgSrc: string, text: string } {
    if (credential.contractpoll && credential.contractpoll.includes('ProtocolGuild on-chain') ||
        credential.credentialId === CREDENTIALS.ProtocolGuildMember.id) {
        return { imgSrc: '/images/guild.png', text: 'Protocol Guild Membership' };
    }
    if (credential.contractpoll && credential.contractpoll.includes('EthHolding on-chain') ||
        credential.credentialId === CREDENTIALS.EthHoldingOffchain.id) {
        return { imgSrc: '/images/eth_logo.svg', text: 'Eth Holding' };
    }
    if (credential.credentialId === CREDENTIALS.ZuConnectResident.id ||
        credential.credentialId === CREDENTIALS.DevConnect.id ||
        credential.credentialId === CREDENTIALS.ZuzaluResident.id) {
        return { imgSrc: '/images/zupass.svg', text: 'Zupass' };
    }
    if (credential.credentialId === CREDENTIALS.GitcoinPassport.id) {
        return { imgSrc: '/images/gitcoin.svg', text: 'Gitcoin Passport' };
    }
    if (credential.credentialId === CREDENTIALS.POAPapi.id) {
        return { imgSrc: '/images/poaps.svg', text: 'POAPs' };
    }
    if (credential.credentialId === CREDENTIALS.EthSoloStaker.id) {
        return { imgSrc: '/images/solo_staker.svg', text: 'Solo Staker' };
    }
    return { imgSrc: '', text: '' };
};


const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({ votingProcess, onClose, option_description}) => {
    
    const getStatusIcon = (credentialId: string) => {
        const process = votingProcess.find(voting => voting.credentialId === credentialId);
        if (process?.status === 'success') {
            return <img src='/images/check.svg' alt="Success" />;
        } else if (process?.status === 'error') {
            return <img src='/images/info_circle.svg' alt="Error" />;
        } else {
            return process ? <img src={getCredentialDetails(process).imgSrc} alt="Credential" /> : null;
        }
    };

    const getConfirmationText = () => {
        return votingProcess.map((process, index) => {
          if (process.status !== 'success') {
            const { imgSrc: imagePath, text } = getCredentialDetails(process);
            return (
              <div key={index} className={styles.choice_option_flex}>
                <div className={styles.choice_option}>
                  <img src={imagePath} alt={text} />
                  <span>{text}</span>
                </div>
                {index < votingProcess.length - 1 ? <span>+</span> : null}
              </div>
            );
          }
          return null; 
        }).filter(component => component !== null); 
      };

    const getConfirmedVotePrompt = () => {
        const allConfirmed = votingProcess.every(vote => vote.status === 'success');
        if (!allConfirmed) {
            return (
            <div className={styles.vote_confirmation_div}>
                 <img src='/images/loader.png' alt="Loading" className="loader" />
                <span>Verifying vote...</span>
            </div>
            );
        } else {
            return (
            <div className={styles.vote_confirmation_div}>
                <img src='/images/vote_check.svg' alt="Vote Confirmed" />
                <span>Your vote is confirmed!</span>
            </div>
            );
        }
    };

    const getConfirmedButton = () => {
    const allConfirmed = votingProcess.every(vote => vote.status !== 'pending');
    if (!allConfirmed) {
        return <button className={styles.vote_btn}><span>Confirming...</span></button>;
    } else {
        return <button className={styles.vote_btn} onClick={onClose}><HiCheck /><span>Done</span></button>;
    }
    };

    return (
        <div className={styles.confirmation_popup}>
            {getConfirmationText()}
    
            <p className={styles.header_p}>You voted for</p>
            <p className={styles.choice}>{option_description}</p>
            <div className={styles.status_img}>
                {votingProcess.map((process, index) => (
                    <React.Fragment key={index}>
                        {getStatusIcon(process.credentialId)}
                        {index < votingProcess.length - 1 && (index % 2 === 0 ? <HiArrowRight /> : <HiPlus />)}
                    </React.Fragment>
                ))}
            </div>
            {getConfirmedVotePrompt()}
            {getConfirmedButton()}
        </div>
    );
};

export default ConfirmationPopup;