export type OptionType = {
  name: string;
  isChecked: boolean;
}

export interface PollStatusType {
  closed: boolean;
  remainingTime?: RemainingTime;
  expirationTime?: string;
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

export type HeadCountPollType = {
  id: string;
  created_at: string;
  credentials: CredentialType[];
  description: string;
  options: OptionType[];
  time_limit: number;
  title: string;
  votingMethod: string;
}

export type EthHoldingPollType = {
  id: number;
  description: string;
  endTime: bigint;
  name: string;
  options: string[];
  pollMetadata: string;
  pollType: string;
  votingMethod: string;
}