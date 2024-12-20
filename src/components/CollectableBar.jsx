import React, { useState, useEffect } from 'react';
import { EventBus } from '../game/EventBus';

const CollectableBar = ({ collectableAsset, collectedAsset }) => {
    const [collected, setCollected] = useState([false, false, false]);

    useEffect(() => {
        const handleCollectableUpdate = (collectedItems) => {
            const newCollected = [false, false, false];
            collectedItems.forEach((item) => {
                const index = parseInt(item.split('_')[1], 10) - 1; // Extract the index from the name
                if (index >= 0 && index < 3) {
                    newCollected[index] = true;
                }
            });
            setCollected(newCollected);
        };

        EventBus.on('collectable-update', handleCollectableUpdate);

        return () => {
            EventBus.off('collectable-update', handleCollectableUpdate);
        };
    }, []);

    return (
        <div className="collectable-bar">
            {[...Array(3)].map((_, index) => (
                <img
                    key={index}
                    src={collected[index] ? collectedAsset : collectableAsset}
                    alt="collectable"
                    className="collectable-icon"
                    style={{ opacity: collected[index] ? 1 : 0.5 }}
                />
            ))}
        </div>
    );
};

export default CollectableBar;