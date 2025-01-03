import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp,
    query,
    orderBy,
    getDocs,
    onSnapshot
} from 'firebase/firestore';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Automatically sign in the user anonymously
signInAnonymously(auth)
    .then(() => {
        console.log('Signed in anonymously');
    })
    .catch((error) => {
        console.error('Anonymous sign-in failed:', error);
    });

/**
 * Adds a player's score to the leaderboard.
 *
 * @param {string} playerName - The name of the player.
 * @param {number} totalScore - The total score achieved by the player.
 * @param {number} totalTimeTaken - The total time taken by the player to complete the game (in seconds).
 * @returns {Promise<void>} - A promise that resolves when the data is successfully written.
 */
const addPlayerScore = async (playerName, totalScore, totalTimeTaken) => {
    try {
        const leaderboardRef = collection(db, 'leaderboard');
        await addDoc(leaderboardRef, {
            playerName,
            totalScore,
            totalTimeTaken,
            timestamp: serverTimestamp(),
        });
        console.log('Player score added to leaderboard successfully.');
    } catch (error) {
        console.error('Error adding player score to leaderboard:', error);
        throw error; // Optional: Rethrow the error if you want to handle it elsewhere
    }
};

/**
 * Fetches leaderboard data ordered by totalScore in descending order.
 *
 * @returns {Promise<Array>} - A promise that resolves to an array of leaderboard entries.
 */
const fetchLeaderboard = async () => {
    try {
        const leaderboardRef = collection(db, 'leaderboard');
        const q = query(leaderboardRef, orderBy('totalScore', 'desc'));
        const querySnapshot = await getDocs(q);
        const playersData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
        return playersData;
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        throw error; // Rethrow the error for external handling
    }
};

/**
 * Sets up a real-time listener for the leaderboard.
 *
 * @param {Function} callback - Function to handle incoming data.
 * @returns {Function} - Unsubscribe function.
 */
const onSnapshotLeaderboard = (callback) => {
    const leaderboardRef = collection(db, 'leaderboard');
    const q = query(leaderboardRef, orderBy('totalScore', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
      const playersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(playersData);
    }, (error) => {
      console.error('Error with real-time leaderboard:', error);
    });
  };

export { auth, db, addPlayerScore, fetchLeaderboard, onSnapshotLeaderboard };