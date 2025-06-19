import React, { useState, useEffect, KeyboardEvent } from 'react';
import {
  TextField,
  Chip,
  Box,
  Autocomplete,
  styled,
  AutocompleteRenderOptionState,
} from '@mui/material';
import { X, Check } from '@phosphor-icons/react';

interface TagInputProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  fullWidth?: boolean;
  maxTags?: number;
  maxDisplayItems?: number;
}

const StyledChip = styled(Chip)(() => ({
  background: '#EBEBEB',
  borderRadius: '60px',
  fontWeight: 600,
  fontFamily: 'Inter',
  fontSize: '14px',
  letterSpacing: '0.08em',
  color: '#000',
  padding: '5px 10px',
  height: '28px',
  '& .MuiChip-label': {
    padding: '0 8px',
  },
  '& .MuiChip-deleteIcon': {
    color: 'rgba(0,0,0,0.5)',
    margin: '0 5px 0 -6px',
  },
  '&:hover': {
    background: '#DEDEDE',
  },
}));

const TagInput: React.FC<TagInputProps> = ({
  value = [],
  onChange,
  placeholder = 'type a tag',
  fullWidth = false,
  maxTags = 5,
  maxDisplayItems = 3,
}) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [tags, setTags] = useState<string[]>(value);
  const [options, setOptions] = useState<string[]>(value);

  // Sync with external value prop
  useEffect(() => {
    setTags(value);
  }, [value]);

  // Handle tag creation when Enter is pressed
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && inputValue.trim() !== '') {
      event.preventDefault();

      // Check if we've reached the maximum number of tags
      if (tags.length >= maxTags) {
        return;
      }

      // Add the tag if it doesn't already exist
      if (!tags.includes(inputValue.trim())) {
        const newTag = inputValue.trim();
        const newTags = [...tags, newTag];
        setTags(newTags);

        // Add to options if not already there
        if (!options.includes(newTag)) {
          setOptions([...options, newTag]);
        }

        onChange?.(newTags);
      }

      // Clear the input
      setInputValue('');
    }
  };

  // Handle tag deletion
  const handleDelete = (tagToDelete: string) => {
    const newTags = tags.filter((tag) => tag !== tagToDelete);
    setTags(newTags);
    onChange?.(newTags);
  };

  // Handle tag selection from dropdown
  const handleChange = (_event: React.SyntheticEvent, newValue: string[]) => {
    // Check if we've reached the maximum number of tags
    if (newValue.length > maxTags) {
      return;
    }

    setTags(newValue);
    onChange?.(newValue);
  };

  // Custom render option to show checkmarks for selected items
  const renderOption = (
    props: React.HTMLAttributes<HTMLLIElement>,
    option: string,
    { selected }: AutocompleteRenderOptionState
  ) => (
    <li {...props} style={{ display: 'flex', alignItems: 'center' }}>
      <span>{option}</span>
      {selected && (
        <Check
          size={18}
          weight="bold"
          style={{ color: '#000', marginLeft: 'auto' }}
        />
      )}
    </li>
  );

  // Format the display text for selected tags
  const getDisplayText = () => {
    if (tags.length === 0) return '';

    if (tags.length <= maxDisplayItems) {
      return tags.join(', ');
    } else {
      const displayTags = tags.slice(0, maxDisplayItems);
      const remaining = tags.length - maxDisplayItems;
      return `${displayTags.join(', ')}... (+${remaining})`;
    }
  };

  return (
    <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
      <Autocomplete
        multiple
        id="tags-input"
        options={options}
        value={tags}
        inputValue={inputValue}
        onInputChange={(_event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        onChange={handleChange}
        freeSolo
        renderTags={() => null} // Don't render tags inside the input
        renderOption={renderOption}
        slotProps={{
          popper: {
            sx: {
              '& .MuiAutocomplete-paper': {
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                borderRadius: '6px',
                marginTop: '4px',
              },
              '& .MuiAutocomplete-listbox': {
                padding: '4px 0',
                '& .MuiAutocomplete-option': {
                  padding: '8px 12px',
                  fontFamily: 'Inter',
                  fontSize: '14px',
                  '&[aria-selected="true"]': {
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  },
                },
              },
            },
          },
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder={tags.length === 0 ? placeholder : ''}
            fullWidth={fullWidth}
            onKeyDown={handleKeyDown}
            // @ts-ignore - InputProps is deprecated but still works
            InputProps={{
              ...params.InputProps,
              startAdornment:
                tags.length > 0 ? (
                  <span
                    style={{
                      color: '#000',
                      padding: '0 8px 0 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {getDisplayText()}
                  </span>
                ) : null,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                background: '#F9F9F9',
                borderRadius: '6px',
                border: '1px solid rgba(0,0,0,0.1)',
                padding: '0 8px',
                height: '42px',
                '&:hover': {
                  border: '1px solid rgba(0,0,0,0.2)',
                },
                '&.Mui-focused': {
                  border: '1px solid rgba(0,0,0,0.2)',
                  boxShadow: '0 0 0 2px rgba(0,0,0,0.05)',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
              },
              '& .MuiInputBase-input': {
                padding: '10px 4px',
                fontFamily: 'Inter',
                fontSize: '15px',
                '&::placeholder': {
                  color: 'rgba(0, 0, 0, 0.6)',
                  opacity: 1,
                },
              },
            }}
          />
        )}
        sx={{
          width: fullWidth ? '100%' : 'auto',
        }}
      />

      {/* Display tags below the input */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '5px', mt: 1 }}>
        {tags.map((tag) => (
          <StyledChip
            key={tag}
            label={tag}
            deleteIcon={
              <X
                size={20}
                weight="bold"
                style={{ color: '#000', opacity: 0.5 }}
              />
            }
            onDelete={() => handleDelete(tag)}
          />
        ))}
      </Box>
    </Box>
  );
};

export default TagInput;
