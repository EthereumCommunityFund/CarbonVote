import React from 'react';
import {
  Select,
  MenuItem,
  SelectChangeEvent,
  SelectProps,
} from '@mui/material';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

export interface MSelectOption {
  id: string;
  name: string;
}

export interface MSelectProps extends Omit<SelectProps, 'onChange'> {
  options: MSelectOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  allOptionLabel?: string;
  showAllOption?: boolean;
}

const SelectIcon = (props: any) => {
  return props.className?.includes('MuiSelect-iconOpen') ? (
    <ChevronUpIcon size={20} color="#000000" />
  ) : (
    <ChevronDownIcon size={20} color="#000000" />
  );
};

const MSelect: React.FC<MSelectProps> = ({
  options,
  value,
  onChange,
  allOptionLabel = 'All',
  showAllOption = true,
  ...props
}) => {
  const handleChange = (e: SelectChangeEvent<unknown>) => {
    onChange(e.target.value === 'all' ? null : (e.target.value as string));
  };

  return (
    <Select
      value={value || 'all'}
      onChange={handleChange}
      IconComponent={SelectIcon}
      MenuProps={{
        PaperProps: {
          sx: {
            borderRadius: '10px',
            marginTop: '5px',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          },
        },
      }}
      sx={{
        display: 'flex',
        padding: '5px 10px',
        justifyContent: 'space-between',
        alignItems: 'center',
        alignSelf: 'stretch',
        borderRadius: '10px',
        background: '#F5F5F5',
        width: '100%',
        height: '40px',
        '& .MuiSelect-select': {
          padding: '5px 10px',
        },
        '& .MuiSelect-icon': {
          right: '10px',
        },
        '&.MuiOutlinedInput-root': {
          '& fieldset': {
            border: 'none',
          },
          '&:hover fieldset': {
            border: 'none',
          },
          '&.Mui-focused fieldset': {
            border: 'none',
          },
        },
        ...props.sx,
      }}
      {...props}
    >
      {showAllOption && (
        <MenuItem
          value="all"
          sx={{
            padding: '5px 10px',
            borderRadius: '5px',
            '&:hover': {
              backgroundColor: '#F0F0F0',
            },
            '&.Mui-selected': {
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white',
            },
            '&.Mui-selected:hover': {
              backgroundColor: 'rgba(0,0,0,0.5)',
            },
          }}
        >
          {allOptionLabel}
        </MenuItem>
      )}
      {options.map((option) => (
        <MenuItem
          key={option.id}
          value={option.id}
          sx={{
            padding: '5px 10px',
            borderRadius: '5px',
            '&:hover': {
              backgroundColor: '#F0F0F0',
            },
            '&.Mui-selected': {
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white',
            },
            '&.Mui-selected:hover': {
              backgroundColor: 'rgba(0,0,0,0.5)',
            },
          }}
        >
          {option.name}
        </MenuItem>
      ))}
    </Select>
  );
};

export default MSelect;
