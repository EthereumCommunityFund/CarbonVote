import * as React from 'react';

export const RefreshIcon: React.FC<React.ComponentPropsWithoutRef<'svg'>> = (
  props
) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      {...props}
    >
      <g clip-path="url(#clip0_2495_3866)">
        <path
          d="M13.125 7.5H16.875V3.75"
          stroke="black"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M16.875 7.50027L14.6656 5.29089C13.3861 4.01144 11.6538 3.28799 9.84437 3.27746C8.03494 3.26693 6.29431 3.97017 5 5.23464"
          stroke="black"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M6.875 12.5H3.125V16.25"
          stroke="black"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M3.125 12.5L5.33437 14.7094C6.61388 15.9888 8.34621 16.7123 10.1556 16.7228C11.9651 16.7333 13.7057 16.0301 15 14.7656"
          stroke="black"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_2495_3866">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
