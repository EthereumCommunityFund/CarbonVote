import {
  createContext,
  ReactNode,
  useState,
  useContext,
  useEffect,
} from "react";

import { useZuAuth, supportedEvents, supportedProducs } from "zuauth";

// ("@pcd/passport-interface");

import { useZupassPopupMessages } from "@pcd/passport-interface/src/PassportPopup";
import { EdDSATicketFieldsToReveal } from "@pcd/zk-eddsa-event-ticket-pcd";
import {
  PASSPORT_SERVER_URL,
  ZUPASS_SERVER_URL,
  ZUPASS_URL,
} from "../src/constants";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import axiosInstance from "../src/axiosInstance";
import { useRouter } from "next/router";

import { SignInMessagePayload } from "@pcd/passport-interface";

import { EdDSATicketPCDPackage } from "@pcd/eddsa-ticket-pcd";
import { EdDSAPCDPackage } from "@pcd/eddsa-pcd";
import { openGroupMembershipPopup } from "../src/util";
import { verifyProof } from "../controllers/auth.controller";
import { fetchAllPolls } from "../controllers/poll.controller";

type UserPassportContextData = {
  signIn: any;
  isAuthenticated: boolean;
  verifyZupassTicket: any;
  // user: User | null
};

type UserPassportProviderProps = {
  children: ReactNode;
};

export const UserPassportContext = createContext({} as UserPassportContextData);

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

export function UserPassportContextProvider({
  children,
}: UserPassportProviderProps) {
  const router = useRouter();

  console.log(supportedEvents, supportedProducs);
  const { authenticate, pcd } = useZuAuth();
  const [ticketFieldsToReveal, setTicketFieldsToReveal] =
    useState<EdDSATicketFieldsToReveal>(defaultSetOfTicketFieldsToReveal);

  console.log(pcd);

  const [pcdStr] = useZupassPopupMessages();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (pcdStr) {
      let pcd = JSON.parse(pcdStr);
      let _pcd = JSON.parse(pcd.pcd);
      let res = verifyProof(_pcd);
    }
  }, [pcdStr]);

  const signIn = () => {
    openGroupMembershipPopup(
      "https://zupass.org/",
      window.location.origin + "/popup",
      "https://api.zupass.org/semaphore/1",
      "carbonvote",
      undefined,
      undefined
    );
    setIsAuthenticated(true);
  };

  // fieldsToReveal: EdDSATicketFieldsToReveal,
  // watermark: string | bigint,
  // externalNullifier?: string | bigint,
  // validEventIds: string[] = supportedEvents,
  // validProductIds: string[] = supportedProducs,
  // popupRoute: string = "popup"
  const verifyZupassTicket = () => {
    authenticate(
      ticketFieldsToReveal,
      "1366567502",
      undefined,
      [
        "5de90d09-22db-40ca-b3ae-d934573def8b",
        "5de90d09-22db-40ca-b3ae-d934573def8b",
        "5de90d09-22db-40ca-b3ae-d934573def8b",
        "91312aa1-5f74-4264-bdeb-f4a3ddb8670c",
        "54863995-10c4-46e4-9342-75e48b68d307",
        "797de414-2aec-4ef8-8655-09df7e2b6cc6",
        "a6109324-7ca0-4198-9583-77962d1b9d53",
      ],
      [
        "5ba4cd9e-893c-4a4a-b15b-cf36ceda1938",
        "10016d35-40df-4033-a171-7d661ebaccaa",
        "53b518ed-e427-4a23-bf36-a6e1e2764256",
        "cc9e3650-c29b-4629-b275-6b34fc70b2f9",
        "d2123bf9-c027-4851-b52c-d8b73fc3f5af",
        "d3620f38-56a9-4235-bea8-0d1dba6bb623",
        "a6109324-7ca0-4198-9583-77962d1b9d53",
      ],
      "ticket-popup"
    );
  };

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

  return (
    <UserPassportContext.Provider
      value={{ signIn, isAuthenticated, verifyZupassTicket }}
    >
      {children}
    </UserPassportContext.Provider>
  );
}

export const useUserPassportContext = () => useContext(UserPassportContext);
