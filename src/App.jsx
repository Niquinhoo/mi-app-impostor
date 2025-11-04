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
    updateDoc // ¡Importante! Añadimos updateDoc
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
    // --- ¡Nuevos Imports para Votación! ---
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
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
    Lock, // Icono para el botón de admin
    HowToVote, // Icono para votar
    Cancel // Icono para cancelar
} from '@mui/icons-material';

// --- CONFIGURACIÓN DE FIREBASE (igual) ---
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
const INITIAL_WORD_PACKS = [
    { id: 'comida', name: 'Comida Deliciosa', words: ['Taco', 'Pizza', 'Sushi', 'Hamburguesa', 'Ensalada', 'Sopa', 'Postre'] },
    { id: 'animales', name: 'Animales Salvajes', words: ['León', 'Tigre', 'Elefante', 'Jirafa', 'Mono', 'Delfín', 'Oso'] },
    { id: 'hogar', name: 'Objetos del Hogar', words: ['Sofá', 'Ventana', 'Mesa', 'Refrigerador', 'Lámpara', 'Espejo', 'Cama'] },
    { 
      id: 'futbol', 
      name: 'Jugadores de Fútbol', 
      words: [
        "Messi", "Luis Suarez", "Florian Wirtz", "Vini", "Neymar", "De paul", 
        "Chango zeballos", "Mastantuono", "Garnacho", "Merentiel", "Colo barco", 
        "Isak", "Borja", "Pipa higuain", "Luis diaz", "Harry kane", "Mbappe", 
        "Thiago Alcantara", "Iñigo Martinez", "Ter stegen", "Estevao", 
        "Enzo Fernandez", "Sterling", "Pulisic", "Reus", "Valverde", 
        "Van der sar", "Maradona", "James", "Antony", "Pique", "Rooney", 
        "Dybala", "Pepe Sand", "Van dijk", "Alexander Arnold", "Darwin nunez", 
        "Zidane", "Kempes", "Cruyff", "Thomas Muller"
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
    }
];

// --- RUTAS DE FIRESTORE (igual) ---
const getWordPacksCollectionPath = () => `artifacts/${appId}/public/data/word_packs`;
const getRoomsCollectionPath = () => `artifacts/${appId}/public/data/impostor_rooms`;
const getRoomDocPath = (roomId) => `${getRoomsCollectionPath()}/${roomId}`;
const getPlayersCollectionPath = (roomId) => `${getRoomDocPath(roomId)}/players`;
const getPlayerDocPath = (roomId, userId) => `${getPlayersCollectionPath(roomId)}/${userId}`;

// --- TEMA DE MUI (igual) ---
const theme = createTheme({
    palette: {
        primary: {
            main: '#e58e46ff', // Indigo
        },
        secondary: {
            main: '#10b924ff', // Green
        },
        background: {
            default: '#f3f4f6', // Gray 100
        },
    },
    typography: {
        fontFamily: 'Inter, sans-serif',
        h1: { fontWeight: 900 },
        h2: { fontWeight: 800 },
        h3: { fontWeight: 700 },
    },
});

// --- COMPONENTE ASIGNACIÓN DE JUGADOR (igual) ---
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
                maxWidth: 'md',
                mx: 'auto',
                borderRadius: 4,
                p: 4,
                transition: 'all 0.3s',
                backgroundColor: show ? (isImpostor ? 'error.dark' : 'success.dark') : 'primary.dark',
                color: 'white'
            }}
        >
            <Typography variant="h6" component="p" align="center" gutterBottom sx={{ textTransform: 'uppercase', letterSpacing: 2, opacity: 0.8 }}>
                Tu Asignación
            </Typography>
            
            {show ? (
                <Box textAlign="center">
                    <Typography variant="h2" component="p" sx={{ fontWeight: 'black', mb: 2, animation: 'pulse 1.5s infinite' }}>
                        {player.word}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3 }}>
                        {isImpostor 
                            ? "¡Tu misión es fingir que sabes la palabra!"
                            : "¡Encuentra al impostor que no sabe esta palabra!"}
                    </Typography>
                    <Button
                        onClick={() => setShow(false)}
                        variant="contained"
                        size="large"
                        sx={{ bgcolor: 'white', color: 'primary.dark', '&:hover': { bgcolor: 'grey.200' } }}
                        startIcon={<VisibilityOff />}
                    >
                        Ocultar
                    </Button>
                </Box>
            ) : (
                <Box textAlign="center">
                    <Typography variant="h3" component="p" sx={{ fontWeight: 'bold', mb: 4 }}>
                        ¿Quién soy?
                    </Typography>
                    <Button
                        onClick={() => setShow(true)}
                        variant="contained"
                        size="large"
                        sx={{ bgcolor: 'white', color: 'primary.dark', transform: 'scale(1.05)', '&:hover': { bgcolor: 'grey.200', transform: 'scale(1.1)' } }}
                        startIcon={<Visibility />}
                    >
                        Ver mi Rol
                    </Button>
                </Box>
            )}
            
            {/* Keyframes para la animación de pulso */}
            <style>
                {`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                `}
            </style>
        </Paper>
    );
};
// --- ¡AQUÍ TERMINA PlayerAssignment, ESTA VEZ SIN ERRORES! ---

