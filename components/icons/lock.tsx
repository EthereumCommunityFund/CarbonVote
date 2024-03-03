import * as React from 'react';

export const LockIcon: React.FC<React.ComponentPropsWithoutRef<'svg'>> = (
  props
) => {
  return (
    <svg
      width="28"
      height="29"
      viewBox="0 0 28 29"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M7.00001 12.99V10.19C7.00001 8.33349 7.73751 6.55301 9.05026 5.24025C10.363 3.9275 12.1435 3.19 14 3.19C15.8565 3.19 17.637 3.9275 18.9498 5.24025C20.2625 6.55301 21 8.33349 21 10.19V12.99C21.7426 12.99 22.4548 13.285 22.9799 13.8101C23.505 14.3352 23.8 15.0474 23.8 15.79V22.79C23.8 23.5326 23.505 24.2448 22.9799 24.7699C22.4548 25.295 21.7426 25.59 21 25.59H7.00001C6.25741 25.59 5.54521 25.295 5.02011 24.7699C4.49501 24.2448 4.20001 23.5326 4.20001 22.79V15.79C4.20001 15.0474 4.49501 14.3352 5.02011 13.8101C5.54521 13.285 6.25741 12.99 7.00001 12.99ZM18.2 10.19V12.99H9.80001V10.19C9.80001 9.07609 10.2425 8.00781 11.0302 7.22015C11.8178 6.4325 12.8861 5.99 14 5.99C15.1139 5.99 16.1822 6.4325 16.9699 7.22015C17.7575 8.00781 18.2 9.07609 18.2 10.19Z"
        fill="black"
      />
    </svg>
  );
};
