import React from 'react';

const EmailInput = ({ error, ...props }) => {
  return (
    <div className="input-container">
      <input
        id="email"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="Digite seu E-mail"
        className="input-style"
        {...props}
      />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};

export default EmailInput;