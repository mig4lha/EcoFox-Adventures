import React, { useState, useEffect } from 'react';
import { EventBus } from '../game/EventBus';

const InteractionOverlay = () => {
    const [position, setPosition] = useState(null);

    useEffect(() => {
        const handleShowInteraction = ({ x, y }) => {
            setPosition({ x, y });
        };

        const handleHideInteraction = () => {
            setPosition(null); // Clear the position to hide the overlay
        };

        EventBus.on('show-interaction', handleShowInteraction);
        EventBus.on('hide-interaction', handleHideInteraction);

        return () => {
            EventBus.off('show-interaction', handleShowInteraction);
            EventBus.off('hide-interaction', handleHideInteraction);
        };
    }, []);

    if (!position) return null;

    return (
        <div
            className="interaction-overlay"
            style={{
                left: position.x,
                top: position.y,
            }}
        >
            <img src="/assets/buttons/e_button.png" alt="Interact" />
        </div>
    );
};

export default InteractionOverlay;