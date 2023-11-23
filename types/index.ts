export type PollType = {
  id: string,
  name: string,
  creator: string,
  startDate: Date | string,
  endDate: Date | string,
  isLive: boolean,
}