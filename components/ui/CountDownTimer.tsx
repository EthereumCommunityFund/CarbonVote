'use client'

import React, { useState, useEffect } from 'react';
import { calculateTimeRemaining } from '@/utils';

interface CountdownTimerProps {
  endTime: number;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ endTime }) => {
  const [remainingTime, setRemainingTime] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime(calculateTimeRemaining(endTime));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <div>{remainingTime}</div>;
};

export default CountdownTimer;