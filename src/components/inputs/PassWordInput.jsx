import React, { useState } from 'react';

const PasswordInput = ({ error, ...props }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="input-container">
      <div className="password-input-wrapper">
        <input
          id="password"
          type={show ? 'text' : 'password'}
          name="password"
          autoComplete="current-password"
          placeholder="Digite sua senha!"
          className="input-style"
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="toggle-password"
        >
          {show ? '👁️' : '👁️‍🗨️'}
        </button>
      </div>
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};

export default PasswordInput;