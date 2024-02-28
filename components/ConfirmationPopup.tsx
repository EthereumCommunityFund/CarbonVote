import React, { useState, useEffect } from 'react';
import styles from "@/styles/confirmationPopup.module.css"
import { HiArrowRight, HiCheck, HiPlus } from 'react-icons/hi';

const ConfirmationPopup: React.FC = () => {
    const [stepsConfirmed, setStepsConfirmed] = useState<number>(0);

    useEffect(() => {
        const confirmStep = async (step: number) => {
            await new Promise(resolve => setTimeout(resolve, 3000)); // Each confirmation takes 4 seconds
            setStepsConfirmed(prevSteps => prevSteps + 1);
        };

        if (stepsConfirmed < 5) {
            confirmStep(stepsConfirmed + 1);
        }
    }, [stepsConfirmed]);

    const getStatusIcon = (step: number) => {
        if (stepsConfirmed >= step) {
            return <img src='/images/check.svg' />; // Display checkmark when step is confirmed
        } else {
            return <img src={`/images/logo${step}.png`} alt={`Logo ${step}`} />; // Display logo for the step
        }
    };

    const getConfirmationText = () => {
        if (stepsConfirmed === 1) {
            return (
                <div className={styles.choice_option}>
                    <img src='/images/eth_logo.svg' />
                    <span>Ether Holding: on-Chain</span>
                </div>
            );
        } else if (stepsConfirmed === 2) {
            return (
                <div className={styles.choice_option}>
                    <img src='/images/zupass.svg' />
                    <span>Zupass</span>
                </div>
            );
        } else if (stepsConfirmed === 3) {
            return (
                <div className={styles.choice_option_flex}>
                    <div className={styles.choice_option}>
                        <img src='/images/poaps.svg' alt="POAPs" />
                        <span>POAPs</span>
                    </div>
                    <span>+</span>
                    <div className={styles.choice_option}>
                        <img src='/images/guild.png' alt="Guild" />
                        <span>Guild</span>
                    </div>
                    <span>+</span>
                    <div className={styles.choice_option}>
                        <img src='/images/gitcoin.svg' alt="Gitcoin Passport" />
                        <span>Gitcoin Passport</span>
                    </div>
                </div>
            );
        } else if (stepsConfirmed === 4) {
            return (
                <div className={styles.choice_option_flex}>
                    <div className={styles.choice_option}>
                        <img src='/images/poaps.svg' alt="POAPs" />
                        <span>POAPs</span>
                    </div>
                    <span>+</span>
                    <div className={styles.choice_option}>
                        <img src='/images/guild.png' alt="Guild" />
                        <span>Guild</span>
                    </div>
                    <span>+</span>
                    <div className={styles.choice_option}>
                        <img src='/images/gitcoin.svg' alt="Gitcoin Passport" />
                        <span>Gitcoin Passport</span>
                    </div>
                </div>
            );

        } else if (stepsConfirmed === 5) {
            return (
                <div className={styles.choice_option_flex}>
                    <div className={styles.choice_option}>
                        <img src='/images/poaps.svg' alt="POAPs" />
                        <span>POAPs</span>
                    </div>
                    <span>+</span>
                    <div className={styles.choice_option}>
                        <img src='/images/guild.png' alt="Guild" />
                        <span>Guild</span>
                    </div>
                    <span>+</span>
                    <div className={styles.choice_option}>
                        <img src='/images/gitcoin.svg' alt="Gitcoin Passport" />
                        <span>Gitcoin Passport</span>
                    </div>
                </div>
            );
        } else {
            return null;
        }
    };

    const getConfirmedVotePrompt = () => {
        if (stepsConfirmed >= 1 && stepsConfirmed <= 2) {
            return (
                <div className={styles.vote_confirmation_div}>
                    <img src='/images/loader.png' />
                    <span>Verifying vote...</span>
                </div>
            );
        } else if (stepsConfirmed === 3) {
            return (
                <div className={styles.vote_confirmation_div}>
                    <img src='/images/loader.png' />
                    <span>Verifying vote...</span>
                </div>
            );
        } else if (stepsConfirmed === 4) {
            return (
                <div className={styles.vote_confirmation_div}>
                    <img src='/images/loader.png' />
                    <span>Verifying vote...</span>
                </div>
            );
        } else if (stepsConfirmed === 5) {
            return (
                <div className={styles.vote_confirmation_div}>
                    <img src='/images/vote_check.svg' />
                    <span>Your vote is confirmed!</span>
                </div>
            );
        } else {
            return null;
        }
    };

    const getConfirmedButton = () => {
        if (stepsConfirmed >= 1 && stepsConfirmed <= 2) {
            return (
                <button className={styles.vote_btn}><span>Confirming...</span></button>
            );
        } else if (stepsConfirmed === 3) {
            return (
                <button className={styles.vote_btn}><span>Confirming...</span></button>
            );
        } else if (stepsConfirmed === 5) {
            return (
                <button className={styles.vote_btn}><HiCheck /><span>Done</span></button>
            );
        } else {
            return null;
        }
    };

    return (
        <div className={styles.confirmation_popup}>
            {getConfirmationText()}

            <p className={styles.header_p}>You voted for</p>
            <p className={styles.choice}>NO</p>
            <div className={styles.status_img}>
                {getStatusIcon(1)}
                <HiArrowRight />
                {getStatusIcon(2)}
                <HiArrowRight />
                {getStatusIcon(3)}
                <HiPlus />
                {getStatusIcon(4)}
                <HiPlus />
                {getStatusIcon(5)}
            </div>
            {getConfirmedVotePrompt()}
            {getConfirmedButton()}
        </div>
    );
};

export default ConfirmationPopup;
