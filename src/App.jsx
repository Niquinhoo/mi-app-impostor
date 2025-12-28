import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    onSnapshot, 
    collection, 
    query, 
    getDocs, 
    writeBatch,
    getDoc,
    deleteDoc,
    updateDoc
} from 'firebase/firestore';

// --- IMPORTS DE MATERIAL-UI (MUI) ---
import {
    ThemeProvider,
    createTheme,
    CssBaseline,
    Container,
    Box,
    AppBar,
    Toolbar,
    Typography,
    Button,
    TextField,
    Paper,
    CircularProgress,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    List,
    ListItem,
    ListItemText,
    IconButton,
    ListItemIcon,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Slider
} from '@mui/material';
import {
    Group,
    Shuffle,
    Visibility,
    VisibilityOff,
    Home,
    EmojiEvents,
    PlayArrow,
    Add,
    Login,
    Logout,
    Refresh,
    Delete,
    People,
    Key,
    Lock,
    HowToVote,
    Cancel
} from '@mui/icons-material';

// --- CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyCFhg7_5B2G6a3N0aVbL3I48mNhuIomssM",
  authDomain: "impostor-test-9eaef.firebaseapp.com",
  projectId: "impostor-test-9eaef",
  storageBucket: "impostor-test-9eaef.firebasestorage.app",
  messagingSenderId: "1049608465303",
  appId: "1:1049608465303:web:aa6c34611bc9cc206972d2",
  measurementId: "G-FBP9ND9YL6"
};
const appId = typeof __app_id !== 'undefined' ? __app_id : 'impostor-game-default';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// --- PACKS DE PALABRAS ---
const INITIAL_WORD_PACKS = [
    { 
        id: 'futbol', 
        name: 'Jugadores de Fútbol', 
        words: [
          // Leyendas e internacionales muy conocidos
          "Lionel Messi",
          "Cristiano Ronaldo",
          "Diego Maradona",
          "Pelé",
          "Zinedine Zidane",
          "Ronaldinho",
          "Ronaldo nazario",
          "Franz Beckenbauer",
          "Paolo Maldini",
      
          // Figuras muy conocidas (últimos años)
          "Neymar",
          "Luis Suárez",
          "Andrés Iniesta",
          "Sergio Ramos",
          "Gianluigi Buffon",
          "Iker Casillas",
          "Manuel Neuer",
          "Keylor navas",
          
      
      
          
      
          // Estrellas actuales súper mediáticas
          "Kylian Mbappé",
          "Erling Haaland",
          "Kevin De Bruyne",
          "Mohamed Salah",
          "Robert Lewandowski",
          "Karim Benzema",
          "Luka Modrić",
          "Vinícius Jr",
          "Rodri",
          "Jude Bellingham",
          "Lamine Yamal",
      
          // Selección Argentina
          "Ángel Di María",
          "Sergio Agüero",
          "Carlos Tévez",
          "Juan Román Riquelme",
          "Javier Mascherano",
          "Cuti romero",
          "Nicolas otamendi",
           "Rodrigo de paul",
          "Emiliano Martínez",
          "Paulo Dybala",
          "Enzo Fernández",
          "Leo paredes",
          "Julian alvarez",
          "Lautaro martinez",
      
          // Boca Juniors
          "Cavani",
          "Valentin Barco",
          "Chiquito romero",
          "Benedetto",
          "Martín palermo",
          "Sebastian Villa",
          "Pique",
          "Icardi",
        
          // River Plate
          "Marcelo Gallardo",
          "Leonardo Ponzio",
          "Pity Martínez",
          "Franco Armani",
          "Montiel",
          "Juanfer quintero"
        ] 
      },
    {
      id: 'marvel_rivals',
      name: 'Héroes de Marvel Rivals',
      words: [
        "Magik", "Peni Parker", "Rocket Raccoon", "Angela", "Mantis", "Storm",
        "Hela", "Hulk", "Black Panther", "Star Lord", "Thor", "Psylocke", 
        "Doctor Strange", "Mister Fantastic", "Iron Fist", "Venom", "Spider Man",
        "Captain America", "Iron Man", "Emma Frost", "Jeff the Shark", "Ultron",
        "Hawkeye", "Groot", "Winter Soldier", "Cloak & Dagger", "Magneto",
        "Moon Knight", "Invisible Woman", "Adam Warlock", "Namor", "Blade",
        "Luna Snow", "Scarlet Witch", "Punisher", "Loki", "The Thing", "Phoenix",
        "Wolverine", "Human Torch", "Squirrel Girl", "Black Widow"
      ]
    },
    {
      id: 'lol_campeones',
      name: 'Campeones de LOL',
      words: [
        "Kled", "Quinn", "Malphite", "Ziggs", "Janna", "Anivia", "Sona", "Urgot", "Singed", "Kayle",
        "Milio", "Nami", "Ashe", "Morgana", "Rek'Sai", "Briar", "Jinx", "Jax", "LeBlanc", "Akshan",
        "Vex", "Kindred", "Soraka", "Warwick", "Diana", "Vel'Koz", "Nunu & Willump", "Vayne", "Trundle", "Poppy",
        "Shen", "Pantheon", "Sett", "Katarina", "Fiora", "Xerath", "Syndra", "Vladimir", "Fizz", "Qiyana",
        "Zoe", "Seraphine", "Garen", "Kha'Zix", "Master Yi", "Leona", "Bard", "Thresh", "Jarvan IV", "Irelia",
        "Karma", "Smolder", "Kai'Sa", "Draven", "Lee Sin", "Sylas", "Caitlyn", "Udyr", "Fiddlesticks", "Zac",
        "Zilean", "Volibear", "Veigar", "Kassadin", "Evelynn", "Ekko", "Ornn", "Amumu", "Zyra", "Riven",
        "Talon", "Hwei", "Malzahar", "Camille", "Sion", "Lux", "Kayn", "Hecarim", "Twitch", "Miss Fortune",
        "Tristana", "Mordekaiser", "Elise", "Senna", "Lissandra", "Lillia", "Brand", "Samira", "Gwen", "Cho'Gath",
        "Ahri", "Zeri", "Teemo", "Gangplank", "Sivir", "Braum", "Shaco", "Wukong", "Darius", "Viego",
        "Lucian", "Yasuo", "Pyke", "Xayah", "Zed", "Nautilus", "Viktor", "Blitzcrank", "Graves", "Ambessa",
        "Aatrox", "Lulu", "Akali", "Mel", "Rell", "Gragas", "Naafiri", "Gnar", "Nocturne", "Xin Zhao",
        "Rakan", "Tryndamere", "Yorick", "Neeko", "Jayce", "Aphelios", "Renekton", "Nasus", "Twisted Fate", "Jhin",
        "Aurora", "Galio", "Orianna", "Cassiopeia", "Nilah", "Taric", "Kog'Maw", "Rammus", "Kennen", "Bel'Veth",
        "Olaf", "Maokai", "Ivern", "Annie", "Ryze", "Aurelion Sol", "Illaoi", "Karthus", "Renata Glasc", "Tahm Kench",
        "Shyvana", "Kalista", "Dr. Mundo", "Alistar", "Sejuani", "Nidalee", "Taliyah", "Vi", "Rengar", "Ezreal",
        "Yone", "Rumble", "Corki", "Swain", "Yuumi", "Yunara", "Varus", "K'Sante", "Azir"
      ]
    },
    { 
        id: 'f1', 
        name: 'Pilotos de Fórmula 1', 
        words: [
          "Pierre Gasly",
          "Franco Colapinto",
          "Fernando Alonso",
          "Lance Stroll",
          "Gabriel Bortoleto",
          "Nico Hulkenberg",
          "Sergio Perez",
          "Valtteri Bottas",
          "Charles Leclerc",
          "Lewis Hamilton",
          "Esteban Ocon",
          "Oliver Bearman",
          "Lando Norris",
          "Oscar Piastri",
          "Kimi Antonelli",
          "George Russell",
          "Liam Lawson",
          "Arvid Lindblad",
          "Max Verstappen",
          "Isack Hadjar",
          "Alexander Albon",
          "Carlos Sainz Jr"
        ]
      }
];

