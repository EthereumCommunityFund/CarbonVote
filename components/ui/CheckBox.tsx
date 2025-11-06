import React from 'react';
import Checkbox from '@mui/material/Checkbox';
import { styled } from '@mui/material/styles';

// Custom checkmark icon from Figma design
const CheckIcon = () => (
  <svg
    width="15"
    height="11"
    viewBox="0 0 15 11"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0.779221 6.03896L4.87013 10.1299L14.2208 0.779221"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Disabled checkmark icon from Figma design
const DisabledCheckIcon = () => (
  <svg
    width="15"
    height="11"
    viewBox="0 0 15 11"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0.779221 6.03896L4.87013 10.1299L14.2208 0.779221"
      stroke="black"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.1"
    />
  </svg>
);

// Empty icon for unchecked state
const EmptyIcon = () => <div style={{ width: 15, height: 11 }} />;

// Create a styled checkbox component based on Figma design
const StyledCheckbox = styled(Checkbox)(({ disabled }) => ({
  padding: 6,
  width: 30,
  height: 30,
  backgroundColor: disabled ? '#EBEBEB' : '#F9F9F9',
  border: disabled ? 'none' : '1px solid rgba(0, 0, 0, 0.1)',
  borderRadius: '5px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&.Mui-checked': {
    backgroundColor: disabled ? '#EBEBEB' : '#000000',
    color: '#FFFFFF',
  },
  '&:hover': {
    backgroundColor: disabled ? '#EBEBEB' : '#F5F5F5',
  },
  '&.Mui-checked:hover': {
    backgroundColor: disabled ? '#EBEBEB' : '#000000',
  },
}));

interface CheckBoxProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  className?: string;
}

const CheckBox: React.FC<CheckBoxProps> = ({
  checked,
  onChange,
  disabled = false,
  className,
}) => {
  return (
    <StyledCheckbox
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      disableRipple
      className={className}
      icon={<EmptyIcon />}
      checkedIcon={disabled ? <DisabledCheckIcon /> : <CheckIcon />}
    />
  );
};

export default CheckBox;
