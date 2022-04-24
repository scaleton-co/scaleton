import React from 'react';
import './Address.scss';

export function Address({ value }: { value: string | null }) {
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
