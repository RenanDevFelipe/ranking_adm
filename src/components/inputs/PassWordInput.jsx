import React, { useState } from "react";

const PasswordInput = ({ value, onChange, placeholder = "Password", name = "password" }) => {
    const [show, setShow] = useState(false);


    return (
        <div className="input-password-wrapper">
            <input
                type={show ? "text" : "password"}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required
                className="input-style" 
            />
            <button
                type="button"
                onClick={() => setShow((prev) => !prev)}
                className="toggle-btn"
            >
                {show ? "Hide" : "Show"}
            </button>
        </div>
    );
};

export default PasswordInput;