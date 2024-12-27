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

    useEffect(() => {
        const handleSceneChange = (scene) => {
            setCurrentScene(scene);
        };

        EventBus.on('scene-change', handleSceneChange);

        return () => {
            EventBus.off('scene-change', handleSceneChange);
        };
    }, []);

    return (
        <div id="app">
            <div id="game-container">
                <PhaserGame ref={phaserRef} />
                {(currentScene === 'Game' || currentScene === 'DebugGame') && (
                    <>
                        <HealthBar />
                        <TimerDisplay />
                        <CollectableBar
                            collectableAsset="/assets/collectables/moedinha_gray.png"
                            collectedAsset="/assets/collectables/moedinha.png"
                        />
                    </>
                )}
                <InteractionOverlay />
            </div>
        </div>
    );
}

export default App;