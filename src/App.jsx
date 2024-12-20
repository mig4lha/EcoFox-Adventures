import { useRef, useState, useEffect } from 'react';
import { PhaserGame } from './game/PhaserGame';
import HealthBar from './components/HealthBar';
import CollectableBar from './components/CollectableBar';
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
                {(currentScene === 'Game' || currentScene === 'DebugGame') && <HealthBar />}
                {(currentScene === 'Game' || currentScene === 'DebugGame') && (
                    <CollectableBar
                        collectableAsset="/assets/collectables/moedinha_gray.png"
                        collectedAsset="/assets/collectables/moedinha.png"
                    />
                )}
            </div>
        </div>
    );
}

export default App;