import {
  createContext,
  ReactNode,
  useState,
  useContext,
  useEffect,
} from "react";

import { useZupassPopupMessages } from "@pcd/passport-interface/src/PassportPopup";

import { useRouter } from "next/router";

import { openGroupMembershipPopup } from "../src/util";
import {
  generate_signature,
  verifyProof,
} from "../controllers/auth.controller";
import { openSignedZuzaluSignInPopup } from "@pcd/passport-interface";

type UserPassportContextData = {
  signIn: () => void;
  isAuthenticated: () => boolean;
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
  isAuthenticated: () => false,
  isPassportConnected: false,
  signOut: () => {},
  pcd: null,
});
const PCD_STORAGE_KEY = "userPCD";

export function UserPassportContextProvider({
  children,
}: UserPassportProviderProps) {
  const router = useRouter();
  const [pcdStr] = useZupassPopupMessages();
  const [pcd, setPcd] = useState<string | null>(null);

  useEffect(() => {
    const func = async () => {
      if (pcdStr) {
        try {
          const pcd = JSON.parse(pcdStr); // Parse the received PCD string
          const _pcd = JSON.parse(pcd.pcd); // Parse the nested PCD object

          const userId = _pcd.claim.externalNullifier; // Extract the unique identifier 'id'

          console.log(userId, _pcd);
          const generateSignature = async (
            account: string,
            message: string
          ) => {
            const response = await fetch("/api/auth/generate_signature", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },

              body: JSON.stringify({ account, message }),
            });

            if (!response.ok) {
              throw new Error("Failed to generate signature");
            }

            const data = await response.json();
            console.log(data.data.message, "message");
            console.log(data.data.signed_message, "signature");
            return data.data.signed_message;
          };
          const signature = await generateSignature(
            userId as string,
            userId as string
          );
          const message = userId as string;
          if (signature) {
            localStorage.setItem("signature", signature);
            localStorage.setItem("message", message); // Save the generated signature
          }
        } catch (error) {
          console.error("Error processing PCD string:", error);
        }
      }
    };
    func();
  }, [pcdStr]);

  useEffect(() => {
    // Check for PCD token in local storage on initial load
    const storedPcd = localStorage.getItem(PCD_STORAGE_KEY);
    if (storedPcd) {
      setPcd(storedPcd);
    }
  }, []);

  useEffect(() => {
    if (pcd) {
      // Store the PCD token in local storage
      localStorage.setItem(PCD_STORAGE_KEY, pcd);
    }
  }, [pcd]);

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
    openGroupMembershipPopup(
      "https://zupass.org/",
      window.location.origin + "/popup",
      "https://api.zupass.org/semaphore/1",
      "carbonvote",
      undefined,
      undefined
    );
  };

  const signOut = () => {
    // Clear the PCD from local storage and state
    localStorage.removeItem(PCD_STORAGE_KEY);
    setPcd(null);
    // Redirect to home or sign-in page if needed
    router.push("/");
  };

  const isAuthenticated = () => {
    // Check if window is defined (i.e., if the code is running on the client side)
    if (typeof window !== "undefined") {
      const pcdToken = localStorage.getItem("userPCD");
      return !!pcdToken;
    }
    return false; // Return false if not running on client side
  };
  const [isPassportConnected, setIsPassportConnected] = useState(false);

  useEffect(() => {
    setIsPassportConnected(isAuthenticated());
  }, [isAuthenticated]);

  useEffect(() => {
    if (pcdStr) {
      try {
        const parsedPcd = JSON.parse(pcdStr);
        console.log(parsedPcd, "parced pcd");

        setPcd(parsedPcd.pcd); // Save the PCD to state
      } catch (error) {
        console.error("Error parsing PCD string:", error);
      }
    }
  }, [pcdStr]);

  return (
    <UserPassportContext.Provider
      value={{ signIn, isAuthenticated, signOut, pcd, isPassportConnected }}
    >
      {children}
    </UserPassportContext.Provider>
  );
}

export const useUserPassportContext = () => useContext(UserPassportContext);
