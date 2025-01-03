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
                <img
                    key={index}
                    src={index < health ? `${import.meta.env.BASE_URL}assets/ui/heart_full.png` : `${import.meta.env.BASE_URL}assets/ui/heart_empty.png`}
                    alt="heart"
                    className="health-heart"
                />
            ))}
        </div>
    );
};

export default HealthBar;