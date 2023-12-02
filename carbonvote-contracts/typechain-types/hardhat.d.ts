/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { ethers } from "ethers";
import {
  DeployContractOptions,
  FactoryOptions,
  HardhatEthersHelpers as HardhatEthersHelpersBase,
} from "@nomicfoundation/hardhat-ethers/types";

import * as Contracts from ".";

declare module "hardhat/types/runtime" {
  interface HardhatEthersHelpers extends HardhatEthersHelpersBase {
    getContractFactory(
      name: "VotingContract",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.VotingContract__factory>;
    getContractFactory(
      name: "VotingOption",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.VotingOption__factory>;

    getContractAt(
      name: "VotingContract",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.VotingContract>;
    getContractAt(
      name: "VotingOption",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.VotingOption>;

    deployContract(
      name: "VotingContract",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.VotingContract>;
    deployContract(
      name: "VotingOption",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.VotingOption>;

    deployContract(
      name: "VotingContract",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.VotingContract>;
    deployContract(
      name: "VotingOption",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.VotingOption>;

    // default types
    getContractFactory(
      name: string,
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<ethers.ContractFactory>;
    getContractFactory(
      abi: any[],
      bytecode: ethers.BytesLike,
      signer?: ethers.Signer
    ): Promise<ethers.ContractFactory>;
    getContractAt(
      nameOrAbi: string | any[],
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<ethers.Contract>;
    deployContract(
      name: string,
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<ethers.Contract>;
    deployContract(
      name: string,
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<ethers.Contract>;
  }
}
