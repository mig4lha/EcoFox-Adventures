import React, { useState, useEffect } from 'react';
import { EventBus } from '../game/EventBus';

const HealthBar = () => {
    const [health, setHealth] = useState(3);

    useEffect(() => {
        const handleHealthUpdate = (newHealth) => {
            setHealth(newHealth);
        };

        EventBus.on('health-update', handleHealthUpdate);

        return () => {
            EventBus.off('health-update', handleHealthUpdate);
        };
    }, []);

    return (
        <div className="health-bar">
            {[...Array(3)].map((_, index) => (
                <div
                    key={index}
                    className={`health-square ${index < health ? 'active' : ''}`}
                ></div>
            ))}
        </div>
    );
};

export default HealthBar;