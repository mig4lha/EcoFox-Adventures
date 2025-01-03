import { useRef, useState, useEffect } from 'react';
import { PhaserGame } from './game/PhaserGame';
import HealthBar from './components/HealthBar';
import CollectableBar from './components/CollectableBar';
import InteractionOverlay from './components/InteractionOverlay';
import TimerDisplay from './components/TimerDisplay';
import NameInputForm from './components/NameInputForm';
import { EventBus } from './game/EventBus';
import { GAME_SETTINGS } from './game/Config';

function App() {
    const phaserRef = useRef();
    const [currentScene, setCurrentScene] = useState(null);
    const [fadeState, setFadeState] = useState('fade-in'); // 'fade-in' or 'fade-out'
    const [showNameInput, setShowNameInput] = useState(false); // **Define the state here**
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

        const handleGameDone = () => {
            setShowNameInput(true);
        };

        const handleNameSubmitted = (playerName) => {
            // Update Config or handle the player name as needed
            // For example, store it in Firebase
            console.log(`Player Name: ${playerName}`);
            setShowNameInput(false);

            GAME_SETTINGS.playerName = playerName;

            // Emit event to navigate to Main Menu
            EventBus.emit('navigateToMainMenu');
        };

        EventBus.on('fade-in', handleFadeIn);
        EventBus.on('fade-out', handleFadeOut);
        EventBus.on('scene-change', handleSceneChange);
        EventBus.on('gameDone', handleGameDone);
        EventBus.on('nameSubmitted', handleNameSubmitted);

        return () => {
            EventBus.off('scene-change', handleSceneChange);
            EventBus.off('fade-out', handleFadeOut);
            EventBus.off('fade-in', handleFadeIn);
            EventBus.off('gameDone', handleGameDone);
            EventBus.off('nameSubmitted', handleNameSubmitted);
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
                            collectableAsset="/assets/collectables/berry_gray.png"
                            collectedAsset="/assets/collectables/berry.png"
                        />
                        <InteractionOverlay />
                    </div>
                )}
                {showNameInput && <NameInputForm />}
            </div>
        </div>
    );
}

export default App;