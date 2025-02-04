import "@moonbeam-network/api-augment";
import { blake2AsU8a } from "@polkadot/util-crypto";
import { u8aToHex } from "@polkadot/util";
import type { XcmVersionedXcm } from "@polkadot/types/lookup";

export function decodeXCMGeneric(provider: any, message: any, type: number) {
  let fragments;
  switch (type) {
    case 0:
      // XCM going to the Relay Chain (UMP)
      fragments = decodeMessageIntoFragmentVec(provider, message);
      break;
    case 1:
      // XCM going from the Relay Chain to a Parachain (DMP)
      fragments = decodeMessageIntoFragmentVec(provider, message.msg);
      break;
    case 2:
      // XCM going from a Parachain to another Parachain (HRMP/XCMP)
      // First byte is a format version that creates problem when decoding it as XcmVersionedXcm
      // We remove it

      fragments = decodeMessageIntoFragmentVec(provider, message.data.slice(1));
      break;
    default:
      console.error("Not supporting this particular scenario!");
      break;
  }

  for (let i = 0; i < fragments.length; i++) {
    let instructions = fragments[i];
    console.log(
      `Blake2 hash of fragment ${i + 1} is: ${u8aToHex(blake2AsU8a(instructions.toU8a()))}\n`
    );
    console.log(instructions.toHuman(), "\n");
    if (instructions.isV1) {
      instructions.toHuman().forEach((instruction) => {
        // Print V1 Message
        if (instructions.asV1.isReserveAssetDeposited) {
          console.log("Reserve Asset Deposited:");
        } else if (instructions.isDepositAsset) {
          console.log("Deposit Asset");
        }
        console.log(instruction.toString());
        console.log("\n");
      });
    } else if (instructions.isV2) {
      instructions.asV2.forEach((instruction) => {
        // Print V2 Message
        if (instruction.isReserveAssetDeposited) {
          console.log("Reserve Asset Deposited:");
        } else if (instruction.isDepositAsset) {
          console.log("Deposit Asset:");
        } else if (instruction.isDescendOrigin) {
          console.log("Descend Origin:");
        } else if (instruction.isWithdrawAsset) {
          console.log("Withdraw Asset:");
        } else if (instruction.isBuyExecution) {
          console.log("Buy Execution:");
        } else if (instruction.isTransact) {
          console.log("Transact:");
        }
        console.log(instruction.toString(), "\n");
      });
    } else {
      instructions.asV3.forEach((instruction) => {
        // Print V3 Message
        if (instruction.isReserveAssetDeposited) {
          console.log("Reserve Asset Deposited:");
        } else if (instruction.isDepositAsset) {
          console.log("Deposit Asset:");
        } else if (instruction.isDescendOrigin) {
          console.log("Descend Origin:");
        } else if (instruction.isWithdrawAsset) {
          console.log("Withdraw Asset:");
        } else if (instruction.isBuyExecution) {
          console.log("Buy Execution:");
        } else if (instruction.isTransact) {
          console.log("Transact:");
        } else if (instruction.isSetAppendix) {
          console.log("SetAppendix:");
        }
        console.log(instruction.toString(), "\n");
      });
    }
    console.log("-------------------\n");
  }
}

function decodeMessageIntoFragmentVec(provider: any, message: any): Array<XcmVersionedXcm> {
  let fragments = [];
  let remainingMessage = message;
  while (remainingMessage.length != 0) {
    let fragment: XcmVersionedXcm = provider.createType("XcmVersionedXcm", remainingMessage) as any;
    fragments.push(fragment);
    remainingMessage = remainingMessage.slice(fragment.toU8a().length);
  }
  return fragments;
}
