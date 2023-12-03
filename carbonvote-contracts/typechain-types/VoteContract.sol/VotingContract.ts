/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "../common";

export interface VotingContractInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "createPoll"
      | "getAllPolls"
      | "getMessageHash"
      | "getPoll"
      | "polls"
      | "recordVote"
      | "verifyAndRecordVote"
      | "verifyServerSignature"
      | "vote"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic: "VoteCasted" | "VoteChanged" | "VoteRemoved"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "createPoll",
    values: [string, string, BigNumberish, string[], BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "getAllPolls",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getMessageHash",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "getPoll",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "polls", values: [BigNumberish]): string;
  encodeFunctionData(
    functionFragment: "recordVote",
    values: [AddressLike, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "verifyAndRecordVote",
    values: [AddressLike, BigNumberish, BigNumberish, BytesLike, string]
  ): string;
  encodeFunctionData(
    functionFragment: "verifyServerSignature",
    values: [string, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "vote",
    values: [BigNumberish, BigNumberish, BytesLike, string]
  ): string;

  decodeFunctionResult(functionFragment: "createPoll", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getAllPolls",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getMessageHash",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getPoll", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "polls", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "recordVote", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "verifyAndRecordVote",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "verifyServerSignature",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "vote", data: BytesLike): Result;
}

export namespace VoteCastedEvent {
  export type InputTuple = [
    voter: AddressLike,
    pollIndex: BigNumberish,
    optionIndex: BigNumberish
  ];
  export type OutputTuple = [
    voter: string,
    pollIndex: bigint,
    optionIndex: bigint
  ];
  export interface OutputObject {
    voter: string;
    pollIndex: bigint;
    optionIndex: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace VoteChangedEvent {
  export type InputTuple = [
    voter: AddressLike,
    pollIndex: BigNumberish,
    optionIndex: BigNumberish
  ];
  export type OutputTuple = [
    voter: string,
    pollIndex: bigint,
    optionIndex: bigint
  ];
  export interface OutputObject {
    voter: string;
    pollIndex: bigint;
    optionIndex: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace VoteRemovedEvent {
  export type InputTuple = [
    voter: AddressLike,
    pollIndex: BigNumberish,
    optionIndex: BigNumberish
  ];
  export type OutputTuple = [
    voter: string,
    pollIndex: bigint,
    optionIndex: bigint
  ];
  export interface OutputObject {
    voter: string;
    pollIndex: bigint;
    optionIndex: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface VotingContract extends BaseContract {
  connect(runner?: ContractRunner | null): VotingContract;
  waitForDeployment(): Promise<this>;

  interface: VotingContractInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  createPoll: TypedContractMethod<
    [
      _name: string,
      _description: string,
      _duration: BigNumberish,
      _optionNames: string[],
      _pollType: BigNumberish,
      _poll_metadata: string
    ],
    [void],
    "nonpayable"
  >;

  getAllPolls: TypedContractMethod<
    [],
    [
      [string[], string[], string[][], bigint[], bigint[], string[]] & {
        names: string[];
        descriptions: string[];
        options: string[][];
        endTimes: bigint[];
        pollTypes: bigint[];
        pollMetadatas: string[];
      }
    ],
    "view"
  >;

  getMessageHash: TypedContractMethod<[_message: string], [string], "view">;

  getPoll: TypedContractMethod<
    [_pollIndex: BigNumberish],
    [
      [string, string, string[], bigint, bigint, string] & {
        name: string;
        description: string;
        options: string[];
        endTime: bigint;
        pollType: bigint;
        pollMetadata: string;
      }
    ],
    "view"
  >;

  polls: TypedContractMethod<
    [arg0: BigNumberish],
    [
      [string, string, bigint, bigint, string] & {
        description: string;
        name: string;
        endTime: bigint;
        poll_type: bigint;
        poll_metadata: string;
      }
    ],
    "view"
  >;

  recordVote: TypedContractMethod<
    [voter: AddressLike, _pollIndex: BigNumberish, _optionIndex: BigNumberish],
    [void],
    "nonpayable"
  >;

  verifyAndRecordVote: TypedContractMethod<
    [
      voter: AddressLike,
      _pollIndex: BigNumberish,
      _optionIndex: BigNumberish,
      signature: BytesLike,
      message: string
    ],
    [void],
    "nonpayable"
  >;

  verifyServerSignature: TypedContractMethod<
    [message: string, signature: BytesLike],
    [[boolean, string]],
    "view"
  >;

  vote: TypedContractMethod<
    [
      _pollIndex: BigNumberish,
      _optionIndex: BigNumberish,
      signature: BytesLike,
      message: string
    ],
    [void],
    "nonpayable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "createPoll"
  ): TypedContractMethod<
    [
      _name: string,
      _description: string,
      _duration: BigNumberish,
      _optionNames: string[],
      _pollType: BigNumberish,
      _poll_metadata: string
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "getAllPolls"
  ): TypedContractMethod<
    [],
    [
      [string[], string[], string[][], bigint[], bigint[], string[]] & {
        names: string[];
        descriptions: string[];
        options: string[][];
        endTimes: bigint[];
        pollTypes: bigint[];
        pollMetadatas: string[];
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "getMessageHash"
  ): TypedContractMethod<[_message: string], [string], "view">;
  getFunction(
    nameOrSignature: "getPoll"
  ): TypedContractMethod<
    [_pollIndex: BigNumberish],
    [
      [string, string, string[], bigint, bigint, string] & {
        name: string;
        description: string;
        options: string[];
        endTime: bigint;
        pollType: bigint;
        pollMetadata: string;
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "polls"
  ): TypedContractMethod<
    [arg0: BigNumberish],
    [
      [string, string, bigint, bigint, string] & {
        description: string;
        name: string;
        endTime: bigint;
        poll_type: bigint;
        poll_metadata: string;
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "recordVote"
  ): TypedContractMethod<
    [voter: AddressLike, _pollIndex: BigNumberish, _optionIndex: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "verifyAndRecordVote"
  ): TypedContractMethod<
    [
      voter: AddressLike,
      _pollIndex: BigNumberish,
      _optionIndex: BigNumberish,
      signature: BytesLike,
      message: string
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "verifyServerSignature"
  ): TypedContractMethod<
    [message: string, signature: BytesLike],
    [[boolean, string]],
    "view"
  >;
  getFunction(
    nameOrSignature: "vote"
  ): TypedContractMethod<
    [
      _pollIndex: BigNumberish,
      _optionIndex: BigNumberish,
      signature: BytesLike,
      message: string
    ],
    [void],
    "nonpayable"
  >;

  getEvent(
    key: "VoteCasted"
  ): TypedContractEvent<
    VoteCastedEvent.InputTuple,
    VoteCastedEvent.OutputTuple,
    VoteCastedEvent.OutputObject
  >;
  getEvent(
    key: "VoteChanged"
  ): TypedContractEvent<
    VoteChangedEvent.InputTuple,
    VoteChangedEvent.OutputTuple,
    VoteChangedEvent.OutputObject
  >;
  getEvent(
    key: "VoteRemoved"
  ): TypedContractEvent<
    VoteRemovedEvent.InputTuple,
    VoteRemovedEvent.OutputTuple,
    VoteRemovedEvent.OutputObject
  >;

  filters: {
    "VoteCasted(address,uint256,uint256)": TypedContractEvent<
      VoteCastedEvent.InputTuple,
      VoteCastedEvent.OutputTuple,
      VoteCastedEvent.OutputObject
    >;
    VoteCasted: TypedContractEvent<
      VoteCastedEvent.InputTuple,
      VoteCastedEvent.OutputTuple,
      VoteCastedEvent.OutputObject
    >;

    "VoteChanged(address,uint256,uint256)": TypedContractEvent<
      VoteChangedEvent.InputTuple,
      VoteChangedEvent.OutputTuple,
      VoteChangedEvent.OutputObject
    >;
    VoteChanged: TypedContractEvent<
      VoteChangedEvent.InputTuple,
      VoteChangedEvent.OutputTuple,
      VoteChangedEvent.OutputObject
    >;

    "VoteRemoved(address,uint256,uint256)": TypedContractEvent<
      VoteRemovedEvent.InputTuple,
      VoteRemovedEvent.OutputTuple,
      VoteRemovedEvent.OutputObject
    >;
    VoteRemoved: TypedContractEvent<
      VoteRemovedEvent.InputTuple,
      VoteRemovedEvent.OutputTuple,
      VoteRemovedEvent.OutputObject
    >;
  };
}