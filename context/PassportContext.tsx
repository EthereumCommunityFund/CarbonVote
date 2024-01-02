import { createContext, ReactNode, useState, useContext, useEffect } from 'react';

import { useZupassPopupMessages } from '@pcd/passport-interface/src/PassportPopup';
import { EdDSATicketFieldsToReveal } from '@pcd/zk-eddsa-event-ticket-pcd';
import { useRouter } from 'next/router';

import { openGroupMembershipPopup } from '../src/util';
import { generate_signature, verifyProof } from '../controllers/auth.controller';

import { openSignedZuzaluSignInPopup } from '@pcd/passport-interface';
import { useZuAuth, supportedEvents, supportedProducs } from 'zuauth';

type UserPassportContextData = {
  signIn: () => void;
  isAuthenticated: boolean;
  isPassportConnected: boolean;
  signOut: () => void;
  pcd: string | null;
};

type UserPassportProviderProps = {
  children: ReactNode;
};

// export const UserPassportContext = createContext({} as UserPassportContextData);
export const UserPassportContext = createContext<UserPassportContextData>({
  signIn: () => {},
  isAuthenticated: false,
  isPassportConnected: false,
  signOut: () => {},
  pcd: null,
});
const PCD_STORAGE_KEY = 'userPCD';

export function UserPassportContextProvider({ children }: UserPassportProviderProps) {
  const router = useRouter();
  const { authenticate } = useZuAuth();

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [pcdStr] = useZupassPopupMessages();
  const [pcd, setPcd] = useState<string | null>(null);
  const [mode, setMode] = useState<'ticket|sign-in'>('sign-in');
  const processPcd = (pcdStr) => {
    console.log(pcdStr);
    const pcd = JSON.parse(pcdStr);
    const _pcd = JSON.parse(pcd.pcd);
    console.log(_pcd);
    return _pcd;
  };
  useEffect(() => {
    const func = async () => {
      if (!pcdStr) return;

      if (pcdStr && mode === 'sign-in') {
        try {
          let _pcd = processPcd(pcdStr);
          await verifyProof(_pcd);
          const userId = _pcd.claim.externalNullifier; // Extract the unique identifier 'id'
          console.log(userId, _pcd);
          const generateSignature = async (account: string, message: string) => {
            const response = await fetch('/api/auth/generate_signature', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },

              body: JSON.stringify({ account, message }),
            });

            if (!response.ok) {
              throw new Error('Failed to generate signature');
            }

            const data = await response.json();
            console.log(data.data.message, 'message');
            console.log(data.data.signed_message, 'signature');
            return data.data.signed_message;
          };

          const signature = await generateSignature(userId as string, userId as string);
          const message = userId as string;
          if (signature) {
            localStorage.setItem('signature', signature);
            localStorage.setItem('message', message); // Save the generated signature
            localStorage.setItem('userId', userId);
          }
          setPcd(_pcd);
          setIsAuthenticated(true);
          localStorage.setItem(PCD_STORAGE_KEY, pcdStr);
        } catch (error) {
          console.error('Error processing PCD string:', error);
        }
      } else {
        console.log('cannot proof zupass tickets');
      }
    };
    func();
  }, [pcdStr]);

  useEffect(() => {
    // Check for PCD token in local storage on initial load
    const storedPcd = localStorage.getItem(PCD_STORAGE_KEY);
    if (storedPcd) {
      setPcd(processPcd(storedPcd));
    }
    setIsAuthenticated(!!storedPcd);
  }, []);

  const verifyZupassTicket = () => {
    setMode('ticket');
    const defaultSetOfTicketFieldsToReveal: EdDSATicketFieldsToReveal = {
      revealTicketId: true,
      revealEventId: true,
      revealProductId: true,
      revealTimestampConsumed: true,
      revealTimestampSigned: true,
      revealAttendeeSemaphoreId: true,
      revealIsConsumed: true,
      revealIsRevoked: true,
      revealTicketCategory: false,
      revealAttendeeEmail: true,
      revealAttendeeName: true,
    };

    // fieldsToReveal: EdDSATicketFieldsToReveal,
    // watermark: string | bigint,
    // externalNullifier?: string | bigint,
    // validEventIds: string[] = supportedEvents,
    // validProductIds: string[] = supportedProducs,
    // popupRoute: string = "popup"

    //   ZuConnectResident: [
    //     {
    //         eventId: "91312aa1-5f74-4264-bdeb-f4a3ddb8670c",
    //         productId: "cc9e3650-c29b-4629-b275-6b34fc70b2f9"
    //     },
    //     {
    //         eventId: "54863995-10c4-46e4-9342-75e48b68d307",
    //         productId: "d2123bf9-c027-4851-b52c-d8b73fc3f5af"
    //     },
    //     {
    //         eventId: "797de414-2aec-4ef8-8655-09df7e2b6cc6",
    //         productId: "d3620f38-56a9-4235-bea8-0d1dba6bb623"
    //     },
    //     {
    //         eventId: "a6109324-7ca0-4198-9583-77962d1b9d53",
    //         productId: "a6109324-7ca0-4198-9583-77962d1b9d53"
    //     }
    // ]
    authenticate(
      defaultSetOfTicketFieldsToReveal,
      '1366567502',
      undefined,
      [
        '5de90d09-22db-40ca-b3ae-d934573def8b',
        '5de90d09-22db-40ca-b3ae-d934573def8b',
        '5de90d09-22db-40ca-b3ae-d934573def8b',
        '91312aa1-5f74-4264-bdeb-f4a3ddb8670c',
        '54863995-10c4-46e4-9342-75e48b68d307',
        '797de414-2aec-4ef8-8655-09df7e2b6cc6',
        'a6109324-7ca0-4198-9583-77962d1b9d53',
      ],
      [
        '5ba4cd9e-893c-4a4a-b15b-cf36ceda1938',
        '10016d35-40df-4033-a171-7d661ebaccaa',
        '53b518ed-e427-4a23-bf36-a6e1e2764256',
        'cc9e3650-c29b-4629-b275-6b34fc70b2f9',
        'd2123bf9-c027-4851-b52c-d8b73fc3f5af',
        'd3620f38-56a9-4235-bea8-0d1dba6bb623',
        'a6109324-7ca0-4198-9583-77962d1b9d53',
      ],
      'ticket-popup'
    );
  };

  const signIn = () => {
    // openSignedZuzaluSignInPopup(
    //   "https://zupass.org/",
    //   window.location.origin + "/popup",
    //   // "https://api.zupass.org/semaphore/1",
    //   "consumer-client",
    //   "carbonvote",
    //   undefined,
    //   undefined
    // );
    setMode('sign-in');
    openGroupMembershipPopup('https://zupass.org/', window.location.origin + '/popup', 'https://api.zupass.org/semaphore/1', 'carbonvote', undefined, undefined);
  };

  const signOut = () => {
    // Clear the PCD from local storage and state
    localStorage.removeItem(PCD_STORAGE_KEY);
    setPcd(null);
    // Redirect to home or sign-in page if needed
    router.push('/');
  };

  return (
    <UserPassportContext.Provider
      value={{
        signIn: signIn,
        isAuthenticated,
        signOut,
        pcd,
        isPassportConnected: isAuthenticated,
      }}
    >
      {children}
    </UserPassportContext.Provider>
  );
}

export const useUserPassportContext = () => useContext(UserPassportContext);
