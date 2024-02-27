export type OptionType = {
  name: string;
  color: string;
}

export interface PollStatusType {
  closed: boolean;
  remainingTime?: RemainingTime;
}

export interface RemainingTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export type CredentialType = {
  id: string;
  credential_name: string;
  credential_detail: string;
  credential_type: string;
}

export type PollOptionType = {
  id: string;
  option_description: string;
  pollId: string;
  totalWeight: number;
  votes: number;
}

export type PollType = {
  id: string;
  created_at: string;
  credentials: CredentialType[];
  description: string;
  options: OptionType[];
  time_limit: number;
  title: string;
  voting_method: string;
}

export type Event = {
  id: number
  fancy_id: string
  name: string
  description: string
  location_type: string
  city: string
  country: string
  channel: string
  platform: string
  event_url: string
  image_url: string
  animation_url: string
  year: number
  start_date: string
  end_date: string
  expiry_date: string
  timezone: string
  from_admin: boolean
  virtual_event: boolean
  event_template_id: string
  private_event: boolean
}

export type PillInputs = {
  event: Event,
  onRemove: (id: number) => void;
}

export interface Option {
  optionName: string;
  votersCount: number;
  totalEth?: string;
  votersData?: any;
  address?: string;
  optionindex: number;
}

export interface Poll {
  id: string;
  name: string;
  title: string;
  startTime: number;
  endTime: number;
  isLive: boolean;
  creator: string;
  topic: string;
  subTopic: string;
  description: string;
  options: string[];
  pollMetadata: string;
  poap_events: number[]
  block_number: number;
}

export interface ProcessVoteInput {
  vote_hash: string;
  poll_id: string;
  option_id: string;
  eth_count?: string;
}

interface PollData {
  poap_events: string[];
}

export interface CheckPOAPOwnershipInput {
  pollData: PollData;
  voter_identifier: string;
}


export interface VerifySignatureInput {
  pollId: string;
  option_id: string;
  voter_identifier: string;
  requiredCred: string;
  signature: string;
}

export interface PollResultComponentType {
  pollType: PollTypes;
  optionsData: PollOptionType[];
}

export enum PollTypes {
  ETH_HOLDING,
  HEAD_COUNT,
}

export enum HeadCountCredential {
  ZUPASS = 'Zupass Holder Results',
  POAP = 'POAP Holder Results',
  PROTOCOL = 'Protocol Guild Member Results',
  GITCOIN = 'Gitcoin Passport Results',
}

export type OptionData = {
  option_description: string;
};

export type PollRequestData = {
  title: string;
  description: string;
  time_limit: number;
  votingMethod: string;
  options: OptionData[];
  credentials: string[];
  poap_events: number[];
};