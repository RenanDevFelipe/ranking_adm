import React from "react";

const EmailIput = ({ value, onChange, placeholder = "Digitw seu E-mail", name = "email" }) => {
    return (
        <input

            type="email"
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required
            className="input-style"
        />
    );
};


export default EmailIput;