// --- COMPONENTE PRINCIPAL (Modificado) ---
const App = () => {
    // --- Estado de Firebase (igual) ---
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    // --- Estado de la App (igual) ---
    const [view, setView] = useState('HOME'); // HOME, HOST, PLAYER
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userName, setUserName] = useState('');
    const [inputRoomId, setInputRoomId] = useState('');

    // --- Estado del Juego (Sincronizado) (igual) ---
    const [roomId, setRoomId] = useState(null);
    const [roomData, setRoomData] = useState(null); // Doc de la sala
    const [players, setPlayers] = useState([]); // Sub-colección de jugadores
    const [wordPacks, setWordPacks] = useState([]);
    const [selectedPackId, setSelectedPackId] = useState('');

    const [newPlayerName, setNewPlayerName] = useState('');

    // --- 1. Inicialización de Firebase (igual) ---
    useEffect(() => {
        if (Object.keys(firebaseConfig).length === 0) {
            console.error("Firebase config is missing.");
            setError("Error de configuración. No se pudo cargar Firebase.");
            return;
        }
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
                    if (initialAuthToken) {
                        await signInWithCustomToken(firebaseAuth, initialAuthToken);
                    } else {
                        await signInAnonymously(firebaseAuth);
                    }
                } catch (error) {
                    console.error("Error en autenticación:", error);
                    setError("Error de autenticación. Intenta recargar.");
                }
            }
            setIsAuthReady(true);
        });
        return () => unsubscribe();
    }, []);

    // --- 2. "Backend Setup": Cargar Packs (igual) ---
    const seedWordPacks = useCallback(async (firestore) => {
        console.log("Verificando packs de palabras...");
        const packsRef = collection(firestore, getWordPacksCollectionPath());
        const snapshot = await getDocs(query(packsRef));
        
        // Obtenemos los IDs de los packs que YA están en la base de datos
        const remotePackIds = new Set(snapshot.docs.map(doc => doc.id));
        
        // Filtramos los packs locales que FALTAN en la base de datos
        const missingPacks = INITIAL_WORD_PACKS.filter(pack => !remotePackIds.has(pack.id));

        if (missingPacks.length > 0) {
            console.log(`Cargando ${missingPacks.length} pack(s) de palabras nuevos...`);
            const batch = writeBatch(firestore);
            missingPacks.forEach(pack => {
                const docRef = doc(packsRef, pack.id);
                batch.set(docRef, pack);
            });
            try { 
                await batch.commit(); 
                console.log("¡Nuevos packs cargados!");
            } catch (e) { 
                console.error("Error cargando nuevos packs:", e); 
            }
        } else {
            console.log("Todos los packs de palabras están actualizados.");
        }
    }, []); 
    // --- 3. Cargar datos (Packs y Listeners) ---
    
    // --- ¡CORRECCIÓN! ---
    // resetLocalState ahora está envuelto en useCallback para estabilizarlo
    const resetLocalState = useCallback(() => {
        setView('HOME'); 
        setRoomId(null); 
        setRoomData(null); 
        setPlayers([]); 
        setError(null);
    }, []); // Sin dependencias

    // --- ¡CORRECCIÓN! ---
    // handleLeaveRoom actualizado para no depender de `roomData` y corregir la lógica de borrado
    const handleLeaveRoom = useCallback(async () => {
        if (!db || !userId || !roomId) {
            resetLocalState();
            return;
        }
        setLoading(true);

        // Obtenemos los datos de la sala en este momento, en lugar de depender del estado
        const roomDocRef = doc(db, getRoomDocPath(roomId));
        const roomSnap = await getDoc(roomDocRef);
        const currentRoomData = roomSnap.data();

        try {
            if (currentRoomData && currentRoomData.hostId === userId) {
                console.log("Cerrando la sala como Host...");
                
                // --- ¡LÓGICA CORREGIDA! ---
                // 1. Borrar jugadores PRIMERO
                const playersRef = collection(db, getPlayersCollectionPath(roomId));
                const playersSnap = await getDocs(playersRef);
                const batch = writeBatch(db);
                playersSnap.docs.forEach(playerDoc => batch.delete(playerDoc.ref));
                await batch.commit();

                // 2. Borrar la sala DESPUÉS
                await deleteDoc(roomDocRef);

            } else {
                console.log("Saliendo de la sala como Jugador...");
                const playerRef = doc(db, getPlayerDocPath(roomId, userId));
                await deleteDoc(playerRef);
            }
        } catch (error) { console.error("Error al salir de la sala:", error); }
        
        resetLocalState(); // Función memoizada
        setLoading(false);
    }, [db, userId, roomId, resetLocalState]); // Ya no depende de roomData


    // --- ¡CORRECCIÓN! ---
    // useEffect dividido en dos: uno para los packs, otro para la sala.
    
    // useEffect para Cargar Packs de Palabras
    useEffect(() => {
        if (!db || !isAuthReady) return;
        seedWordPacks(db);
        const packsRef = collection(db, getWordPacksCollectionPath());
        const unsubscribePacks = onSnapshot(packsRef, (snapshot) => {
            const packs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setWordPacks(packs);
            if (packs.length > 0 && !selectedPackId) {
                setSelectedPackId(packs[0].id); // Solo se ejecuta la primera vez
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching word packs:", error);
            setError("No se pudieron cargar los packs de palabras.");
        });

        return () => unsubscribePacks();
    }, [db, isAuthReady, seedWordPacks]); // Ya no depende de selectedPackId

    // useEffect para Listeners de Sala y Jugadores
    useEffect(() => {
        // Si no hay sala, no hacer nada y limpiar estados.
        if (!db || !roomId) {
            setRoomData(null);
            setPlayers([]);
            return;
        }

        // 1. Listener de la Sala
        const roomRef = doc(db, getRoomDocPath(roomId));
        const unsubscribeRoom = onSnapshot(roomRef, (docSnap) => {
            if (docSnap.exists()) {
                setRoomData(docSnap.data());
            } else {
                console.log("La sala fue eliminada.");
                resetLocalState(); // La sala fue borrada por el Host
            }
        }, (error) => {
            console.error("Error escuchando la sala:", error); 
            handleLeaveRoom(); // Llamar a la función memoizada
        });

        // 2. Listener de Jugadores
        const playersRef = collection(db, getPlayersCollectionPath(roomId));
        const unsubscribePlayers = onSnapshot(playersRef, (snapshot) => {
            setPlayers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (error) => console.error("Error escuchando jugadores:", error));

        // Función de limpieza
        return () => { 
            unsubscribeRoom(); 
            unsubscribePlayers(); 
        };
    }, [db, roomId, resetLocalState, handleLeaveRoom]); // Depende solo de db, roomId y las funciones memoizadas
    

    // --- ¡NUEVO! useEffect para Contar Votos (SOLO EL HOST) ---
    useEffect(() => {
        if (!db || !userId || !roomId || !roomData || roomData.hostId !== userId) {
            return; // Solo el host cuenta los votos
        }

        // Si la votación está pendiente...
        if (roomData.revealRequest?.status === 'pending') {
            const nonHostPlayers = players.filter(p => p.id !== userId);
            
            if (nonHostPlayers.length === 0) {
                 // No hay nadie más para votar, aprobar automáticamente
                 updateDoc(doc(db, getRoomDocPath(roomId)), { "revealRequest.status": 'approved' });
                 return;
            }

            const allApproved = nonHostPlayers.every(p => p.vote === 'approved');
            const anyDenied = nonHostPlayers.some(p => p.vote === 'denied');

            if (anyDenied) {
                console.log("Votación denegada");
                // Alguien denegó. Resetear la votación.
                updateDoc(doc(db, getRoomDocPath(roomId)), { 
                    revealRequest: { status: 'denied', requestedBy: null } 
                });
                // Limpiar los votos de los jugadores para la próxima vez
                const batch = writeBatch(db);
                players.forEach(p => {
                    batch.update(doc(db, getPlayerDocPath(roomId, p.id)), { vote: null });
                });
                batch.commit();

            } else if (allApproved) {
                console.log("Votación aprobada");
                // Todos aprobaron.
                updateDoc(doc(db, getRoomDocPath(roomId)), { "revealRequest.status": 'approved' });
            }
            // Si no, sigue pendiente...
        }
    }, [players, roomData, userId, db, roomId]); // Se ejecuta cada vez que los jugadores o la sala cambian


    // --- 4. Lógica de la Aplicación (Acciones) ---

    // handleCreateRoom (Actualizado para incluir estado de votación)
    const handleCreateRoom = async () => {
        if (!db || !userId || !userName) { setError("Debes ingresar un nombre para crear una sala."); return; }
        setLoading(true); setError(null);
        const newRoomId = Math.floor(100000 + Math.random() * 900000).toString();
        const roomRef = doc(db, getRoomDocPath(newRoomId));
        const playerRef = doc(db, getPlayerDocPath(newRoomId, userId));
        
        const newRoomData = { 
            hostId: userId, 
            hostName: userName, 
            status: 'SETUP', 
            selectedPackId: wordPacks.length > 0 ? wordPacks[0].id : '', 
            createdAt: new Date().toISOString(),
            revealRequest: { status: 'idle', requestedBy: null } // Estado inicial de votación
        };
        const hostPlayerData = { 
            name: userName, 
            role: null, 
            word: null,
            vote: null // Estado inicial de votación
        };
        
        try {
            const batch = writeBatch(db);
            batch.set(roomRef, newRoomData); batch.set(playerRef, hostPlayerData);
            await batch.commit();
            setRoomId(newRoomId); setSelectedPackId(newRoomData.selectedPackId); setView('HOST');
        } catch (error) { console.error("Error creando la sala:", error); setError("No se pudo crear la sala."); }
        setLoading(false);
    };

    // handleJoinRoom (Actualizado para incluir estado de votación)
    const handleJoinRoom = async () => {
        if (!db || !userId || !userName || !inputRoomId) { setError("Nombre y Código de Sala son requeridos."); return; }
        setLoading(true); setError(null);
        const roomRef = doc(db, getRoomDocPath(inputRoomId));
        const roomSnap = await getDoc(roomRef);
        if (!roomSnap.exists()) { setError("Esa sala no existe."); setLoading(false); return; }
        if (roomSnap.data().status !== 'SETUP') { setError("Esta partida ya ha comenzado."); setLoading(false); return; }
        
        const playerRef = doc(db, getPlayerDocPath(inputRoomId, userId));
        const newPlayerData = { 
            name: userName, 
            role: null, 
            word: null,
            vote: null // Estado inicial de votación
        };
        
        try {
            await setDoc(playerRef, newPlayerData);
            setRoomId(inputRoomId); setView('PLAYER');
        } catch (error) { console.error("Error uniéndose a la sala:", error); setError("No se pudo unir a la sala."); }
        setLoading(false);
    };

    // --- AÑADIR/QUITAR JUGADOR (Actualizado para incluir 'vote') ---
    const handleAddPlayerManually = async () => {
        if (!db || !roomId || !newPlayerName.trim() || roomData?.hostId !== userId) return;
        
        const fakeUserId = `manual_${crypto.randomUUID()}`;
        const playerName = newPlayerName.trim();
        const playerRef = doc(db, getPlayerDocPath(roomId, fakeUserId));
        const newPlayerData = { name: playerName, role: null, word: null, vote: null };

        try {
            await setDoc(playerRef, newPlayerData);
            setNewPlayerName(''); setError(null);
        } catch (error) {
            console.error("Error añadiendo jugador manualmente:", error);
            setError("No se pudo añadir al jugador.");
        }
    };
    
    const handleRemovePlayer = async (playerIdToRemove) => {
        if (!db || !roomId || roomData?.hostId !== userId || playerIdToRemove === userId) return;
        try {
            const playerRef = doc(db, getPlayerDocPath(roomId, playerIdToRemove));
            await deleteDoc(playerRef);
        } catch (error) {
            console.error("Error eliminando jugador:", error);
            setError("No se pudo eliminar al jugador.");
        }
    };

    // handleStartGame (Actualizado para resetear votos)
    const handleStartGame = async () => {
        if (!db || !roomId || !roomData || !selectedPackId || players.length < 3) { setError("Se necesitan al menos 3 jugadores para empezar."); return; }
        setLoading(true); setError(null);
        const currentPack = wordPacks.find(p => p.id === selectedPackId);
        if (!currentPack || currentPack.words.length === 0) { setError("El pack de palabras está vacío."); setLoading(false); return; }
        
        const secretWord = currentPack.words[Math.floor(Math.random() * currentPack.words.length)];
        const impostor = players[Math.floor(Math.random() * players.length)];
        
        try {
            const batch = writeBatch(db);
            players.forEach(player => {
                const playerRef = doc(db, getPlayerDocPath(roomId, player.id));
                const isImpostor = player.id === impostor.id;
                batch.update(playerRef, { 
                    role: isImpostor ? 'Impostor' : 'Ciudadano', 
                    word: isImpostor ? 'Impostor' : secretWord,
                    vote: null // Reseteamos el voto
                });
            });
            const roomRef = doc(db, getRoomDocPath(roomId));
            batch.update(roomRef, { 
                status: 'STARTED', 
                selectedPackName: currentPack.name, 
                impostorId: impostor.id, 
                secretWord: secretWord,
                revealRequest: { status: 'idle', requestedBy: null } // Reseteamos la votación
            });
            await batch.commit();
        } catch (error) { console.error("Error iniciando el juego:", error); setError("Error al iniciar el juego."); }
        setLoading(false);
    };

    // handleResetGame (Actualizado para resetear votos)
    const handleResetGame = async () => {
        if (!db || !roomId || (roomData && roomData.hostId !== userId)) return;
        setLoading(true); setError(null);
        try {
            const batch = writeBatch(db);
            players.forEach(player => {
                const playerRef = doc(db, getPlayerDocPath(roomId, player.id));
                batch.update(playerRef, { 
                    role: null, 
                    word: null,
                    vote: null // Reseteamos el voto
                });
            });
            const roomRef = doc(db, getRoomDocPath(roomId));
            batch.update(roomRef, { 
                status: 'SETUP', 
                impostorId: null, 
                secretWord: null, 
                selectedPackName: null,
                revealRequest: { status: 'idle', requestedBy: null } // Reseteamos la votación
            });
            await batch.commit();
        } catch (error) { console.error("Error reseteando el juego:", error); setError("No se pudo resetear el juego."); }
        setLoading(false);
    };

    // --- ¡NUEVAS FUNCIONES DE VOTACIÓN! ---
    const handleRequestReveal = async () => {
        if (!db || !roomId || !userId) return;
        setLoading(true);
        // Limpiar votos anteriores
        const batch = writeBatch(db);
        players.forEach(p => {
            if (p.id !== userId) { // No resetear el voto del host
                batch.update(doc(db, getPlayerDocPath(roomId, p.id)), { vote: null });
            }
        });
        await batch.commit();
        
        // Solicitar votación
        const roomRef = doc(db, getRoomDocPath(roomId));
        await updateDoc(roomRef, {
            revealRequest: { status: 'pending', requestedBy: userId }
        });
        setLoading(false);
    };
    
    const handleCancelReveal = async () => {
        if (!db || !roomId) return;
        const roomRef = doc(db, getRoomDocPath(roomId));
        await updateDoc(roomRef, {
            revealRequest: { status: 'idle', requestedBy: null }
        });
        // Limpiar los votos de los jugadores
        const batch = writeBatch(db);
        players.forEach(p => {
            batch.update(doc(db, getPlayerDocPath(roomId, p.id)), { vote: null });
        });
        await batch.commit();
    };

    const handlePlayerVote = async (vote) => {
        if (!db || !roomId || !userId) return;
        const playerRef = doc(db, getPlayerDocPath(roomId, userId));
        await updateDoc(playerRef, { vote: vote });
    };


    // --- 5. Renderizado de Vistas (Adaptado a MUI) ---
    const renderLoading = () => (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, p: 3 }}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>Cargando...</Typography>
        </Box>
    );

    const renderError = () => (
        <Alert severity="error" onClose={() => setError(null)} sx={{ m: 2 }}>
            {error}
        </Alert>
    );

    // VISTA 1: Pantalla de Inicio (HOME) (Sin cambios)
    const renderHome = () => (
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {error && renderError()}
            <Typography variant="h3" component="h2" align="center" gutterBottom>
                ¡Bienvenido!
            </Typography>
            
            <TextField
                id="name"
                label="Tu Nombre"
                placeholder="Ingresa tu nombre..."
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                variant="outlined"
                fullWidth
            />
            
            <Paper elevation={2} sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h5" component="h3">Crear una Sala</Typography>
                <Button
                    onClick={handleCreateRoom}
                    disabled={!userName || loading}
                    variant="contained"
                    size="large"
                    startIcon={<Add />}
                >
                    Crear Nueva Sala
                </Button>
            </Paper>
            
            <Paper elevation={2} sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h5" component="h3">Unirse a una Sala</Typography>
                <TextField
                    id="room-id"
                    label="Código de Sala"
                    placeholder="Ingresa el Código (ej. 123456)"
                    value={inputRoomId}
                    onChange={(e) => setInputRoomId(e.target.value)}
                    variant="outlined"
                    fullWidth
                />
                <Button
                    onClick={handleJoinRoom}
                    disabled={!userName || !inputRoomId || loading}
                    variant="contained"
                    color="secondary"
                    size="large"
                    startIcon={<Login />}
                >
                    Unirse a Sala
                </Button>
            </Paper>
        </Box>
    );

    // VISTA 2: Pantalla del Anfitrión (HOST) (¡MODIFICADA!)
    const renderHost = () => {
        if (!roomData) return renderLoading();
        const canStart = players.length >= 3 && selectedPackId;
        const me = players.find(p => p.id === userId);

        return (
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {error && renderError()}
                
                <Paper elevation={4} sx={{ p: 3, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
                    <Typography sx={{ textTransform: 'uppercase', letterSpacing: 2, opacity: 0.7 }}>Código para unirse</Typography>
                    <Typography variant="h2" component="p" sx={{ fontWeight: 'black', letterSpacing: '0.1em' }}>
                        {roomId}
                    </Typography>
                </Paper>

                <Button onClick={handleLeaveRoom} variant="contained" color="error" startIcon={<Logout />}>
                    Cerrar Sala
                </Button>
                
                {roomData.status === 'SETUP' ? (
                    // --- VISTA DE CONFIGURACIÓN (SETUP) ---
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel id="word-pack-label">Pack de Palabras</InputLabel>
                            <Select
                                labelId="word-pack-label"
                                id="word-pack"
                                value={selectedPackId}
                                label="Pack de Palabras"
                                onChange={(e) => {
                                    const newPackId = e.target.value;
                                    setSelectedPackId(newPackId);
                                    updateDoc(doc(db, getRoomDocPath(roomId)), { selectedPackId: newPackId });
                                }}
                            >
                                {wordPacks.map(pack => (
                                    <MenuItem key={pack.id} value={pack.id}>
                                        {pack.name} ({pack.words.length} palabras)
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        
                        <Button
                            onClick={handleStartGame}
                            disabled={!canStart || loading}
                            variant="contained"
                            color="secondary"
                            size="large"
                            startIcon={<PlayArrow />}
                            sx={{ py: 2, fontSize: '1.25rem' }}
                        >
                            ¡Iniciar Partida!
                        </Button>
                        {!canStart && (
                            <Typography align="center" color="error" sx={{ mt: -2 }}>
                                Se necesitan 3 o más jugadores para empezar.
                            </Typography>
                        )}
                    </Box>
                ) : ( 
                    // --- VISTA DE PARTIDA INICIADA (STARTED) ---
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* 1. El Anfitrión juega como un jugador normal */}
                        <PlayerAssignment player={me} />

                        {/* 2. El nuevo panel de Admin con votación */}
                        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                            <Typography variant="h6" component="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                <Key /> Panel de Administrador
                            </Typography>
                            
                            {/* Lógica de renderizado del botón de admin */}
                            {(!roomData.revealRequest || roomData.revealRequest.status === 'idle') && (
                                <Button onClick={handleRequestReveal} variant="outlined" startIcon={<Lock />}>
                                    ADMIN: Solicitar Ver Respuestas
                                </Button>
                            )}

                            {roomData.revealRequest?.status === 'pending' && (
                                <Box>
                                    <CircularProgress size={20} sx={{ mr: 2 }} />
                                    <Typography component="span" variant="body1" color="text.secondary">
                                        Esperando autorización de jugadores...
                                    </Typography>
                                    <Button onClick={handleCancelReveal} variant="text" color="error" size="small" sx={{mt: 1}}>
                                        Cancelar Solicitud
                                    </Button>
                                </Box>
                            )}
                            
                            {roomData.revealRequest?.status === 'denied' && (
                                <Box>
                                    <Alert severity="error" sx={{ mb: 2 }}>Solicitud denegada por un jugador.</Alert>
                                    <Button onClick={handleRequestReveal} variant="outlined" startIcon={<Lock />}>
                                        Volver a Solicitar
                                    </Button>
                                </Box>
                            )}

                            {roomData.revealRequest?.status === 'approved' && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2, p: 2, border: '1px solid', borderColor: 'success.main', borderRadius: 2 }}>
                                    <Alert severity="success">¡Solicitud Aprobada!</Alert>
                                    <Typography variant="h6">
                                        Palabra Secreta: <strong style={{color: theme.palette.primary.main}}>{roomData.secretWord}</strong>
                                    </Typography>
                                    <Typography variant="h6">
                                        Impostor: <strong style={{color: theme.palette.error.main}}>{players.find(p => p.id === roomData.impostorId)?.name}</strong>
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                        
                        {/* Botón de Jugar de Nuevo (siempre visible para el host) */}
                        <Button onClick={handleResetGame} disabled={loading} variant="contained" startIcon={<Refresh />}>
                            Jugar de Nuevo (Mismos Jugadores)
                        </Button>
                    </Box>
                )}
                
                {/* --- Añadir Jugadores (Solo en SETUP) --- */}
                {roomData.status === 'SETUP' && (
                    <Paper elevation={2} sx={{ p: 2 }}>
                        <Typography variant="h6" component="h4" gutterBottom>Añadir Jugadores Manualmente</Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                                label="Nombre del Jugador"
                                value={newPlayerName}
                                onChange={(e) => setNewPlayerName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddPlayerManually()}
                                variant="outlined"
                                size="small"
                                fullWidth
                            />
                            <IconButton color="primary" onClick={handleAddPlayerManually}>
                                <Add />
                            </IconButton>
                        </Box>
                    </Paper>
                )}
                
                {/* --- Lista de Jugadores (Siempre visible) --- */}
                <Paper elevation={2} sx={{ p: 2 }}>
                    <Typography variant="h6" component="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <People /> Jugadores ({players.length})
                    </Typography>
                    <List dense>
                        {players.map(player => (
                            <ListItem
                                key={player.id}
                                secondaryAction={
                                    (roomData.hostId === userId && player.id !== userId && roomData.status === 'SETUP') ? (
                                        <IconButton edge="end" aria-label="delete" onClick={() => handleRemovePlayer(player.id)} color="error">
                                            <Delete />
                                        </IconButton>
                                    ) : (
                                        // Mostrar estado de votación
                                        roomData.revealRequest?.status === 'pending' && player.id !== roomData.hostId && (
                                            player.vote === 'approved' ? <HowToVote color="success" /> :
                                            player.vote === 'denied' ? <Cancel color="error" /> :
                                            <CircularProgress size={20} />
                                        )
                                    )
                                }
                            >
                                <ListItemIcon>
                                    {player.id === roomData.hostId ? <EmojiEvents sx={{ color: 'orange' }} /> : <Group />}
                                </ListItemIcon>
                                <ListItemText primary={player.name} />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            </Box>
        );
    };

    // VISTA 3: Pantalla del Jugador (PLAYER) (¡MODIFICADA!)
    const renderPlayer = () => {
        if (!roomData || !players) return renderLoading();
        const me = players.find(p => p.id === userId);
        
        // --- Lógica de la Ventana de Votación ---
        const showVoteDialog = roomData.revealRequest?.status === 'pending' && 
                               me && 
                               !me.vote && 
                               me.id !== roomData.hostId;

        return (
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {error && renderError()}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h5" component="h2" noWrap>
                        Sala de: <span style={{fontWeight: 'bold'}}>{roomData.hostName}</span>
                    </Typography>
                    <Button onClick={handleLeaveRoom} variant="contained" color="error" size="small" startIcon={<Logout />}>
                        Salir
                    </Button>
                </Box>
                
                {roomData.status === 'SETUP' ? (
                    <Paper elevation={3} sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.100' }}>
                        <CircularProgress sx={{ mb: 3 }} />
                        <Typography variant="h4" component="h3" gutterBottom>
                            Esperando al Anfitrión
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            El anfitrión está preparando la partida...
                        </Typography>
                    </Paper>
                ) : ( // Partida iniciada
                    <PlayerAssignment player={me} />
                )}

                {/* Lista de Jugadores (Siempre visible) */}
                <Paper elevation={2} sx={{ p: 2 }}>
                    <Typography variant="h6" component="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <People /> Jugadores ({players.length})
                    </Typography>
                    <List dense>
                        {players.map(player => (
                            <ListItem key={player.id}>
                                <ListItemIcon>
                                    {player.id === roomData.hostId ? <EmojiEvents sx={{ color: 'orange' }} /> : <Group />}
                                </ListItemIcon>
                                <ListItemText 
                                    primary={player.name}
                                    primaryTypographyProps={{ 
                                        fontWeight: player.id === userId ? 'bold' : 'normal',
                                        color: player.id === userId ? 'primary.main' : 'text.primary'
                                    }}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Paper>

                {/* --- ¡NUEVO! Dialog de Votación --- */}
                <Dialog
                    open={showVoteDialog}
                    aria-labelledby="vote-dialog-title"
                    aria-describedby="vote-dialog-description"
                >
                    <DialogTitle id="vote-dialog-title">
                        <HowToVote sx={{ mr: 1, verticalAlign: 'middle' }}/>
                        Solicitud del Anfitrión
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="vote-dialog-description">
                            El anfitrión ({roomData.hostName}) quiere ver las respuestas (la palabra secreta y quién es el impostor).
                            <br/><br/>
                            **¿Autorizas esta acción?**
                            (Se requiere aprobación unánime)
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => handlePlayerVote('denied')} variant="contained" color="error" autoFocus>
                            Rechazar
                        </Button>
                        <Button onClick={() => handlePlayerVote('approved')} variant="contained" color="secondary">
                            Aprobar
                        </Button>
                    </DialogActions>
                </Dialog>

            </Box>
        );
    };

    // --- Renderizado Principal (Navegador de Vistas) ---
    const renderView = () => {
        // --- ¡CORRECCIÓN! ---
        // Se ajusta la condición de carga
        if (loading && view === 'HOME') {
             return renderLoading();
        }
        if (!isAuthReady) {
            return renderLoading();
        }
        if (view !== 'HOME' && !roomData) {
            return renderLoading();
        }

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
                                <IconButton edge="start" color="inherit" onClick={handleLeaveRoom} sx={{ mr: 1 }} title="Volver al Inicio">
                                    <Home />
                                </IconButton>
                            )}
                            <Typography variant="h6" component="h1" sx={{ flexGrow: 1, textAlign: view === 'HOME' ? 'center' : 'left', fontWeight: 'bold' }}>
                                El Juego del Impostor
                            </Typography>
                        </Toolbar>
                    </AppBar>
                    
                    <Box component="main">
                        {renderView()}
                    </Box>
                </Paper>
            </Container>
        </ThemeProvider>
    );
};

export default App;

