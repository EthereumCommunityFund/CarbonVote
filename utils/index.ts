/*export const calculateTimeRemaining = (endDate: string | bigint | number): string | null => {
  let endTime: Date | null = null;

  if (typeof endDate === 'string') {
    endTime = new Date(endDate + 'Z');
  } else if (typeof endDate === 'bigint') {
    endTime = new Date(Number(endDate) * 1000);
  } else {
    endTime = new Date(endDate);
  }
  if (!endTime) {
    return null;
  }

  const now = new Date();
  const utcNow = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
    now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());

  const distance = endTime.getTime() - utcNow.getTime();

  if (distance < 0) {
    return 'Time is up!';
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  return `${days} days ${hours} hours ${minutes} mins and ${seconds} seconds remaining`;
};*/
export const calculateTimeRemaining = (endDate: number): string | null => {

  let endTime = new Date(endDate);

  if (!endTime) {
    return null;
  }
  const now = new Date();
  const utcNow = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
    now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());

  const distance = endTime.getTime() - now.getTime();
  if (distance < 0) {
    return 'Time is up!';
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  return `${days}d ${hours}h ${minutes}m remaining`;
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
    const value = parseInt(part, 10);

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