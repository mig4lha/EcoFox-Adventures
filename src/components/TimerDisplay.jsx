import React, { useState, useEffect } from 'react';
import { EventBus } from '../game/EventBus';

const TimerDisplay = () => {
    const [time, setTime] = useState(0);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        const handleTimeUpdate = (timeInSeconds) => {
            setTime(timeInSeconds);
        };

        EventBus.on('time-update', handleTimeUpdate);

        return () => {
            EventBus.off('time-update', handleTimeUpdate);
        };
    }, []);

    return (
        <div className="timer-display">
            {formatTime(time)}
        </div>
    );
};

export default TimerDisplay;