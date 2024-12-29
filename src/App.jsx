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
    const [fadeState, setFadeState] = useState('fade-in'); // 'fade-in' or 'fade-out'
    const isGameScene = currentScene === 'Game' || currentScene === 'DebugGame';

    useEffect(() => {
        const handleSceneChange = (scene) => {
            if (scene !== 'Game' && scene !== 'DebugGame') {
                setFadeState('fade-out');
            } else {
                setFadeState('fade-in');
            }
            setCurrentScene(scene);
        };

        const handleFadeIn = () => {
            setFadeState('fade-in');
        };

        const handleFadeOut = () => {
            setFadeState('fade-out');
        };

        EventBus.on('fade-in', handleFadeIn);
        EventBus.on('fade-out', handleFadeOut);
        EventBus.on('scene-change', handleSceneChange);

        return () => {
            EventBus.off('scene-change', handleSceneChange);
            EventBus.off('fade-out', handleFadeOut);
            EventBus.off('fade-in', handleFadeIn);
        };
    }, []);

    return (
        <div id="app">
            <div id="game-container">
                <PhaserGame ref={phaserRef} />
                {(isGameScene || fadeState === 'fade-out') && (
                    <div className={`ui-components ${fadeState}`}>
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