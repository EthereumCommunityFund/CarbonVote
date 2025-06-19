'use client';
import { useEffect, useState, useMemo } from 'react';
import CountdownTimer from '../ui/CountDownTimer';
import Credential from '../ui/Credential';
import { Label } from '../ui/Label';
import { useRouter } from 'next/router';
import styles from 'styles/pollCard.module.css';
import { CredentialTable } from '@/types';
import { CREDENTIALS } from '@/src/constants';
import { priorityPollIds } from '@/utils';
import { getCategoryLabel } from '@/utils/category';

interface IPollCard {
  poll: {
    id: string;
    name?: string;
    title?: string;
    description: string;
    options: string[];
    endTime: number;
    pollType: string;
    pollMetadata: string;
    startTime: number;
    categories?: string[];
    credentials?: {
      id: string;
      credential_name: string;
      credential_detail: string | null;
    }[];
  };
}

interface ICredential {
  id: string;
  credential_detail: string;
  credential_name: string;
}

export const PollCardTemplate = ({ poll }: IPollCard) => {
  const router = useRouter();
  const [credentialTable, setNestedCredentialTable] = useState<
    CredentialTable[]
  >([{ credential: 'Loading...', id: 'loading' }]);
  const [isLoaded, setIsLoaded] = useState(false);

  const formatCredentials = (credentials: any[]) => {
    if (!credentials || credentials.length === 0) {
      return [{ credential: 'No credentials required', id: 'none' }];
    }

    let formattedCredentials: CredentialTable[] = [];
    let isZupass = credentials.some((credential: any) =>
      [
        CREDENTIALS.DevConnect.id,
        CREDENTIALS.ZuConnectResident.id,
        CREDENTIALS.ZuzaluResident.id,
      ].includes(credential.id)
    );

    if (isZupass) {
      formattedCredentials.push({
        credential: 'Zupass',
        id: '635a93d1-4d2c-47d9-82f4-9acd8ff68350',
      });
    }

    const credentialIds = new Set();
    credentials.forEach((cred: any) => {
      if (!credentialIds.has(cred.id)) {
        credentialIds.add(cred.id);

        Object.values(CREDENTIALS).forEach((credential) => {
          if (cred.id === credential.id) {
            formattedCredentials.push({
              credential: credential.name,
              id: cred.id,
            });
          }
        });
      }
    });

    return formattedCredentials.filter(
      (credential: any) =>
        ![
          CREDENTIALS.DevConnect.id,
          CREDENTIALS.ZuConnectResident.id,
          CREDENTIALS.ZuzaluResident.id,
        ].includes(credential.id)
    );
  };

  useEffect(() => {
    if (poll?.credentials) {
      const formattedCredentials = formatCredentials(poll.credentials);
      setNestedCredentialTable(formattedCredentials);
      setIsLoaded(true);
    } else {
      setNestedCredentialTable([
        { credential: 'No credentials required', id: 'none' },
      ]);
      setIsLoaded(true);
    }
  }, [poll]);

  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const checkIfLive = () => {
      const now = new Date();
      const endDate = new Date(poll.endTime);
      setIsLive(endDate > now);
    };

    checkIfLive();
    const interval = setInterval(checkIfLive, 60000);
    return () => clearInterval(interval);
  }, [poll.endTime]);

  const handleClickItem = () => {
    router.push({
      pathname: '/poll',
      query: { id: poll.id },
    });
  };

  const categoriesComponent = useMemo(() => {
    if (!poll.categories || poll.categories.length === 0) return null;

    return (
      <div className="flex flex-wrap mt-[15px]">
        <span className="font-inter font-medium italic text-[14px] leading-[120%] text-center text-black/50 flex flex-wrap items-center">
          {poll.categories.map((category, index) => (
            <span key={index}>
              #{getCategoryLabel(category)}
              {index < (poll.categories?.length ?? 0) - 1 && (
                <span>,&nbsp;</span>
              )}
            </span>
          ))}
        </span>
      </div>
    );
  }, [poll.categories]);

  const credentialComponent = useMemo(() => {
    return (
      <Credential
        credentials={credentialTable
          .map((item: CredentialTable) => item.credential)
          .filter((credential): credential is string => !!credential)}
      />
    );
  }, [credentialTable]);

  function removeImageTags(text: string) {
    const regex = /<img[^>]*>/g;
    return text?.replace(regex, '');
  }
  const cleanDescription = removeImageTags(poll.description ?? '');

  const shortDescription =
    cleanDescription?.length > 200
      ? cleanDescription.substring(0, 200) + '...'
      : cleanDescription;

  const title = poll.name || poll.title || '';

  return (
    <div
      id={`poll-card-${poll.id}`}
      className={`${styles.poll_card} w-full`}
      onClick={handleClickItem}
    >
      <div className={styles.status_countdown_flex}>
        <div
          className={`${isLive ? 'bg-[#f84a4a33]' : 'bg-[#0000000d]'} bg-opacity-20 px-2.5 py-1 rounded-lg`}
        >
          <Label className={`${isLive ? 'text-[#F84A4A]' : 'text-[#000000]'}`}>
            {isLive ? 'Live' : 'Closed'}
          </Label>
        </div>
        {/* <!-- Time Remaining (Shown only if Live) --> */}
        {isLive && (
          <div className={styles.countdown}>
            <img src="/images/clock.svg" className={styles.countdown_icon} />
            <CountdownTimer endTime={poll.endTime} />
          </div>
        )}
        {priorityPollIds.includes(poll.id) && (
          <div className={styles.pin_container}>
            <span className="text-[#F84A4A]">📌</span>
          </div>
        )}
      </div>

      {/* <!-- Title --> */}
      <div className="flex flex-col mt-[15px]">
        <Label className="text-xl font-bold">{title}</Label>
      </div>

      {/* Categories */}
      {categoriesComponent}

      {/* Credentials */}
      <div className="mt-[15px]">{credentialComponent}</div>
    </div>
  );
};
