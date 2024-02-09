import { createContext, ReactNode, useState, useContext, useEffect } from 'react';
import { SemaphoreIdentityPCDPackage } from "@pcd/semaphore-identity-pcd";
import { useZupassPopupMessages } from '@pcd/passport-interface/src/PassportPopup';
import { EdDSATicketFieldsToReveal } from '@pcd/zk-eddsa-event-ticket-pcd';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/router';
import {
  ZKEdDSAEventTicketPCDPackage,
  ZKEdDSAEventTicketPCDArgs,
} from "@pcd/zk-eddsa-event-ticket-pcd";
import { SemaphoreGroupPCDPackage } from "@pcd/semaphore-group-pcd";
import { generateSnarkMessageHash } from "@pcd/util";
import { verifyProof } from '../controllers/auth.controller';
import { useZuAuth, supportedEvents } from 'zuauth';
import { ArgumentTypeName } from "@pcd/pcd-types";
import { EdDSATicketPCDPackage } from "@pcd/eddsa-ticket-pcd";
import { ArgsOf, PCDPackage } from "@pcd/pcd-types";

type UserPassportContextData = {
  signIn: () => void;
  isAuthenticated: boolean;
  isPassportConnected: boolean;
  signOut: () => void;
  verifyticket: () => void;
  pcd: string | null;
  devconnectVerify: () => void;
};
type InputParams = {
  sso: string;
  sig: string;
  nonce: string;
  return_sso_url: string;
}
enum PCDRequestType {
  Get = "Get",
  GetWithoutProving = "GetWithoutProving",
  Add = "Add",
  ProveAndAdd = "ProveAndAdd"
}
type UserPassportProviderProps = {
  children: ReactNode;
};
interface ProveOptions {
  genericProveScreen?: boolean;
  title?: string;
  description?: string;
  debug?: boolean;
  proveOnServer?: boolean;
  signIn?: boolean;
}
interface PCDRequest {
  returnUrl: string;
  type: PCDRequestType;
}
interface PCDGetRequest<T extends PCDPackage = PCDPackage>
  extends PCDRequest {
  type: PCDRequestType.Get;
  pcdType: T["name"];
  args: ArgsOf<T>;
  options?: ProveOptions;
}

// export const UserPassportContext = createContext({} as UserPassportContextData);
export const UserPassportContext = createContext<UserPassportContextData>({
  signIn: () => { },
  isAuthenticated: false,
  isPassportConnected: false,
  signOut: () => { },
  verifyticket: () => { },
  devconnectVerify: () => { },
  pcd: null,
});
const PCD_STORAGE_KEY = 'userPCD';

