'use client'

import React, { useState, useEffect } from 'react';
import { calculateTimeRemaining } from '@/utils';

interface CountdownTimerProps {
  targetDate: Date;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate }) => {
  const [remainingTime, setRemainingTime] = useState<string | null>(null);

  const calculateTimeRemaining = (endDate: Date): string | null => {
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

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime(calculateTimeRemaining(targetDate));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <div>{remainingTime}</div>;
};

export default CountdownTimer;
