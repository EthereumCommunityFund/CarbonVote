// import * as Switch from '@radix-ui/react-switch';

// interface IProps {
//   value?: boolean;
//   onClick?: () => void;
// }

// export default function ToggleSwitchButton(props: IProps) {
//   const { value, onClick } = props;
//   return (
//     <div className="flex items-center">
//       <Switch.Root
//         className="w-[44px] h-[27px] bg-btnStrongerGreen/30 rounded-full relative data-[state=checked]:bg-btnStrongerGreen/30 outline-none cursor-pointer duration-300"
//         id="airplane-mode"
//         onClick={onClick}
//         checked={value}
//       >
//         <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full shadow-blackA7 transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px] data-[state=checked]:bg-btnPrimaryGreen" />
//       </Switch.Root>
//     </div>
//   );
// }

import * as Switch from '@radix-ui/react-switch';

interface IProps {
  checked?: boolean; // Changed from value to checked
  onClick?: () => void;
}

export default function ToggleSwitchButton(props: IProps) {
  const { checked, onClick } = props; // Changed from value to checked
  return (
    <div className="flex items-center">
      <Switch.Root
        className="w-[44px] h-[27px] bg-btnStrongerGreen/30 rounded-full relative data-[state=checked]:bg-btnStrongerGreen/30 outline-none cursor-pointer duration-300"
        id="airplane-mode"
        onClick={onClick}
        checked={checked} // Passed checked to the Switch.Root
      >
        <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full shadow-blackA7 transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px] data-[state=checked]:bg-btnPrimaryGreen" />
      </Switch.Root>
    </div>
  );
}
