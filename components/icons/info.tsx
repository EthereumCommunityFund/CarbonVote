import * as React from 'react';

export const InfoIcon: React.FC<React.ComponentPropsWithoutRef<'svg'>> = (
  props
) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="21"
      height="20"
      viewBox="0 0 21 20"
      fill="none"
      {...props}
    >
      <g opacity="0.3" clip-path="url(#clip0_2615_8348)">
        <path
          d="M9.875 9.375C10.0408 9.375 10.1997 9.44085 10.3169 9.55806C10.4342 9.67527 10.5 9.83424 10.5 10V13.125C10.5 13.2908 10.5658 13.4497 10.6831 13.5669C10.8003 13.6842 10.9592 13.75 11.125 13.75"
          stroke="black"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M10.1875 7.34375C10.619 7.34375 10.9688 6.99397 10.9688 6.5625C10.9688 6.13103 10.619 5.78125 10.1875 5.78125C9.75603 5.78125 9.40625 6.13103 9.40625 6.5625C9.40625 6.99397 9.75603 7.34375 10.1875 7.34375Z"
          fill="black"
        />
        <path
          d="M10.5 17.5C14.6421 17.5 18 14.1421 18 10C18 5.85786 14.6421 2.5 10.5 2.5C6.35786 2.5 3 5.85786 3 10C3 14.1421 6.35786 17.5 10.5 17.5Z"
          stroke="black"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_2615_8348">
          <rect
            width="20"
            height="20"
            fill="white"
            transform="translate(0.5)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};
