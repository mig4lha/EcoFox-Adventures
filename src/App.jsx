import { useRef, useState, useEffect } from 'react';
import { PhaserGame } from './game/PhaserGame';
import HealthBar from './components/HealthBar';
import CollectableBar from './components/CollectableBar';
import InteractionOverlay from './components/InteractionOverlay';
import TimerDisplay from './components/TimerDisplay';
import { EventBus } from './game/EventBus';

function App() {
    const phaserRef = useRef();
    const [currentScene, setCurrentScene] = useState(null);
    const [isFading, setIsFading] = useState(false);
    const isGameScene = currentScene === 'Game' || currentScene === 'DebugGame';

    useEffect(() => {
        const handleSceneChange = (scene) => {
            if (scene !== 'Game' && scene !== 'DebugGame') {
                setIsFading(true);
            } else {
                setIsFading(false);
            }
            setCurrentScene(scene);
        };

        EventBus.on('scene-change', handleSceneChange);
        return () => EventBus.off('scene-change', handleSceneChange);
    }, []);

    return (
        <div id="app">
            <div id="game-container">
                <PhaserGame ref={phaserRef} />
                {(isGameScene || isFading) && (
                    <div className={`ui-components ${isFading ? 'fade-out' : ''}`}>
                        <HealthBar />
                        <TimerDisplay />
                        <CollectableBar
                            collectableAsset="/assets/collectables/moedinha_gray.png"
                            collectedAsset="/assets/collectables/moedinha.png"
                        />
                        <InteractionOverlay />
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;