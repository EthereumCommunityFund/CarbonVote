import {
  createContext,
  ReactNode,
  useState,
  useContext,
  useEffect,
} from "react";

// ("@pcd/passport-interface");

import { useZupassPopupMessages } from "@pcd/passport-interface/src/PassportPopup";
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
  // user: User | null
};

type UserPassportProviderProps = {
  children: ReactNode;
};

export const UserPassportContext = createContext({} as UserPassportContextData);

export function UserPassportContextProvider({
  children,
}: UserPassportProviderProps) {
  const router = useRouter();
  const [pcdStr] = useZupassPopupMessages();
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
  };

  return (
    <UserPassportContext.Provider value={{ signIn }}>
      {children}
    </UserPassportContext.Provider>
  );
}

export const useUserPassportContext = () => useContext(UserPassportContext);
