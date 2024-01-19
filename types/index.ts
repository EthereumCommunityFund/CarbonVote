export type OptionType = {
  name: string;
  isChecked: boolean;
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