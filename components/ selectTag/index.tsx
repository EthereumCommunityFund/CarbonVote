import React from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import { Check } from '@phosphor-icons/react';
import { X } from '@phosphor-icons/react';

export interface SelectTagOption {
  label: string;
  value: string;
}

interface SelectTagProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  selectOptions: SelectTagOption[];
  placeholder?: string;
  maxDisplayItems?: number;
  maxSelect?: number;
}

export default function SelectTag({
  value = [],
  onChange,
  selectOptions,
  placeholder = 'please select',
  maxDisplayItems = 3,
  maxSelect,
}: SelectTagProps) {
  const selectedLabels =
    value.length > 0
      ? (() => {
          const labels = value.map((val) => {
            const option = selectOptions.find((opt) => opt.value === val);
            return option?.label || val;
          });

          if (labels.length <= maxDisplayItems) {
            return labels.join(', ');
          } else {
            const displayLabels = labels.slice(0, maxDisplayItems);
            const remaining = labels.length - maxDisplayItems;
            return `${displayLabels.join(', ')}... (+${remaining})`;
          }
        })()
      : '';

  return (
    <>
      <Select
        multiple
        value={value}
        onChange={(e) => {
          const val = e.target.value as string[];
          // Check if the new selection exceeds the maxSelect limit
          if (maxSelect !== undefined && val.length > maxSelect) {
            // If trying to add more than allowed, don't update
            return;
          }
          onChange && onChange(val);
        }}
        displayEmpty
        renderValue={() => {
          if (value.length === 0) {
            return (
              <span style={{ color: 'rgba(0, 0, 0, 0.6)' }}>{placeholder}</span>
            );
          }
          return <span style={{ color: '#000' }}>{selectedLabels}</span>;
        }}
        sx={{
          width: '100%',
          minHeight: '44px',
          background: '#F9F9F9',
          borderRadius: '6px',
          border: '1px solid rgba(0,0,0,0.1)',
          fontFamily: 'Inter',
          fontSize: '15px',
          color: '#000',
          boxShadow: 'none',
          '.MuiSelect-select': {
            padding: '10px 12px 10px 10px',
            display: 'flex',
            alignItems: 'center',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          },
          '.MuiSelect-icon': {
            color: '#000',
            right: 10,
          },
          '& .MuiOutlinedInput-notchedOutline': {
            border: 'none',
          },
          '&:hover': {
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: 'none',
          },
          '&.Mui-focused': {
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: 'none',
          },
          '&:active, &.Mui-active': {
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: 'none',
          },
        }}
      >
        {selectOptions.map((option) => {
          // Determine if this option should be disabled
          const isSelected = value.includes(option.value);
          const isMaxReached =
            maxSelect !== undefined && value.length >= maxSelect;
          const isDisabled = isMaxReached && !isSelected;

          return (
            <MenuItem
              key={option.value}
              value={option.value}
              disabled={isDisabled}
              sx={{
                display: 'flex',
                alignItems: 'center',
                opacity: isDisabled ? 0.5 : 1,
                '&.Mui-disabled': {
                  opacity: 0.5,
                },
              }}
            >
              {option.label}
              {isSelected && (
                <Check
                  size={18}
                  weight="bold"
                  style={{ color: '#000', marginLeft: 'auto' }}
                />
              )}
              {isDisabled && (
                <span
                  style={{
                    fontSize: '12px',
                    color: 'rgba(0,0,0,0.5)',
                    marginLeft: 'auto',
                  }}
                >
                  Max {maxSelect}
                </span>
              )}
            </MenuItem>
          );
        })}
      </Select>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
        {value.map((val) => {
          const option = selectOptions.find((opt) => opt.value === val);
          return (
            <Chip
              key={val}
              label={option?.label || val}
              deleteIcon={
                <X
                  size={20}
                  weight="bold"
                  style={{ color: '#000', opacity: 0.5 }}
                />
              }
              sx={{
                background: '#EBEBEB',
                borderRadius: '60px',
                fontWeight: 600,
                fontFamily: 'Inter',
                fontSize: '14px',
                letterSpacing: '0.08em',
                color: '#000',
                padding: '5px 10px',
                '.MuiChip-deleteIcon': {
                  color: 'rgba(0,0,0,0.5)',
                },
              }}
              onDelete={() => {
                onChange && onChange(value.filter((v) => v !== val));
              }}
            />
          );
        })}
      </Box>
    </>
  );
}
