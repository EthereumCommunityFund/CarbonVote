export type OptionType = {
  name: string,
  isChecked: boolean,
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