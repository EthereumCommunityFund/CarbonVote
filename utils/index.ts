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
