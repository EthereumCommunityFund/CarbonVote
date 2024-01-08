export type PollType = {
  id: string,
  creator: string,
  startDate: Date | string,
  endDate: Date | string,
  isLive: boolean,
  title: string,
  description: string,
  topic: string,
  subTopic: string,
  isZuPassRequired: boolean
}

export type OptionType = {
  name: string,
  isChecked: boolean,
}

export interface Option {
  id: string;
  option_description: string;
  pollId: string;
  totalWeight: number;
  votes: number;
}