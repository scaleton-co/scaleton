import { LoadingOutlined } from '@ant-design/icons';
import { Timeline } from 'antd';
import React from 'react';

interface ProgressStepProps {
  status: 'idle' | 'pending' | 'done' | 'failed';
  idleText: string;
  pendingText: string;
  doneText: string;
  failedText?: string;
  last?: boolean
}

export function ProgressStep({
  status,
  idleText,
  pendingText,
  doneText,
  failedText,
  last,
}: ProgressStepProps) {
  if (status === 'idle') {
    return <Timeline.Item pending color="grey">{idleText}</Timeline.Item>;
  }

  if (status === 'pending') {
    return <Timeline.Item pending dot={<LoadingOutlined />}>{pendingText}</Timeline.Item>;
  }

  if (status === 'done') {
    return <Timeline.Item pending={!!last} color="green">{doneText}</Timeline.Item>;
  }

  if (status === 'failed') {
    return <Timeline.Item pending color="red">{failedText}</Timeline.Item>;
  }

  return null;
}
