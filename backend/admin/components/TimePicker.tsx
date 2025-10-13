// file: /admin/components/TimePicker.tsx

import React from 'react';
import { FieldProps } from '@keystone-6/core/types';
import { FieldContainer, FieldLabel } from '@keystone-ui/fields';
import { controller } from '@keystone-6/core/fields/types/text/views';

export const Field = ({
  field,
  value,
  onChange,
  autoFocus,
}: FieldProps<typeof controller>) => {
  // Ambil string dari value jika tipe-nya bukan string
  const stringValue =
    typeof value === 'string'
      ? value
      : (value as any)?.value ?? '';

  return (
    <FieldContainer>
      <FieldLabel htmlFor={field.path}>{field.label}</FieldLabel>
      <input
        id={field.path}
        type="time"
        autoFocus={autoFocus}
        value={stringValue}
        onChange={(event) => {
          // Bungkus nilai string ke dalam format TextValue yang diharapkan Keystone
          onChange?.({
            kind: 'create',
            value: event.target.value,
          } as any);
        }}
        style={{
          width: '100%',
          padding: '8px 12px',
          borderRadius: '6px',
          border: '1px solid #ccc',
          fontSize: '14px',
          outline: 'none',
        }}
      />
    </FieldContainer>
  );
};
