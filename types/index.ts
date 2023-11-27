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