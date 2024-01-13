import { constructZupassPcdGetRequestUrl } from "@pcd/passport-interface/src/PassportInterface";
import { openZupassPopup } from "@pcd/passport-interface/src/PassportPopup";
import { ArgumentTypeName } from "@pcd/pcd-types";
import { SemaphoreGroupPCDPackage } from "@pcd/semaphore-group-pcd";
import { SemaphoreIdentityPCDPackage } from "@pcd/semaphore-identity-pcd";
import { generateSnarkMessageHash } from "@pcd/util";
import { SemaphoreSignaturePCDPackage } from "@pcd/semaphore-signature-pcd";



export function openGroupMembershipPopup(
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


// export function zuzalupopup(
//   zupassClientUrl: string,
//   popupUrl: string,
//   originalSiteName: string
// ) {
//   const proofUrl = constructZupassPcdGetRequestUrl<
//     typeof SemaphoreSignaturePCDPackage
//   >(
//     zupassClientUrl,
//     popupUrl,
//     SemaphoreSignaturePCDPackage.name,
//     {
//       identity: {
//         argumentType: ArgumentTypeName.PCD,
//         pcdType: SemaphoreIdentityPCDPackage.name,
//         value: undefined,
//         userProvided: true
//       },
//       signedMessage: {
//         argumentType: ArgumentTypeName.String
//       }
//     },
//     {
//       title: "Zuzalu Auth",
//       description: originalSiteName,
//       signIn: true
//     }
//   );

//   openZupassPopup(popupUrl, proofUrl);
// }

