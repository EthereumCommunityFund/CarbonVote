'use client';
import { JSXElementConstructor, Key, PromiseLikeOfReactNode, ReactElement, ReactNode } from 'react';
import { toast } from '@/components/ui/use-toast';
import {
    VoteRequestData,
    castVote,
} from '@/controllers/poll.controller';
import { useAccount } from 'wagmi';
import { signTypedData } from '@wagmi/core'
import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';
import { CREDENTIALS, CONTRACT_ADDRESS, EIP712_DOMAIN, EIP712_TYPE } from '@/src/constants';
import { generateMessage } from '@/utils/generateMessage';
import VotingContract from '../carbonvote-contracts/deployment/contracts/VoteContract.sol/VotingContract.json';
import styles from '@/styles/poll.module.css';
import { HiArrowRight } from 'react-icons/hi';
import { getImagePathByCredential, isValidUuidV4 } from '@/utils/index';
import * as Dialog from '@radix-ui/react-dialog';

const CastPopUp = ({
    isPopupOpen,
    poll,
    setIsPopupOpen,
    selectedOptionData,
    credentialTable,
    userAvailableCredentialTable,
    setShowConfirmationPopup,
    setVotingProcess,
    isPassportConnected,
    voteTable,
    setVoteTable,
    score
}: any) => {
    const { address: account } = useAccount();
    const contractAbi = VotingContract.abi;

    const canOpenPopup = () => {
        let windowReference = window.open('', '_blank');
        if (
            !windowReference ||
            windowReference.closed ||
            typeof windowReference.closed == 'undefined'
        ) {
            // Pop-up was blocked
            return false;
        }
        windowReference.close();
        return true;
    }

    const handleContractVote = async (pollId: string, optionIndex: number) => {

        const generateSignature = async (message: string) => {
            const response = await fetch('/api/auth/generate_signature', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },

                body: JSON.stringify({ message }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate signature');
            }

            const data = await response.json();
            console.log(data.data.message, 'message');
            console.log(data.data.signed_message, 'signature');
            return data.data.signed_message;
        };

        if (!isPassportConnected) {
            const signature = await generateSignature(account as string);
            const message = account as string;
            if (signature) {
                localStorage.setItem('signature', signature);
                localStorage.setItem('message', message);
            }
        }
        const signature = localStorage.getItem('signature');
        const message = localStorage.getItem('message');
        if (!signature) {
            console.error('No signature found. Please connect your wallet');
            return;
        }
        if (!message) {
            console.error('No message found. Please connect your wallet');
            return;
        }

        try {
            let provider = new ethers.BrowserProvider(window.ethereum as any);
            let signer = await provider.getSigner();
            //let provider = ethers.getDefaultProvider("http://localhost:8545/");
            const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                contractAbi,
                signer
            );
            const pollIndex = Number(pollId);
            const newOptionIndex = Number(optionIndex);
            // console.log(pollIndex, 'pollIndex');
            // console.log(newOptionIndex, 'newOptionIndex');
            // console.log(signature, 'signature');
            // console.log(message, 'message');
            if (!canOpenPopup()) {
                toast({
                    title: 'Error',
                    description:
                        'Please enable pop-ups in your browser settings to proceed with the transaction.',
                    variant: 'destructive',
                });
                setVotingProcess((currentvoting: any[]) =>
                    currentvoting.map((votingcredential) =>
                        votingcredential.credentialId === pollId
                            ? { ...votingcredential, status: 'pop-up disabled' }
                            : votingcredential
                    )
                );
            }
            const transactionResponse = await contract.vote(
                pollIndex,
                newOptionIndex,
                signature,
                message
            );
            await transactionResponse.wait(); // Wait for the transaction to be mined
            console.log('Vote cast successfully');
            setVotingProcess((currentvoting: any[]) =>
                currentvoting.map((votingcredential) =>
                    votingcredential.credentialId === pollId
                        ? { ...votingcredential, status: 'success' }
                        : votingcredential
                )
            );
        } catch (error: any) {
            console.error('Error casting vote:', error);
            setVotingProcess((currentvoting: any[]) =>
                currentvoting.map((votingcredential: { credentialId: string; }) =>
                    votingcredential.credentialId === pollId
                        ? { ...votingcredential, status: 'error' }
                        : votingcredential
                )
            );
        }
    };

    const invokeCastVote = async (vote_credential: string, signature: `0x${string}`) => {
        console.log(
            signature,
            selectedOptionData?.optionId,
            poll?.id,
            account,
            vote_credential,
            'all information'
        );
        if (
            signature &&
            selectedOptionData?.optionId &&
            poll?.id &&
            account &&
            vote_credential
        ) {
            const voteData = {
                poll_id: poll.id,
                option_id: selectedOptionData.optionId,
                voter_identifier: account,
                signature: signature,
                vote_credential: vote_credential,
                ...(vote_credential === CREDENTIALS.GitcoinPassport.id && {
                    gitscore: score,
                }),
            };
            console.log(voteData, 'voteData');
            try {
                const response = await castVote(voteData as VoteRequestData);
                console.log(response, 'response');
                setVotingProcess((currentvoting: any[]) =>
                    currentvoting.map((votingcredential: { credentialId: string; }) =>
                        votingcredential.credentialId === vote_credential
                            ? { ...votingcredential, status: 'success' }
                            : votingcredential
                    )
                );
                //await fetchPollFromApi(id);
            } catch (error) {
                console.error('Error casting vote:', error);
                if (typeof error === 'object' && error !== null && 'status' in error) {
                    const err = error as { status: number; message?: string };
                    if (err.status === 403) {
                        console.error("You don't have permission to cast this vote.");
                        setVotingProcess((currentvoting: any[]) =>
                            currentvoting.map((votingcredential: { credentialId: string; }) =>
                                votingcredential.credentialId === vote_credential
                                    ? { ...votingcredential, status: 'unauthorized' }
                                    : votingcredential
                            )
                        );
                    } else {
                        console.error('An unexpected error occurred.');
                        setVotingProcess((currentvoting: any[]) =>
                            currentvoting.map((votingcredential: { credentialId: string; }) =>
                                votingcredential.credentialId === vote_credential
                                    ? { ...votingcredential, status: 'error' }
                                    : votingcredential
                            )
                        );
                    }
                } else {
                    console.error('An unexpected error occurred.');
                    setVotingProcess((currentvoting: any[]) =>
                        currentvoting.map((votingcredential: { credentialId: string; }) =>
                            votingcredential.credentialId === vote_credential
                                ? { ...votingcredential, status: 'error' }
                                : votingcredential
                        )
                    );
                }
            }
        }
    };

    const handleCastVote = async (
        optionId: string,
        requiredCred: string,
        voterTag: string
    ) => {
        const pollId = poll?.id;
        const voter_identifier = localStorage.getItem(voterTag);
        try {
            const voteData = {
                poll_id: pollId,
                option_id: optionId,
                voter_identifier: voter_identifier,
                vote_credential: requiredCred,
                signature: null,
            };
            console.log(voteData, 'voteData');
            const response = await castVote(voteData as VoteRequestData);
            console.log(response, 'response');
            setVotingProcess((currentvoting: any[]) =>
                currentvoting.map((votingcredential: { credentialId: string; }) =>
                    votingcredential.credentialId === requiredCred
                        ? { ...votingcredential, status: 'success' }
                        : votingcredential
                )
            );
        } catch (error) {
            console.error('Error casting vote:', error);
            setVotingProcess((currentvoting: any[]) =>
                currentvoting.map((votingcredential: { credentialId: string; }) =>
                    votingcredential.credentialId === requiredCred
                        ? { ...votingcredential, status: 'error' }
                        : votingcredential
                )
            );
        }
    };

    const handleCastVoteSigned = async (
        optionId: string,
        credentialId: string
    ) => {
        try {
            const pollId = poll?.id as string;
            const message = await generateMessage(
                pollId,
                optionId,
                account as string
            );

            const signature = await signTypedData({
                types: EIP712_TYPE,
                // @ts-ignore-next-line
                domain: EIP712_DOMAIN,
                primaryType: 'PollVote',
                message
            });

            // TODO: Throw error when user rejects signature
            console.log("🚀 ~ signature:", signature)

            if (signature) {
                await invokeCastVote(credentialId, signature);
                console.log('success');
            } else {
                console.log('cast vote error');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description:
                    "Couldn't cast vote.",
                variant: 'destructive',
            });
            console.error('Error signing vote:', error);
        }
    };

    const handleSelectAllClick = () => {
        const newVoteTable = credentialTable.reduce((acc: string[], cred: { id: string; }) => {
            const isAvailable = userAvailableCredentialTable.some(
                (availableCred: { id: any; }) => availableCred.id === cred.id
            );
            if (isAvailable) {
                acc.push(cred.id);
            }
            return acc;
        }, []);
        setVoteTable(newVoteTable);
    };

    const handleVote = async (
        optionId: string,
        credentialIds: string[],
        optionIndex: number | undefined
    ) => {
        console.log('handle vote', optionId, credentialIds, optionIndex);
        if (!localStorage.getItem('userUniqueId')) {
            const uniqueId = uuidv4();
            localStorage.setItem('userUniqueId', uniqueId);
        }
        if (voteTable.length > 0) {
            console.log(credentialIds, 'vote table');
            for (let credentialId of credentialIds) {
                if (isValidUuidV4(credentialId)) {
                    switch (credentialId) {
                        case CREDENTIALS.ZuConnectResident.id:
                            await handleCastVote(
                                optionId,
                                CREDENTIALS.ZuConnectResident.id,
                                'zuconnectNullifier'
                            );
                            break;
                        case CREDENTIALS.DevConnect.id:
                            await handleCastVote(
                                optionId,
                                CREDENTIALS.DevConnect.id,
                                'devconnectNullifier'
                            );
                            break;
                        case CREDENTIALS.ZuzaluResident.id:
                            await handleCastVote(
                                optionId,
                                CREDENTIALS.ZuzaluResident.id,
                                'zuzaluNullifier'
                            );
                            break;
                        case CREDENTIALS.GitcoinPassport.id:
                        case CREDENTIALS.POAPapi.id:
                        case CREDENTIALS.ProtocolGuildMember.id:
                        case CREDENTIALS.EthSoloStaker.id:
                        case CREDENTIALS.EthHoldingOffchain.id:
                            await handleCastVoteSigned(optionId, credentialId);
                            break;
                    }
                } else {
                    console.log(credentialId, 'credentialId');
                    console.log(optionIndex as number, 'option index');
                    await handleContractVote(credentialId, optionIndex as number);
                }
            }
        } else {
            toast({
                title: 'Error',
                description:
                    'Please make sure you have the credentials to vote for this poll.',
                variant: 'destructive',
            });
            return;
        }
    };

    const handleVotesRadioChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const credentialId = event.target.value;
        console.log(credentialId, 'selected id');
        const isCurrentlyChecked = event.target.checked;
        console.log(isCurrentlyChecked, 'is selected id checked');
        console.log(voteTable, 'vote table');

        setVoteTable((prevVoteTable: string[]) => {
            if (isCurrentlyChecked && !prevVoteTable.includes(credentialId)) {
                return [...prevVoteTable, credentialId];
            } else if (!isCurrentlyChecked) {
                return prevVoteTable.filter((id: string) => id !== credentialId);
            }
            return prevVoteTable;
        });
    };


    return (
        <div style={{ zIndex: 100, }}>
            <Dialog.Root open={isPopupOpen} onOpenChange={setIsPopupOpen} modal={true}>
                <Dialog.Portal>
                    <Dialog.Overlay className={styles.voting_popup_bg}>
                        <Dialog.Content>
                            <Dialog.Title />
                            <Dialog.Description />
                            <Dialog.Close />
                            <div>
                                <div className={styles.voting_popup}>
                                    <h4>Your Available Credentials</h4>
                                    <p className={styles.header_p}>You are selecting</p>
                                    <p className={styles.choice}>
                                        {selectedOptionData
                                            ? selectedOptionData.option_description
                                            : ''}
                                    </p>
                                    <div className={styles.v_pop_content}>
                                        <p>Select the credentials you want to vote with</p>
                                        <div className={styles.v_pop_list}>
                                            {credentialTable && credentialTable.map((credential: { id: string; credential: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | PromiseLikeOfReactNode | null | undefined; }) => {
                                                const credentialDetail =
                                                    userAvailableCredentialTable.find(
                                                        (availCred: { id: Key | null | undefined; }) => availCred.id === credential.id
                                                    );

                                                const currentSelectedOptionName =
                                                    selectedOptionData?.option_description;

                                                const isAvailable =
                                                    credentialDetail &&
                                                    (!credentialDetail.votedOption ||
                                                        credentialDetail.votedOptionName !==
                                                        currentSelectedOptionName);

                                                const imagePath = getImagePathByCredential(
                                                    credential.credential as string
                                                );

                                                return (
                                                    <div
                                                        key={credential.id}
                                                        className={styles.radios_flex_col}
                                                    >
                                                        <label
                                                            className={`${styles.choice_option} ${!isAvailable ? styles.disabled : ''}`}
                                                        >
                                                            <div>
                                                                {imagePath && (
                                                                    <img
                                                                        src={imagePath}
                                                                        alt="Credential"
                                                                        className="image-class-name"
                                                                    />
                                                                )}
                                                                <span>
                                                                    {credential.credential}
                                                                    {credentialDetail &&
                                                                        credentialDetail.votedOptionName &&
                                                                        ` (Voted: ${credentialDetail.votedOptionName})`}
                                                                </span>
                                                            </div>
                                                            {isAvailable ? (
                                                                <input
                                                                    type="checkbox"
                                                                    name="credentials"
                                                                    value={credential?.id}
                                                                    checked={voteTable.includes(credential.id)}
                                                                    onChange={handleVotesRadioChange}
                                                                    className={styles.hidden_radio}
                                                                />
                                                            ) : (
                                                                <div className={styles.unavailableCover} />
                                                            )}
                                                        </label>
                                                        {!isAvailable && (
                                                            <div className={styles.overlay}></div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div
                                            className={styles.select_all}
                                            onClick={handleSelectAllClick}
                                        >
                                            Select All
                                        </div>
                                        <button
                                            className={styles.vote_btn}
                                            onClick={() => {
                                                if (selectedOptionData && voteTable.length > 0) {
                                                    setIsPopupOpen(false);
                                                    setShowConfirmationPopup(true);
                                                    if (selectedOptionData) {
                                                        handleVote(
                                                            selectedOptionData.optionId,
                                                            voteTable,
                                                            selectedOptionData.optionIndex
                                                        );
                                                    }
                                                } else {
                                                    toast({
                                                        title: 'Error',
                                                        description:
                                                            "Please check the credentials card, you haven't choosed any available credential.",
                                                        variant: 'destructive',
                                                    });
                                                }
                                            }}
                                        >
                                            <HiArrowRight />
                                            <span>Vote</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Dialog.Content>
                    </Dialog.Overlay>
                </Dialog.Portal>
            </Dialog.Root >
        </div>

    )
}

export default CastPopUp;