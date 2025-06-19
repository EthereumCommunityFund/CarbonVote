import * as React from 'react';

export const WarnCircleIcon: React.FC<React.ComponentPropsWithoutRef<'svg'>> = (
  props
) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="30"
      height="30"
      viewBox="0 0 30 30"
      fill="none"
      {...props}
    >
      <g clip-path="url(#clip0_2831_19209)">
        <path
          d="M15 26.25C21.2132 26.25 26.25 21.2132 26.25 15C26.25 8.7868 21.2132 3.75 15 3.75C8.7868 3.75 3.75 8.7868 3.75 15C3.75 21.2132 8.7868 26.25 15 26.25Z"
          stroke="#FF5B53"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M15 15.9375V9.375"
          stroke="#FF5B53"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M15 21.3281C15.6472 21.3281 16.1719 20.8035 16.1719 20.1562C16.1719 19.509 15.6472 18.9844 15 18.9844C14.3528 18.9844 13.8281 19.509 13.8281 20.1562C13.8281 20.8035 14.3528 21.3281 15 21.3281Z"
          fill="#FF5B53"
        />
      </g>
      <defs>
        <clipPath id="clip0_2831_19209">
          <rect width="30" height="30" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
