import { PollStatusType, RemainingTime, EthHoldingPollType, HeadCountPollType } from "@/types";

export const calculateTimeRemaining = (endDate: Date): string | null => {
  const now = new Date().getTime();
  const distance = endDate.getTime() - now;

  if (distance < 0) {
    return 'Time is up!';
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  return `${days} days ${hours} hours ${minutes} mins and ${seconds} seconds remaining`;
};

export const convertToMinutes = (timeString: any) => {
  const timeParts = timeString.match(/(\d+)([hm])/g) || [];

  let totalMinutes = 0;
  timeParts.forEach((part: { match: (arg0: RegExp) => string[]; includes: (arg0: string) => any }) => {
    const value = parseInt(part.match(/\d+/)[0]);
    if (part.includes('h')) {
      totalMinutes += value * 60;
    } else if (part.includes('m')) {
      totalMinutes += value;
    }
  });

  return totalMinutes;
};

export const convertToHoursAndMinutesToSeconds = (timeLimitString: string): number => {
  const SECONDS_IN_MINUTE = 60;
  const MINUTES_IN_HOUR = 60;
  const HOURS_IN_DAY = 24;

  const timeParts = timeLimitString.match(/(\d+)(d|day|days|h|hour|hours|m|min|minute|minutes)/g);

  if (!timeParts) {
    throw new Error("Invalid time format");
  }

  let seconds = 0;
  timeParts.forEach((part: string) => {
    const value = parseInt(part, 10); time_limit
    :
    72000

    if (part.includes('d') || part.includes('day') || part.includes('days')) {
      seconds += value * HOURS_IN_DAY * MINUTES_IN_HOUR * SECONDS_IN_MINUTE;
    } else if (part.includes('h') || part.includes('hour') || part.includes('hours')) {
      seconds += value * MINUTES_IN_HOUR * SECONDS_IN_MINUTE;
    } else if (part.includes('m') || part.includes('min') || part.includes('minute') || part.includes('minutes')) {
      seconds += value * SECONDS_IN_MINUTE;
    }
  });

  return seconds;
};


const getRemainingTime = (remainingSeconds: number): RemainingTime => {
  const days = Math.floor(remainingSeconds / (3600 * 24));
  const hours = Math.floor((remainingSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = Math.floor(remainingSeconds % 60);

  return { days, hours, minutes, seconds };
};

export const getHeadCountPollStatus = (poll: HeadCountPollType): PollStatusType => {
  const createdAt = new Date(poll.created_at).getTime();
  const expirationTime = createdAt + poll.time_limit * 1000;
  const currentTime = new Date().getTime();

  if (currentTime > expirationTime) {
    return { closed: true };
  }

  const remainingMilliseconds = expirationTime - currentTime;
  const remainingSeconds = Math.floor(remainingMilliseconds / 1000);

  return { closed: false, remainingTime: getRemainingTime(remainingSeconds) };
};

export const getEthHoldingPollStatus = (poll: EthHoldingPollType): PollStatusType => {
  const expirationTime = new Date(Number(poll.endTime)).getTime();
  const currentTime = new Date().getTime();

  if (currentTime > expirationTime) {
    return { closed: true };
  }

  const remainingMilliseconds = expirationTime - currentTime;
  const remainingSeconds = Math.floor(remainingMilliseconds / 1000);

  return { closed: false, remainingTime: getRemainingTime(remainingSeconds) };
}