export function UserPassportContextProvider({ children }: UserPassportProviderProps) {
  const router = useRouter();
  const { authenticate } = useZuAuth();

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [pcdStr] = useZupassPopupMessages();
  const [pcd, setPcd] = useState<string | null>(null);
  //const [eventpcd, setEventPcd] = useState<string | null>(null);
  //const [mode, setMode] = useState<'ticket|sign-in'>('sign-in');
  const [mode, setMode] = useState<'ticket' | 'sign-in' | 'devconnect'>('sign-in');
  const processPcd = (pcdStr: string) => {
    console.log(pcdStr);
    const pcd = JSON.parse(pcdStr);
    const _pcd = JSON.parse(pcd.pcd);
    return _pcd;
  };
  useEffect(() => {
    const func = async () => {
      if (!pcdStr) return;
      if (pcdStr && mode === 'ticket') {
        try {
          let _pcd = processPcd(pcdStr);
          console.log(_pcd, 'event pcd');
          localStorage.setItem('event Id', _pcd.claim.partialTicket.eventId);
        }
        catch (error) {
          console.error('Error processing PCD string:', error);
        }
      }
      else if (pcdStr && mode === 'devconnect') {
        try {
          let _pcd = processPcd(pcdStr);
          console.log(_pcd, 'devconnect event pcd');
          localStorage.setItem('devconnectNullifier', _pcd.claim.nullifierHash);
        }
        catch (error) {
          console.error('Error processing devconnect PCD string:', error);
        }
      }
      else if (pcdStr && mode === 'sign-in') {
        try {
          let _pcd = processPcd(pcdStr);
          await verifyProof(_pcd);
          const userId = _pcd.claim.nullifierHash; // Extract the unique identifier 'id'
          console.log(userId, _pcd);
          console.log(pcdStr);
          //const eventId = eventpcd.claim.partialTicket.eventId;
          //console.log(eventId, 'event Id');
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

  function openZupassPopup(popupUrl: string, proofUrl: string) {
    const url = `${popupUrl}?proofUrl=${encodeURIComponent(proofUrl)}`;
    const popup = window.open(url, "_blank", "width=450,height=600,top=100,popup");
    if (popup) {
      const checkPopupClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopupClosed);
          const event = new Event('popupClosed');
          window.dispatchEvent(event);
        }
      }, 1000);
    } else {
      console.error("Popup was blocked by the browser");
      toast({
        title: 'Error',
        description: 'Popup was blocked by the browser',
        variant: 'destructive',
      });
    }
  }

  function openZupassTicketPopup(popupUrl: string, proofUrl: string) {
    const url = `${popupUrl}?proofUrl=${encodeURIComponent(proofUrl)}`;
    const popup = window.open(url, "_blank", "width=450,height=600,top=100,popup");
    if (popup) {
      const checkPopupClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopupClosed);
          const event = new Event('ticketpopupClosed');
          window.dispatchEvent(event);
        }
      }, 1000);
    } else {
      console.error("Popup was blocked by the browser");
      toast({
        title: 'Error',
        description: 'Popup was blocked by the browser',
        variant: 'destructive',
      });
    }
  }

  function constructZupassPcdGetRequestUrl<T extends PCDPackage>(
    zupassClientUrl: string,
    returnUrl: string,
    pcdType: T["name"],
    args: ArgsOf<T>,
    options?: ProveOptions
  ) {
    const req: PCDGetRequest<T> = {
      type: PCDRequestType.Get,
      returnUrl: returnUrl,
      args: args,
      pcdType,
      options
    };
    const encReq = encodeURIComponent(JSON.stringify(req));
    return `${zupassClientUrl}#/prove?request=${encReq}`;
  }

  function openZKEdDSAEventTicketPopup(
    fieldsToReveal: EdDSATicketFieldsToReveal,
    watermark: bigint,
    validEventIds: string[],
    validProductIds: string[]
  ) {
    const args: ZKEdDSAEventTicketPCDArgs = {
      ticket: {
        argumentType: ArgumentTypeName.PCD,
        pcdType: EdDSATicketPCDPackage.name,
        value: undefined,
        userProvided: true,
        validatorParams: {
          eventIds: validEventIds,
          productIds: validProductIds,
          notFoundMessage: "No eligible PCDs found"
        }
      },
      identity: {
        argumentType: ArgumentTypeName.PCD,
        pcdType: SemaphoreIdentityPCDPackage.name,
        value: undefined,
        userProvided: true
      },
      validEventIds: {
        argumentType: ArgumentTypeName.StringArray,
        value: validEventIds.length != 0 ? validEventIds : undefined,
        userProvided: false
      },
      fieldsToReveal: {
        argumentType: ArgumentTypeName.ToggleList,
        value: fieldsToReveal,
        userProvided: false
      },
      watermark: {
        argumentType: ArgumentTypeName.BigInt,
        value: watermark.toString(),
        userProvided: false
      },
      externalNullifier: {
        argumentType: ArgumentTypeName.BigInt,
        value: watermark.toString(),
        userProvided: false
      }
    };

    const popupUrl = window.location.origin + "/popup";

    const proofUrl = constructZupassPcdGetRequestUrl<
      typeof ZKEdDSAEventTicketPCDPackage
    >('https://zupass.org', popupUrl, ZKEdDSAEventTicketPCDPackage.name, args, {
      genericProveScreen: true,
      title: "Sign-In with Zupass",
      description: "**Select a valid ticket to hop into the zuzaverse.**"
    });

    openZupassTicketPopup(popupUrl, proofUrl);
  }
  function openGroupMembershipPopup(
    urlToZupassClient: string,
    popupUrl: string,
    urlToSemaphoreGroup: string,
    originalSiteName: string,
    signal?: string,
    externalNullifier?: string,
    returnUrl?: string
  ) {
    const proofUrl = constructZupassPcdGetRequestUrl<
      typeof SemaphoreGroupPCDPackage
    >(
      urlToZupassClient,
      returnUrl || popupUrl,
      SemaphoreGroupPCDPackage.name,
      {
        externalNullifier: {
          argumentType: ArgumentTypeName.BigInt,
          userProvided: false,
          value:
            externalNullifier ??
            generateSnarkMessageHash(originalSiteName).toString(),
        },
        group: {
          argumentType: ArgumentTypeName.Object,
          userProvided: false,
          remoteUrl: urlToSemaphoreGroup,
        },
        identity: {
          argumentType: ArgumentTypeName.PCD,
          pcdType: SemaphoreGroupPCDPackage.name,
          value: undefined,
          userProvided: true,
        },
        signal: {
          argumentType: ArgumentTypeName.BigInt,
          userProvided: false,
          value: signal ?? "1",
        },
      },
      {
        title: "Anon Voting Auth",
        description: originalSiteName,
      }
    );

    if (returnUrl) {
      window.location.href = proofUrl;
    } else {
      openZupassPopup(popupUrl, proofUrl);
    }
  }
  const generateTimestamp = () => {
    const now = new Date();
    return Math.floor(now.getTime() / 1000);
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
    console.log('signIn start');
    return new Promise<void>((resolve, reject) => {
      openGroupMembershipPopup(
        'https://zupass.org/',
        window.location.origin + '/popup',
        'https://api.zupass.org/semaphore/1',
        'carbonvote',
        undefined,
        undefined
      );
      console.log('signIn end');
      const onPopupClosed = () => {
        console.log('PopupClosed event triggered');
        window.removeEventListener('popupClosed', onPopupClosed);
        resolve();
      };
      window.addEventListener('popupClosed', onPopupClosed);
    });

  };
  const verifyticket = () => {
    console.log('verify start');
    return new Promise((resolve, reject) => {
      setMode('ticket');
      const bigIntNonce = '0x' + generateTimestamp().toString();
      openZKEdDSAEventTicketPopup(
        {
          revealAttendeeEmail: true,
          revealEventId: true,
          revealProductId: true,
          revealAttendeeSemaphoreId: true
        },
        BigInt(bigIntNonce),
        supportedEvents,
        []
      );
      window.addEventListener('ticketpopupClosed', () => {
        if (localStorage.getItem('event Id')) {
          resolve('success');
        } else {
          reject(new Error("Verification failed"));
        }
      });
    })
  };

  const devconnectVerify = () => {

    setMode('devconnect');
    console.log('devconnect verify start');
    return new Promise<void>((resolve, reject) => {
      openGroupMembershipPopup(
        'https://zupass.org/',
        window.location.origin + '/popup',
        'https://api.zupass.org/semaphore/6',
        'carbonvote',
        undefined,
        undefined
      );
      const onPopupClosed = () => {
        console.log('PopupClosed event triggered');
        window.removeEventListener('popupClosed', onPopupClosed);
        resolve();
      };
      window.addEventListener('popupClosed', onPopupClosed);
    });

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
        verifyticket,
        devconnectVerify,
        pcd,
        isPassportConnected: isAuthenticated,
      }}
    >
      {children}
    </UserPassportContext.Provider>
  );
}

export const useUserPassportContext = () => useContext(UserPassportContext);