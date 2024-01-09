'use client'

import React, { useState, useEffect } from 'react';

import { RemainingTime } from '@/types';

interface CountdownTimerProps {
  remainingTime: RemainingTime;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ remainingTime }: CountdownTimerProps) => {

  return <div>{remainingTime.days} Days {remainingTime.hours} Hours {remainingTime.minutes} Minutes {remainingTime.seconds} Seconds</div>;
};

export default CountdownTimer;
