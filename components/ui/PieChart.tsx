import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartOptions } from "chart.js";
import { Pie } from 'react-chartjs-2';

import { PollOptionType, PollTypes } from '@/types';
import { Label } from './Label';

ChartJS.register(ArcElement, Tooltip, Legend);

interface IPieChartComponent {
  votes: PollOptionType[],
  votingType: PollTypes,
}

const PieChartComponent: React.FC<IPieChartComponent> = ({ votes, votingType }) => {
  // Data for the pie chart
  const labels: string[] = votes.map((vote) => vote.option_description)
  const weight: number[] = votes.map((vote) => vote.votes);
  const totalWeight: number = weight.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

  let backgroundColor: string[] = ['#88F2D5', '#E3F29C', '#EA66A4'];
  if (labels[0] === 'Yes') {
    backgroundColor = ['#E3F29C', '#88F2D5', '#EA66A4'];
  }

  const data = {
    labels: labels,
    datasets: [
      {
        data: weight,
        backgroundColor: backgroundColor,
        hoverBackgroundColor: backgroundColor,
      },
    ],
  };

  const option: ChartOptions<'pie'> = {
    plugins: {
      legend: {
        position: 'bottom', // Align legend at the bottom
      },
    }
  }
  return (
    <>
      <div className='flex flex-col'>
        <Label className='text-xl'>{totalWeight.toFixed(5)}</Label>
        <Label className='text-sm text-black/70'>{votingType === PollTypes.ETH_HOLDING ? 'Total Eth' : 'Total Votes'}</Label>
      </div>
      <Pie
        data={data}
        options={option}
      />
    </>
  );
};

export default PieChartComponent;
