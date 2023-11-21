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

import { EdDSATicketPCDPackage } from "@pcd/eddsa-ticket-pcd";
import { EdDSAPCDPackage } from "@pcd/eddsa-pcd";
import { openGroupMembershipPopup } from "../src/util";

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

  console.log(pcdStr, "pcd string");

  //zupoll.org?config={"groupId":"1","groupUrl":"https://api.zupass.org/semaphore/1","name":"ZUZALU_PARTICIPANT","passportAppUrl":"https://zupass.org/","passportServerUrl":"https://api.zupass.org/"}
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
