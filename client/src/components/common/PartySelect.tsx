'use client';

import * as React from 'react';
import {
  Autocomplete,
  TextField,
  createFilterOptions,
  Box,
  Typography,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { PartiesService, Party } from '@/api';
import { useQuery } from '@tanstack/react-query';
import QuickAddPartyDialog from '../parties/QuickAddPartyDialog';

const filter = createFilterOptions<Party>();

interface PartySelectProps {
  party_type?: 'customer' | 'vendor';
  value: Party | null;
  onChange: (party: Party | null) => void;
  label?: string;
  required?: boolean;
  fullWidth?: boolean;
  error?: boolean;
  helperText?: string;
}

export default function PartySelect({
  party_type,
  value,
  onChange,
  label = 'Select Party',
  required = false,
  fullWidth = true,
  error = false,
  helperText = '',
}: PartySelectProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const { data: partiesData } = useQuery({
    queryKey: ['parties-search', party_type],
    queryFn: () => PartiesService.getParties(party_type),
  });

  const parties = partiesData?.data || [];

  return (
    <>
      <Autocomplete
        value={value}
        onChange={(event, newValue: any) => {
          if (typeof newValue === 'string') {
            // Handle string value (shouldn't happen with our setup)
          } else if (newValue && newValue.id === 'add-new-party') {
            setIsDialogOpen(true);
          } else {
            onChange(newValue);
          }
        }}
        filterOptions={(options, params) => {
          const filtered = filter(options, params);

          const { inputValue } = params;
          // Suggest the creation of a new value
          const isExisting = options.some((option) => inputValue.toLowerCase() === option.name?.toLowerCase());
          if (inputValue !== '' && !isExisting) {
            filtered.push({
              id: 'add-new-party',
              name: `Add "${inputValue}"`,
            } as any);
          } else if (options.length === 0) {
            filtered.push({
              id: 'add-new-party',
              name: 'Add Party',
            } as any);
          }

          return filtered;
        }}
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        options={parties}
        getOptionLabel={(option) => {
          // Value selected with enter, right from the input
          if (typeof option === 'string') {
            return option;
          }
          // Add "xxx" option created dynamically
          if (option.id === 'add-new-party') {
            return option.name || '';
          }
          // Regular option
          return `${option.name} (${option.mobile})`;
        }}
        renderOption={(props, option: any) => {
          const { key, ...restProps } = props as any;
          if (option.id === 'add-new-party') {
            return (
              <Box component="li" key="add-new-party" {...restProps} sx={{ color: 'primary.main', fontWeight: 700 }}>
                <AddCircleIcon sx={{ mr: 1, fontSize: 20 }} />
                {option.name}
              </Box>
            );
          }
          return (
            <Box component="li" key={option.id} {...restProps}>
              <Box>
                <Typography sx={{ fontWeight: 600 }}>{option.name}</Typography>
                <Typography variant="caption" color="text.secondary">{option.mobile}</Typography>
              </Box>
            </Box>
          );
        }}
        fullWidth={fullWidth}
        freeSolo={false}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            required={required}
            error={error}
            helperText={helperText}
          />
        )}
      />

      <QuickAddPartyDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        initialType={party_type}
        onSuccess={(newParty) => {
          onChange(newParty);
        }}
      />
    </>
  );
}
