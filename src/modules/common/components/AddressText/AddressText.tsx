import React from 'react';
import './AddressText.scss';

export function AddressText({ value }: { value: string | null }) {
  if (!value) {
    return (
      <span className="ton-empty-address">n/a</span>
    );
  }

  return (
    <span
      className="ton-address"
      data-head={value.substring(0, 42)}
      data-tail={value.substring(42, 48)}
    >
    </span>
  )
}
