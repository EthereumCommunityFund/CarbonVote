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