import React, { useState, useEffect, useRef } from 'react';
import { EventBus } from '../game/EventBus.js'; // Ensure correct import

const NameInputForm = () => {
    const [name, setName] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        // Auto focus input when form mounts
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmedName = name.trim();
        if (trimmedName !== '') {
            EventBus.emit('nameSubmitted', trimmedName);
            setName('');
        } else {
            alert('Please enter your name.');
        }
    };

    return (
        <div className="name-input-overlay">
            <form className="name-input-form" onSubmit={handleSubmit}>
                <label htmlFor="playerName">Enter Your Name:</label>
                <input
                    ref={inputRef}
                    type="text"
                    id="playerName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={20}
                    placeholder="Your Name"
                    autoFocus
                    onKeyDown={(e) => {
                        e.stopPropagation(); // Prevent key events from bubbling
                    }}
                />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default NameInputForm;