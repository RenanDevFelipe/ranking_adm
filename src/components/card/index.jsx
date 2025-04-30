import React from 'react';
import './styles.css';

const Card = ({ logo, name, role, action, showAction = true, onClick }) => {
    return (
        <div className="user-item">
            {logo && <img src={logo} alt="user-logo" className="user-logo" />}
            <span className="user-name">{name}</span>
            {role && <span className="user-role">{role}</span>}
            {showAction && action && (
                <span 
                    className="user-action" 
                    onClick={onClick}
                    style={{ cursor: 'pointer' }} 
                >
                    {action}
                </span>
            )}
        </div>
    );
};

export default Card;