// --- RUTAS DE FIRESTORE ---
const getWordPacksCollectionPath = () => `artifacts/${appId}/public/data/word_packs`;
const getRoomsCollectionPath = () => `artifacts/${appId}/public/data/impostor_rooms`;
const getRoomDocPath = (roomId) => `${getRoomsCollectionPath()}/${roomId}`;
const getPlayersCollectionPath = (roomId) => `${getRoomDocPath(roomId)}/players`;
const getPlayerDocPath = (roomId, userId) => `${getPlayersCollectionPath(roomId)}/${userId}`;

// --- TEMA DE MUI ---
const theme = createTheme({
    palette: {
        primary: { main: '#e58e46ff' },
        secondary: { main: '#10b924ff' },
        background: { default: '#f3f4f6' },
    },
    typography: {
        fontFamily: 'Inter, sans-serif',
        h1: { fontWeight: 900 },
        h2: { fontWeight: 800 },
        h3: { fontWeight: 700 },
    },
});

// --- COMPONENTE ASIGNACIÓN DE JUGADOR ---
const PlayerAssignment = ({ player }) => {
    const [show, setShow] = useState(false);

    if (!player || !player.role) {
        return <CircularProgress sx={{ display: 'block', margin: 'auto', my: 4 }} />;
    }

    const isImpostor = player.role === 'Impostor';

    return (
        <Paper 
            elevation={8}
            sx={{
                maxWidth: 'md', mx: 'auto', borderRadius: 4, p: 4, transition: 'all 0.3s',
                backgroundColor: show ? (isImpostor ? 'error.dark' : 'success.dark') : 'primary.dark',
                color: 'white'
            }}
        >
            <Typography variant="h6" component="p" align="center" gutterBottom sx={{ textTransform: 'uppercase', letterSpacing: 2, opacity: 0.8 }}>
                Tu Asignación
            </Typography>
            
            {show ? (
                <Box textAlign="center">
                    {/* CORRECCIÓN: word-break para palabras largas */}
                    <Typography variant="h2" component="p" sx={{ fontWeight: 'black', mb: 2, animation: 'pulse 1.5s infinite', wordBreak: 'break-word', hyphens: 'auto' }}>
                        {player.word}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3 }}>
                        {isImpostor 
                            ? "¡Tu misión es fingir que sabes la palabra!"
                            : "¡Encuentra a los impostores que no saben esta palabra!"}
                    </Typography>
                    <Button onClick={() => setShow(false)} variant="contained" size="large" sx={{ bgcolor: 'white', color: 'primary.dark', '&:hover': { bgcolor: 'grey.200' } }} startIcon={<VisibilityOff />}>
                        Ocultar
                    </Button>
                </Box>
            ) : (
                <Box textAlign="center">
                    <Typography variant="h3" component="p" sx={{ fontWeight: 'bold', mb: 4 }}>
                        ¿Quién soy?
                    </Typography>
                    <Button onClick={() => setShow(true)} variant="contained" size="large" sx={{ bgcolor: 'white', color: 'primary.dark', transform: 'scale(1.05)', '&:hover': { bgcolor: 'grey.200', transform: 'scale(1.1)' } }} startIcon={<Visibility />}>
                        Ver mi Rol
                    </Button>
                </Box>
            )}
            <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }`}</style>
        </Paper>
    );
};

// --- COMPONENTE PRINCIPAL ---
const App = () => {
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    const [view, setView] = useState('HOME'); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userName, setUserName] = useState('');
    const [inputRoomId, setInputRoomId] = useState('');

    const [roomId, setRoomId] = useState(null);
    const [roomData, setRoomData] = useState(null);
    const [players, setPlayers] = useState([]);
    const [wordPacks, setWordPacks] = useState([]);
    const [selectedPackId, setSelectedPackId] = useState('');
    
    // Nuevo estado para la cantidad de impostores
    const [impostorCount, setImpostorCount] = useState(1);

    const [newPlayerName, setNewPlayerName] = useState('');

    // --- 1. Inicialización de Firebase + Persistencia de Auth ---
    useEffect(() => {
        if (Object.keys(firebaseConfig).length === 0) return;
        const app = initializeApp(firebaseConfig);
        const firestore = getFirestore(app);
        const firebaseAuth = getAuth(app);
        setDb(firestore);
        setAuth(firebaseAuth);

        const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                try {
                    if (initialAuthToken) await signInWithCustomToken(firebaseAuth, initialAuthToken);
                    else await signInAnonymously(firebaseAuth);
                } catch (error) {
                    console.error("Error en autenticación:", error);
                    setError("Error de autenticación. Intenta recargar.");
                }
            }
            setIsAuthReady(true);
        });
        return () => unsubscribe();
    }, []);

    // --- 2. Persistencia de Sesión (Recuperar sala al recargar) ---
    useEffect(() => {
        if (isAuthReady && userId && view === 'HOME') {
            const savedRoomId = localStorage.getItem('impostor_roomId');
            const savedUserName = localStorage.getItem('impostor_userName');

            if (savedRoomId && savedUserName) {
                console.log("Sesión encontrada, reconectando...", savedRoomId);
                setUserName(savedUserName);
                setRoomId(savedRoomId);
            } else {
                setLoading(false);
            }
        }
    }, [isAuthReady, userId, view]);

    // --- 3. Cargar Packs (Se ejecuta al conectar DB) ---
    const seedWordPacks = useCallback(async (firestore) => {
        const packsRef = collection(firestore, getWordPacksCollectionPath());
        const snapshot = await getDocs(query(packsRef));
        const remotePackIds = new Set(snapshot.docs.map(doc => doc.id));
        const missingPacks = INITIAL_WORD_PACKS.filter(pack => !remotePackIds.has(pack.id));

        if (missingPacks.length > 0) {
            console.log(`Cargando ${missingPacks.length} pack(s) nuevos...`);
            const batch = writeBatch(firestore);
            missingPacks.forEach(pack => batch.set(doc(packsRef, pack.id), pack));
            try { await batch.commit(); } catch (e) { console.error("Error cargando packs:", e); }
        }
    }, []);

    // --- 4. Gestión de Estado Local y Salida ---
    const resetLocalState = useCallback(() => {
        setView('HOME'); 
        setRoomId(null); 
        setRoomData(null); 
        setPlayers([]); 
        setError(null);
        setImpostorCount(1);
        localStorage.removeItem('impostor_roomId');
        localStorage.removeItem('impostor_userName');
    }, []);

    const handleLeaveRoom = useCallback(async () => {
        if (!db || !userId || !roomId) {
            resetLocalState();
            return;
        }
        setLoading(true);
        const roomDocRef = doc(db, getRoomDocPath(roomId));
        const roomSnap = await getDoc(roomDocRef);
        const currentRoomData = roomSnap.data();

        try {
            if (currentRoomData && currentRoomData.hostId === userId) {
                console.log("Cerrando la sala como Host...");
                const playersRef = collection(db, getPlayersCollectionPath(roomId));
                const playersSnap = await getDocs(playersRef);
                const batch = writeBatch(db);
                playersSnap.docs.forEach(playerDoc => batch.delete(playerDoc.ref));
                await batch.commit();
                await deleteDoc(roomDocRef);
            } else {
                console.log("Saliendo de la sala como Jugador...");
                const playerRef = doc(db, getPlayerDocPath(roomId, userId));
                await deleteDoc(playerRef);
            }
        } catch (error) { console.error("Error al salir:", error); }
        
        resetLocalState();
        setLoading(false);
    }, [db, userId, roomId, resetLocalState]);

    // --- 5. Listeners de Datos (Packs) ---
    useEffect(() => {
        if (!db || !isAuthReady) return;
        seedWordPacks(db);
        const packsRef = collection(db, getWordPacksCollectionPath());
        const unsubscribePacks = onSnapshot(packsRef, (snapshot) => {
            const packs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setWordPacks(packs);
            if (packs.length > 0 && !selectedPackId) setSelectedPackId(packs[0].id);
        }, (error) => console.error("Error fetching word packs:", error));
        return () => unsubscribePacks();
    }, [db, isAuthReady, seedWordPacks]);

    // --- 6. Listeners de Sala y Jugadores ---
    useEffect(() => {
        if (!db || !roomId) return;

        const roomRef = doc(db, getRoomDocPath(roomId));
        const unsubscribeRoom = onSnapshot(roomRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setRoomData(data);
                if (view === 'HOME' && userId) {
                    if (data.hostId === userId) setView('HOST');
                    else setView('PLAYER');
                    setLoading(false);
                }
            } else {
                console.log("La sala ya no existe.");
                resetLocalState();
            }
        }, (error) => { console.error("Error sala:", error); handleLeaveRoom(); });

        const playersRef = collection(db, getPlayersCollectionPath(roomId));
        const unsubscribePlayers = onSnapshot(playersRef, (snapshot) => {
            setPlayers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (error) => console.error("Error jugadores:", error));

        return () => { unsubscribeRoom(); unsubscribePlayers(); };
    }, [db, roomId, userId, view, resetLocalState, handleLeaveRoom]); 

    // --- 7. Lógica de Votación (Host) ---
    useEffect(() => {
        if (!db || !roomId || !roomData || roomData.hostId !== userId) return;
        if (roomData.revealRequest?.status === 'pending') {
            const nonHostPlayers = players.filter(p => p.id !== userId);
            if (nonHostPlayers.length === 0) {
                 updateDoc(doc(db, getRoomDocPath(roomId)), { "revealRequest.status": 'approved' });
                 return;
            }
            const allApproved = nonHostPlayers.every(p => p.vote === 'approved');
            const anyDenied = nonHostPlayers.some(p => p.vote === 'denied');

            if (anyDenied) {
                updateDoc(doc(db, getRoomDocPath(roomId)), { revealRequest: { status: 'denied', requestedBy: null } });
                const batch = writeBatch(db);
                players.forEach(p => batch.update(doc(db, getPlayerDocPath(roomId, p.id)), { vote: null }));
                batch.commit();
            } else if (allApproved) {
                updateDoc(doc(db, getRoomDocPath(roomId)), { "revealRequest.status": 'approved' });
            }
        }
    }, [players, roomData, userId, db, roomId]);

    // --- ACCIONES DEL JUEGO ---

    const handleCreateRoom = async () => {
        if (!db || !userId || !userName) return;
        setLoading(true); setError(null);
        
        // --- CAMBIO: Código de 2 dígitos (10 a 99) ---
        const newRoomId = Math.floor(10 + Math.random() * 90).toString();
        
        localStorage.setItem('impostor_roomId', newRoomId);
        localStorage.setItem('impostor_userName', userName);

        const roomRef = doc(db, getRoomDocPath(newRoomId));
        const playerRef = doc(db, getPlayerDocPath(newRoomId, userId));
        
        const newRoomData = { 
            hostId: userId, hostName: userName, status: 'SETUP', 
            selectedPackId: wordPacks.length > 0 ? wordPacks[0].id : '', 
            createdAt: new Date().toISOString(),
            revealRequest: { status: 'idle', requestedBy: null },
            impostorIds: []
        };
        const hostPlayerData = { name: userName, role: null, word: null, vote: null };
        
        try {
            const batch = writeBatch(db);
            batch.set(roomRef, newRoomData); batch.set(playerRef, hostPlayerData);
            await batch.commit();
            setRoomId(newRoomId); setSelectedPackId(newRoomData.selectedPackId); setView('HOST');
        } catch (error) { console.error(error); setError("Error creando sala."); }
        setLoading(false);
    };

    const handleJoinRoom = async () => {
        if (!db || !userId || !userName || !inputRoomId) return;
        setLoading(true); setError(null);
        const roomRef = doc(db, getRoomDocPath(inputRoomId));
        const roomSnap = await getDoc(roomRef);
        
        if (!roomSnap.exists()) { setError("Sala no existe."); setLoading(false); return; }
        
        localStorage.setItem('impostor_roomId', inputRoomId);
        localStorage.setItem('impostor_userName', userName);

        const playerRef = doc(db, getPlayerDocPath(inputRoomId, userId));
        const playerSnap = await getDoc(playerRef);
        
        if (!playerSnap.exists()) {
             await setDoc(playerRef, { name: userName, role: null, word: null, vote: null });
        } else {
             await updateDoc(playerRef, { name: userName });
        }
        
        setRoomId(inputRoomId); setView('PLAYER');
        setLoading(false);
    };

    const handleAddPlayerManually = async () => {
        if (!db || !roomId || !newPlayerName.trim() || roomData?.hostId !== userId) return;
        const fakeUserId = `manual_${crypto.randomUUID()}`;
        const playerRef = doc(db, getPlayerDocPath(roomId, fakeUserId));
        try {
            await setDoc(playerRef, { name: newPlayerName.trim(), role: null, word: null, vote: null });
            setNewPlayerName('');
        } catch (error) { console.error(error); }
    };
    
    const handleRemovePlayer = async (playerIdToRemove) => {
        if (!db || !roomId || roomData?.hostId !== userId || playerIdToRemove === userId) return;
        try { await deleteDoc(doc(db, getPlayerDocPath(roomId, playerIdToRemove))); } catch (e) {console.error(e);}
    };

    const handleStartGame = async () => {
        if (!db || !roomId || !roomData || !selectedPackId || players.length < 3) return;
        setLoading(true); 
        
        const currentPack = wordPacks.find(p => p.id === selectedPackId);
        if (!currentPack || currentPack.words.length === 0) return;
        
        const secretWord = currentPack.words[Math.floor(Math.random() * currentPack.words.length)];
        
        const availableIndexes = players.map((_, i) => i);
        for (let i = availableIndexes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableIndexes[i], availableIndexes[j]] = [availableIndexes[j], availableIndexes[i]];
        }
        
        const actualImpostorCount = Math.min(impostorCount, players.length - 1);
        const impostorIndexes = new Set(availableIndexes.slice(0, actualImpostorCount));
        
        const newImpostorIds = [];

        try {
            const batch = writeBatch(db);
            players.forEach((player, index) => {
                const playerRef = doc(db, getPlayerDocPath(roomId, player.id));
                const isImpostor = impostorIndexes.has(index);
                if (isImpostor) newImpostorIds.push(player.id);

                batch.update(playerRef, { 
                    role: isImpostor ? 'Impostor' : 'Ciudadano', 
                    word: isImpostor ? 'Impostor' : secretWord,
                    vote: null 
                });
            });
            
            const roomRef = doc(db, getRoomDocPath(roomId));
            batch.update(roomRef, { 
                status: 'STARTED', 
                selectedPackName: currentPack.name, 
                impostorIds: newImpostorIds, 
                impostorId: newImpostorIds[0], 
                secretWord: secretWord,
                revealRequest: { status: 'idle', requestedBy: null }
            });
            await batch.commit();
        } catch (error) { console.error("Error start:", error); }
        setLoading(false);
    };

    const handleResetGame = async () => {
        if (!db || !roomId || (roomData && roomData.hostId !== userId)) return;
        setLoading(true);
        try {
            const batch = writeBatch(db);
            players.forEach(player => {
                batch.update(doc(db, getPlayerDocPath(roomId, player.id)), { role: null, word: null, vote: null });
            });
            batch.update(doc(db, getRoomDocPath(roomId)), { 
                status: 'SETUP', impostorId: null, impostorIds: [], secretWord: null, selectedPackName: null, revealRequest: { status: 'idle', requestedBy: null } 
            });
            await batch.commit();
        } catch (error) { console.error(error); }
        setLoading(false);
    };

    const handleRequestReveal = async () => {
        if (!db || !roomId || !userId) return;
        const batch = writeBatch(db);
        players.forEach(p => { if (p.id !== userId) batch.update(doc(db, getPlayerDocPath(roomId, p.id)), { vote: null }); });
        await batch.commit();
        await updateDoc(doc(db, getRoomDocPath(roomId)), { revealRequest: { status: 'pending', requestedBy: userId } });
    };
    
    const handleCancelReveal = async () => {
        if (!db || !roomId) return;
        await updateDoc(doc(db, getRoomDocPath(roomId)), { revealRequest: { status: 'idle', requestedBy: null } });
        const batch = writeBatch(db);
        players.forEach(p => batch.update(doc(db, getPlayerDocPath(roomId, p.id)), { vote: null }));
        await batch.commit();
    };

    const handlePlayerVote = async (vote) => {
        if (!db || !roomId || !userId) return;
        await updateDoc(doc(db, getPlayerDocPath(roomId, userId)), { vote: vote });
    };

    // --- VISTAS ---
    const renderLoading = () => (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, p: 3 }}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>Cargando...</Typography>
        </Box>
    );

    const renderError = () => (
        <Alert severity="error" onClose={() => setError(null)} sx={{ m: 2 }}>{error}</Alert>
    );

    const renderHome = () => (
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {error && renderError()}
            <Typography variant="h3" component="h2" align="center" gutterBottom>¡Bienvenido!</Typography>
            <TextField id="name" label="Tu Nombre" value={userName} onChange={(e) => setUserName(e.target.value)} variant="outlined" fullWidth />
            
            <Paper elevation={2} sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h5" component="h3">Crear una Sala</Typography>
                <Button onClick={handleCreateRoom} disabled={!userName || loading} variant="contained" size="large" startIcon={<Add />}>
                    Crear Nueva Sala
                </Button>
            </Paper>
            
            <Paper elevation={2} sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h5" component="h3">Unirse a una Sala</Typography>
                <TextField id="room-id" label="Código de Sala" placeholder="Ingresa el Código (ej. 12)" value={inputRoomId} onChange={(e) => setInputRoomId(e.target.value)} variant="outlined" fullWidth />
                <Button onClick={handleJoinRoom} disabled={!userName || !inputRoomId || loading} variant="contained" color="secondary" size="large" startIcon={<Login />}>
                    Unirse a Sala
                </Button>
            </Paper>
        </Box>
    );

    const renderHost = () => {
        if (!roomData) return renderLoading();
        const canStart = players.length >= 3 && selectedPackId;
        const me = players.find(p => p.id === userId);
        const impostorNames = players
            .filter(p => roomData.impostorIds?.includes(p.id))
            .map(p => p.name)
            .join(', ');

        return (
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {error && renderError()}
                <Paper elevation={4} sx={{ p: 3, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
                    <Typography sx={{ textTransform: 'uppercase', letterSpacing: 2, opacity: 0.7 }}>Código para unirse</Typography>
                    <Typography variant="h2" component="p" sx={{ fontWeight: 'black', letterSpacing: '0.1em' }}>{roomId}</Typography>
                </Paper>
                <Button onClick={handleLeaveRoom} variant="contained" color="error" startIcon={<Logout />}>Cerrar Sala</Button>
                
                {roomData.status === 'SETUP' ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel id="word-pack-label">Pack de Palabras</InputLabel>
                            <Select labelId="word-pack-label" id="word-pack" value={selectedPackId} label="Pack de Palabras"
                                onChange={(e) => {
                                    const newPackId = e.target.value;
                                    setSelectedPackId(newPackId);
                                    updateDoc(doc(db, getRoomDocPath(roomId)), { selectedPackId: newPackId });
                                }}
                            >
                                {wordPacks.map(pack => (
                                    <MenuItem key={pack.id} value={pack.id}>{pack.name} ({pack.words.length} palabras)</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Box sx={{ px: 1 }}>
                            <Typography gutterBottom>
                                Cantidad de Impostores: <strong>{impostorCount}</strong>
                            </Typography>
                            <Slider
                                value={impostorCount}
                                onChange={(e, val) => setImpostorCount(val)}
                                step={1}
                                marks
                                min={1}
                                max={Math.max(1, Math.floor(players.length / 2))}
                                valueLabelDisplay="auto"
                            />
                        </Box>
                        
                        <Button onClick={handleStartGame} disabled={!canStart || loading} variant="contained" color="secondary" size="large" startIcon={<PlayArrow />} sx={{ py: 2, fontSize: '1.25rem' }}>
                            ¡Iniciar Partida!
                        </Button>
                        {!canStart && <Typography align="center" color="error" sx={{ mt: -2 }}>Se necesitan 3 o más jugadores.</Typography>}
                    </Box>
                ) : ( 
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <PlayerAssignment player={me} />
                        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                            <Typography variant="h6" component="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                <Key /> Panel de Administrador
                            </Typography>
                            {(!roomData.revealRequest || roomData.revealRequest.status === 'idle') && (
                                <Button onClick={handleRequestReveal} variant="outlined" startIcon={<Lock />}>ADMIN: Solicitar Ver Respuestas</Button>
                            )}
                            {roomData.revealRequest?.status === 'pending' && (
                                <Box>
                                    <CircularProgress size={20} sx={{ mr: 2 }} />
                                    <Typography component="span" variant="body1" color="text.secondary">Esperando autorización...</Typography>
                                    <Button onClick={handleCancelReveal} variant="text" color="error" size="small" sx={{mt: 1}}>Cancelar Solicitud</Button>
                                </Box>
                            )}
                            {roomData.revealRequest?.status === 'denied' && (
                                <Box>
                                    <Alert severity="error" sx={{ mb: 2 }}>Solicitud denegada.</Alert>
                                    <Button onClick={handleRequestReveal} variant="outlined" startIcon={<Lock />}>Volver a Solicitar</Button>
                                </Box>
                            )}
                            {roomData.revealRequest?.status === 'approved' && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2, p: 2, border: '1px solid', borderColor: 'success.main', borderRadius: 2 }}>
                                    <Alert severity="success">¡Solicitud Aprobada!</Alert>
                                    <Typography variant="h6">Palabra: <strong style={{color: theme.palette.primary.main}}>{roomData.secretWord}</strong></Typography>
                                    <Typography variant="h6">Impostores: <strong style={{color: theme.palette.error.main}}>{impostorNames}</strong></Typography>
                                </Box>
                            )}
                        </Paper>
                        <Button onClick={handleResetGame} disabled={loading} variant="contained" startIcon={<Refresh />}>Jugar de Nuevo</Button>
                    </Box>
                )}
                
                {roomData.status === 'SETUP' && (
                    <Paper elevation={2} sx={{ p: 2 }}>
                        <Typography variant="h6" component="h4" gutterBottom>Añadir Jugadores Manualmente</Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField label="Nombre del Jugador" value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddPlayerManually()} variant="outlined" size="small" fullWidth />
                            <IconButton color="primary" onClick={handleAddPlayerManually}><Add /></IconButton>
                        </Box>
                    </Paper>
                )}
                
                <Paper elevation={2} sx={{ p: 2 }}>
                    <Typography variant="h6" component="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <People /> Jugadores ({players.length})
                    </Typography>
                    <List dense>
                        {players.map(player => (
                            <ListItem key={player.id} secondaryAction={
                                (roomData.hostId === userId && player.id !== userId && roomData.status === 'SETUP') ? (
                                    <IconButton edge="end" aria-label="delete" onClick={() => handleRemovePlayer(player.id)} color="error"><Delete /></IconButton>
                                ) : (
                                    roomData.revealRequest?.status === 'pending' && player.id !== roomData.hostId && (
                                        player.vote === 'approved' ? <HowToVote color="success" /> :
                                        player.vote === 'denied' ? <Cancel color="error" /> :
                                        <CircularProgress size={20} />
                                    )
                                )
                            }>
                                <ListItemIcon>{player.id === roomData.hostId ? <EmojiEvents sx={{ color: 'orange' }} /> : <Group />}</ListItemIcon>
                                {/* CORRECCIÓN: word-break para nombres largos en lista */}
                                <ListItemText 
                                    primary={player.name} 
                                    primaryTypographyProps={{ 
                                        fontWeight: player.id === userId ? 'bold' : 'normal', 
                                        color: player.id === userId ? 'primary.main' : 'text.primary',
                                        style: { wordBreak: 'break-word' } 
                                    }} 
                                />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            </Box>
        );
    };

    const renderPlayer = () => {
        if (!roomData || !players) return renderLoading();
        const me = players.find(p => p.id === userId);
        const showVoteDialog = roomData.revealRequest?.status === 'pending' && me && !me.vote && me.id !== roomData.hostId;

        return (
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {error && renderError()}
                
                {/* CORRECCIÓN: flex container para título de sala */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                    {/* CORRECCIÓN: permitir wrap y break-word para el nombre de sala */}
                    <Typography variant="h5" component="h2" sx={{ flex: 1, wordBreak: 'break-word' }}>
                        Sala de: <span style={{fontWeight: 'bold'}}>{roomData.hostName}</span>
                    </Typography>
                    <Button onClick={handleLeaveRoom} variant="contained" color="error" size="small" startIcon={<Logout />} sx={{ flexShrink: 0 }}>Salir</Button>
                </Box>
                
                {roomData.status === 'SETUP' ? (
                    <Paper elevation={3} sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.100' }}>
                        <CircularProgress sx={{ mb: 3 }} />
                        <Typography variant="h4" component="h3" gutterBottom>Esperando al Anfitrión</Typography>
                        <Typography variant="body1" color="text.secondary">El anfitrión está preparando la partida...</Typography>
                    </Paper>
                ) : ( <PlayerAssignment player={me} /> )}

                <Paper elevation={2} sx={{ p: 2 }}>
                    <Typography variant="h6" component="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <People /> Jugadores ({players.length})
                    </Typography>
                    <List dense>
                        {players.map(player => (
                            <ListItem key={player.id}>
                                <ListItemIcon>{player.id === roomData.hostId ? <EmojiEvents sx={{ color: 'orange' }} /> : <Group />}</ListItemIcon>
                                {/* CORRECCIÓN: word-break para nombres largos en lista */}
                                <ListItemText 
                                    primary={player.name} 
                                    primaryTypographyProps={{ 
                                        fontWeight: player.id === userId ? 'bold' : 'normal', 
                                        color: player.id === userId ? 'primary.main' : 'text.primary',
                                        style: { wordBreak: 'break-word' } 
                                    }} 
                                />
                            </ListItem>
                        ))}
                    </List>
                </Paper>

                <Dialog open={showVoteDialog} aria-labelledby="vote-dialog-title" aria-describedby="vote-dialog-description">
                    <DialogTitle id="vote-dialog-title"><HowToVote sx={{ mr: 1, verticalAlign: 'middle' }}/>Solicitud del Anfitrión</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="vote-dialog-description">
                            El anfitrión ({roomData.hostName}) quiere ver las respuestas.<br/><br/>
                            **¿Autorizas esta acción?** (Se requiere aprobación unánime)
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => handlePlayerVote('denied')} variant="contained" color="error" autoFocus>Rechazar</Button>
                        <Button onClick={() => handlePlayerVote('approved')} variant="contained" color="secondary">Aprobar</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        );
    };

    const renderView = () => {
        if (loading && !isAuthReady) return renderLoading();
        if (view !== 'HOME' && !roomData && !loading) return renderHome(); 
        switch(view) {
            case 'HOST': return renderHost();
            case 'PLAYER': return renderPlayer();
            case 'HOME': default: return renderHome();
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Container maxWidth="md" sx={{ my: 4 }}>
                <Paper elevation={6} sx={{ borderRadius: 4, overflow: 'hidden' }}>
                    <AppBar position="static" color="primary" sx={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
                        <Toolbar>
                            {view !== 'HOME' && (
                                <IconButton edge="start" color="inherit" onClick={handleLeaveRoom} sx={{ mr: 1 }} title="Volver al Inicio"><Home /></IconButton>
                            )}
                            <Typography variant="h6" component="h1" sx={{ flexGrow: 1, textAlign: view === 'HOME' ? 'center' : 'left', fontWeight: 'bold' }}>El Juego del Impostor</Typography>
                        </Toolbar>
                    </AppBar>
                    <Box component="main">{renderView()}</Box>
                </Paper>
            </Container>
        </ThemeProvider>
    );
};

export default App;