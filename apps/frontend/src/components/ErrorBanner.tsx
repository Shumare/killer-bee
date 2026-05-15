import React from 'react';

interface Props {
  error: string | null | undefined;
}

const ErrorBanner: React.FC<Props> = ({ error }) => {
  if (!error) return null;

  return (
    <div
      role="alert"
      style={{
        backgroundColor: '#fef2f2',
        border: '1px solid #fca5a5',
        borderRadius: '4px',
        color: '#b91c1c',
        padding: '12px 16px',
        marginBottom: '16px',
        fontSize: '14px',
      }}
    >
      {error}
    </div>
  );
};

export default ErrorBanner;
