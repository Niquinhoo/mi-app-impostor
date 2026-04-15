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
    Slider
} from '@mui/material';

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

// --- BRUTALIST THEME ---
const theme = createTheme({
    palette: {
        mode: 'light',
        primary: { main: '#00FF41', contrastText: '#000' },
        secondary: { main: '#000', contrastText: '#fff' },
        background: { default: '#F5F5F0', paper: '#F5F5F0' },
        error: { main: '#cc0000' },
        success: { main: '#00FF41' },
        text: { primary: '#000', secondary: '#444' },
    },
    typography: {
        fontFamily: '"Inter", sans-serif',
    },
    shape: { borderRadius: 0 },
    components: {
        MuiSlider: {
            styleOverrides: {
                thumb: { borderRadius: 0, width: 14, height: 14, background: '#000', boxShadow: 'none' },
                track: { background: '#00FF41', border: 'none', height: 5 },
                rail: { background: '#ccc', height: 5, borderRadius: 0 },
                mark: { borderRadius: 0, background: '#000' },
                valueLabel: { borderRadius: 0, background: '#000', fontFamily: '"Space Mono", monospace' },
            },
        },
    },
});

// --- BRUTALIST DESIGN TOKENS ---
const C = {
    bg: '#F5F5F0',
    black: '#000',
    white: '#fff',
    green: '#00FF41',
    border: '2px solid #000',
    borderThick: '3px solid #000',
};

const S = {
    mono: { fontFamily: '"Space Mono", monospace' },
    heading: { fontFamily: '"Inter", sans-serif', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.01em' },
};

// Reusable brutalist primitive components
const BBtn = ({ children, variant = 'primary', onClick, disabled, style, ...rest }) => {
    const base = {
        fontFamily: '"Inter", sans-serif', fontWeight: 900, fontSize: '0.82rem',
        textTransform: 'uppercase', letterSpacing: '0.06em', border: C.border,
        borderRadius: 0, padding: '10px 18px', cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1, display: 'inline-flex', alignItems: 'center', gap: 6,
        transition: 'background 0.1s', lineHeight: 1.2,
    };
    const variants = {
        primary: { background: C.green, color: C.black },
        secondary: { background: C.white, color: C.black },
        danger: { background: C.black, color: C.white },
    };
    return (
        <button onClick={disabled ? undefined : onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...style }} {...rest}>
            {children}
        </button>
    );
};

const BInput = ({ value, onChange, onKeyDown, placeholder, id, style }) => (
    <input
        id={id}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        style={{
            fontFamily: '"Space Mono", monospace', background: C.white,
            border: C.border, borderRadius: 0, padding: '11px 14px',
            fontSize: '0.95rem', color: C.black, width: '100%', outline: 'none',
            boxSizing: 'border-box', ...style
        }}
    />
);

const BCard = ({ children, style }) => (
    <div style={{ border: C.border, background: C.bg, padding: 20, ...style }}>
        {children}
    </div>
);

const BTag = ({ children, green }) => (
    <span style={{
        fontFamily: '"Space Mono", monospace', fontSize: '0.68rem', fontWeight: 700,
        letterSpacing: '0.08em', padding: '2px 8px', border: C.border,
        background: green ? C.green : C.bg, color: C.black, textTransform: 'uppercase',
        display: 'inline-block',
    }}>{children}</span>
);

const BLabel = ({ children }) => (
    <p style={{ ...S.mono, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.55, margin: '0 0 4px 0' }}>{children}</p>
);

// --- COMPONENTE ASIGNACIÓN DE JUGADOR ---
const PlayerAssignment = ({ player }) => {
    const [show, setShow] = useState(false);

    if (!player || !player.role) {
        return (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <span style={{ fontFamily: '"Space Mono", monospace', fontSize: '2.5rem', animation: 'blink 1s step-start infinite', display: 'inline-block' }}>█</span>
                <p style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 12, opacity: 0.5 }}>Cargando asignación...</p>
                <style>{`@keyframes blink { 0%,100%{opacity:1}50%{opacity:0} }`}</style>
            </div>
        );
    }

    const isImpostor = player.role === 'Impostor';

    const cardStyle = show
        ? isImpostor
            ? { background: '#000', color: '#00FF41', border: '3px solid #000' }
            : { background: '#F5F5F0', color: '#000', border: '3px solid #000' }
        : { background: '#F5F5F0', color: '#000', border: '3px solid #000' };

    return (
        <div style={{ ...cardStyle, padding: '32px 24px', textAlign: 'center' }}>
            <p style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.55, margin: '0 0 16px 0' }}>
                Tu Asignación
            </p>

            {show ? (
                <div>
                    <p style={{ fontFamily: '"Inter", sans-serif', fontWeight: 900, fontSize: '2.4rem', textTransform: 'uppercase', wordBreak: 'break-word', margin: '0 0 12px 0', lineHeight: 1.1 }}>
                        {player.word}
                    </p>
                    {isImpostor && (
                        <span style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', padding: '2px 8px', border: '2px solid #00FF41', background: 'transparent', color: '#00FF41', textTransform: 'uppercase', display: 'inline-block', marginBottom: 16 }}>
                            IMPOSTOR
                        </span>
                    )}
                    <p style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.8rem', opacity: 0.75, margin: '0 0 20px 0' }}>
                        {isImpostor ? '¡Finge que sabes la palabra!' : '¡Encuentra al impostor!'}
                    </p>
                    <BBtn variant={isImpostor ? 'secondary' : 'danger'} onClick={() => setShow(false)}
                        style={isImpostor ? { border: '2px solid #00FF41', background: 'transparent', color: '#00FF41' } : {}}>
                        Ocultar
                    </BBtn>
                </div>
            ) : (
                <div>
                    <p style={{ fontFamily: '"Inter", sans-serif', fontWeight: 900, fontSize: '1.8rem', textTransform: 'uppercase', margin: '0 0 24px 0' }}>
                        ¿Quién soy?
                    </p>
                    <BBtn variant="primary" onClick={() => setShow(true)} style={{ fontSize: '1rem', padding: '14px 28px' }}>
                        Ver mi Rol
                    </BBtn>
                </div>
            )}
        </div>
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
    // --- 3. Cargar Packs (Se ejecuta al conectar DB) ---
    const seedWordPacks = useCallback(async (firestore) => {
        try {
            const packsRef = collection(firestore, getWordPacksCollectionPath());
            const snapshot = await getDocs(query(packsRef));
            const remotePackIds = new Set(snapshot.docs.map(doc => doc.id));
            const missingPacks = INITIAL_WORD_PACKS.filter(pack => !remotePackIds.has(pack.id));

            if (missingPacks.length > 0) {
                console.log(`Cargando ${missingPacks.length} pack(s) nuevos...`);
                const batch = writeBatch(firestore);
                missingPacks.forEach(pack => batch.set(doc(packsRef, pack.id), pack));
                await batch.commit();
            }
        } catch (error) {
            console.error("Error cargando/sembrando packs:", error);
            // No bloqueamos la UI aquí, pero el listener de onSnapshot podría fallar o volver vacío
            // Si falla, mostramos mensaje en la UI a través del estado 'error'
            // setError("No se pudieron cargar las categorías. Verifica tu conexión."); 
            // Opcional: setError para feedback visual si es crítico.
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
    // --- 5. Listeners de Datos (Packs) ---
    useEffect(() => {
        if (!db || !isAuthReady) return;

        // Intentar sembrar primero
        seedWordPacks(db);

        const packsRef = collection(db, getWordPacksCollectionPath());
        const unsubscribePacks = onSnapshot(packsRef, (snapshot) => {
            const packs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setWordPacks(packs);
            if (packs.length > 0 && !selectedPackId) {
                setSelectedPackId(packs[0].id);
            }
        }, (error) => {
            console.error("Error fetching word packs from DB, using fallback:", error);
            // Fallback a los packs locales si falla la BD
            setWordPacks(INITIAL_WORD_PACKS);
            if (INITIAL_WORD_PACKS.length > 0 && !selectedPackId) {
                setSelectedPackId(INITIAL_WORD_PACKS[0].id);
            }
            // No mostramos error bloqueante, permitimos jugar con lo local
            // setError("Usando categorías locales (Error de conexión).");
        });
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
        try { await deleteDoc(doc(db, getPlayerDocPath(roomId, playerIdToRemove))); } catch (e) { console.error(e); }
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

    // --- VISTAS BRUTALIST ---
    const gap = { display: 'flex', flexDirection: 'column', gap: 16 };

    const renderLoading = () => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, padding: 24 }}>
            <span style={{ fontFamily: '"Space Mono", monospace', fontSize: '3rem', animation: 'blink 1s step-start infinite', display: 'inline-block' }}>█</span>
            <p style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 14, opacity: 0.5 }}>Cargando...</p>
            <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
        </div>
    );

    const renderError = () => (
        <div style={{ border: '2px solid #000', background: '#fff0f0', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: '"Space Mono", monospace', fontSize: '0.82rem' }}>
            <span>⚠ {error}</span>
            <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}>✕</button>
        </div>
    );

    const renderHome = () => (
        <div style={{ ...gap }}>
            <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
            {error && renderError()}
            <div style={{ textAlign: 'center', padding: '24px 0 8px' }}>
                <h1 style={{ fontFamily: '"Inter", sans-serif', fontWeight: 900, fontSize: '3rem', textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0, lineHeight: 1 }}>IMPOSTOR</h1>
                <p style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.45, marginTop: 8 }}>Juego multijugador</p>
            </div>

            <div>
                <p style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, margin: '0 0 6px 0' }}>Tu Nombre</p>
                <BInput id="name" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Escribe tu nombre..." />
            </div>

            <BCard>
                <h2 style={{ fontFamily: '"Inter", sans-serif', fontWeight: 900, fontSize: '1rem', textTransform: 'uppercase', margin: '0 0 14px 0', letterSpacing: '0.04em' }}>Crear una Sala</h2>
                <BBtn variant="primary" onClick={handleCreateRoom} disabled={!userName || loading} style={{ width: '100%', justifyContent: 'center', fontSize: '0.9rem', padding: '13px' }}>
                    + Crear Nueva Sala
                </BBtn>
            </BCard>

            <BCard>
                <h2 style={{ fontFamily: '"Inter", sans-serif', fontWeight: 900, fontSize: '1rem', textTransform: 'uppercase', margin: '0 0 14px 0', letterSpacing: '0.04em' }}>Unirse a una Sala</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <BInput id="room-id" value={inputRoomId} onChange={(e) => setInputRoomId(e.target.value)} placeholder="Código de sala (ej: 42)" />
                    <BBtn variant="secondary" onClick={handleJoinRoom} disabled={!userName || !inputRoomId || loading} style={{ width: '100%', justifyContent: 'center', padding: '13px' }}>
                        → Unirse a Sala
                    </BBtn>
                </div>
            </BCard>
        </div>
    );

    const renderHost = () => {
        if (!roomData) return renderLoading();
        const canStart = players.length >= 3 && selectedPackId;
        const me = players.find(p => p.id === userId);
        const impostorNames = players.filter(p => roomData.impostorIds?.includes(p.id)).map(p => p.name).join(', ');
        const isPending = roomData.revealRequest?.status === 'pending';
        const isDenied  = roomData.revealRequest?.status === 'denied';
        const isApproved = roomData.revealRequest?.status === 'approved';

        return (
            <div style={{ ...gap }}>
                <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
                {error && renderError()}

                <div style={{ border: '3px solid #000', borderLeft: '8px solid #00FF41', background: '#F5F5F0', padding: '16px 20px', display: 'flex', flexDirection: 'column' }}>
                    <p style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.5, margin: '0 0 4px 0' }}>
                        Código para unirse
                    </p>
                    <span style={{ fontFamily: '"Space Mono", monospace', fontWeight: 700, fontSize: '4.5rem', lineHeight: 1, letterSpacing: '0.06em' }}>
                        {roomId}
                    </span>
                    <div style={{ marginTop: 8 }}>
                        <BTag green={roomData.status === 'STARTED'}>
                            {roomData.status === 'SETUP' ? '[ WAITING ]' : '[ STARTED ]'}
                        </BTag>
                    </div>
                </div>

                <BBtn variant="danger" onClick={handleLeaveRoom} style={{ width: '100%', justifyContent: 'center' }}>
                    ✕ Cerrar Sala
                </BBtn>

                {roomData.status === 'SETUP' ? (
                    <div style={{ ...gap }}>
                        <div>
                            <BLabel>Pack de Palabras</BLabel>
                            <select id="word-pack" value={selectedPackId}
                                onChange={(e) => {
                                    const newPackId = e.target.value;
                                    setSelectedPackId(newPackId);
                                    updateDoc(doc(db, getRoomDocPath(roomId)), { selectedPackId: newPackId });
                                }}
                                style={{ fontFamily: '"Space Mono", monospace', background: '#fff', border: '2px solid #000', borderRadius: 0, padding: '11px 14px', fontSize: '0.85rem', color: '#000', width: '100%', outline: 'none', cursor: 'pointer' }}
                            >
                                {wordPacks.map(pack => (
                                    <option key={pack.id} value={pack.id}>{pack.name} ({pack.words.length} palabras)</option>
                                ))}
                            </select>
                        </div>

                        <BCard>
                            <BLabel>Cantidad de Impostores</BLabel>
                            <p style={{ fontFamily: '"Space Mono", monospace', fontSize: '1.4rem', fontWeight: 700, margin: '4px 0 12px 0' }}>{impostorCount}</p>
                            <input type="range" min="1" max={Math.max(1, Math.floor(players.length / 2))} value={impostorCount} onChange={(e) => setImpostorCount(parseInt(e.target.value))} style={{ width: '100%' }} />
                        </BCard>

                        <BBtn variant="primary" onClick={handleStartGame} disabled={!canStart || loading} style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', padding: '16px' }}>
                            ▶ ¡Iniciar Partida!
                        </BBtn>
                        {!canStart && (
                            <p style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.75rem', color: '#cc0000', textAlign: 'center', margin: 0 }}>
                                Se necesitan 3 o más jugadores.
                            </p>
                        )}
                    </div>
                ) : (
                    <div style={{ ...gap }}>
                        <PlayerAssignment player={me} />

                        <BCard>
                            <h3 style={{ fontFamily: '"Inter", sans-serif', fontWeight: 900, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 14px 0' }}>
                                ⌘ Panel de Administrador
                            </h3>
                            {(!roomData.revealRequest || roomData.revealRequest.status === 'idle') && (
                                <BBtn variant="secondary" onClick={handleRequestReveal} style={{ width: '100%', justifyContent: 'center' }}>
                                    🔒 Solicitar Ver Respuestas
                                </BBtn>
                            )}
                            {isPending && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                                    <span style={{ fontFamily: '"Space Mono", monospace', fontSize: '1.8rem', animation: 'blink 1s step-start infinite' }}>█</span>
                                    <BTag>Esperando autorización...</BTag>
                                    <BBtn variant="danger" onClick={handleCancelReveal} style={{ fontSize: '0.75rem', padding: '6px 14px' }}>Cancelar</BBtn>
                                </div>
                            )}
                            {isDenied && (
                                <div style={{ ...gap }}>
                                    <div style={{ border: '2px solid #000', background: '#fff0f0', padding: '10px 14px', fontFamily: '"Space Mono", monospace', fontSize: '0.8rem' }}>
                                        ✕ Solicitud denegada.
                                    </div>
                                    <BBtn variant="secondary" onClick={handleRequestReveal} style={{ width: '100%', justifyContent: 'center' }}>Volver a Solicitar</BBtn>
                                </div>
                            )}
                            {isApproved && (
                                <div style={{ border: '3px solid #00FF41', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <BTag green>✓ Solicitud Aprobada</BTag>
                                    <p style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.9rem', margin: 0 }}>
                                        Palabra: <strong style={{ color: '#00AA2A' }}>{roomData.secretWord}</strong>
                                    </p>
                                    <p style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.9rem', margin: 0 }}>
                                        Impostores: <strong style={{ color: '#cc0000' }}>{impostorNames}</strong>
                                    </p>
                                </div>
                            )}
                        </BCard>

                        <BBtn variant="secondary" onClick={handleResetGame} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                            ↺ Jugar de Nuevo
                        </BBtn>
                    </div>
                )}

                {roomData.status === 'SETUP' && (
                    <BCard>
                        <BLabel>Añadir Jugadores Manualmente</BLabel>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <BInput value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddPlayerManually()} placeholder="Nombre del jugador" />
                            <BBtn variant="primary" onClick={handleAddPlayerManually} style={{ flexShrink: 0, padding: '10px 16px' }}>+</BBtn>
                        </div>
                    </BCard>
                )}

                <BCard style={{ padding: 0 }}>
                    <div style={{ padding: '14px 16px', borderBottom: '2px solid #000' }}>
                        <h3 style={{ fontFamily: '"Inter", sans-serif', fontWeight: 900, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                            Jugadores ({players.length})
                        </h3>
                    </div>
                    {players.map((player, i) => {
                        const isHost = player.id === roomData.hostId;
                        const isMe = player.id === userId;
                        const canRemove = roomData.hostId === userId && !isMe && roomData.status === 'SETUP';
                        const voteIcon = roomData.revealRequest?.status === 'pending' && !isHost
                            ? player.vote === 'approved' ? '✓' : player.vote === 'denied' ? '✕' : '…'
                            : null;
                        return (
                            <div key={player.id} style={{ borderTop: i === 0 ? 'none' : '2px solid #000', display: 'flex', alignItems: 'center', padding: '10px 16px', background: isMe ? '#000' : '#F5F5F0', gap: 10 }}>
                                <span style={{ color: isHost ? '#00FF41' : (isMe ? '#fff' : '#000'), fontSize: '1rem' }}>{isHost ? '🏆' : '◦'}</span>
                                <span style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.88rem', flex: 1, color: isMe ? '#fff' : '#000', fontWeight: isMe ? 700 : 400, wordBreak: 'break-word' }}>
                                    {player.name}{isMe ? ' (tú)' : ''}
                                </span>
                                {voteIcon && <span style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.85rem', color: player.vote === 'approved' ? '#00FF41' : player.vote === 'denied' ? '#cc0000' : '#888' }}>{voteIcon}</span>}
                                {canRemove && (
                                    <button onClick={() => handleRemovePlayer(player.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cc0000', fontWeight: 900, fontSize: '1rem', lineHeight: 1 }}>✕</button>
                                )}
                            </div>
                        );
                    })}
                </BCard>
            </div>
        );
    };

    const renderPlayer = () => {
        if (!roomData || !players) return renderLoading();
        const me = players.find(p => p.id === userId);
        const showVoteDialog = roomData.revealRequest?.status === 'pending' && me && !me.vote && me.id !== roomData.hostId;

        return (
            <div style={{ ...gap }}>
                <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
                {error && renderError()}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <div>
                        <p style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, margin: '0 0 2px 0' }}>Sala de</p>
                        <h2 style={{ fontFamily: '"Inter", sans-serif', fontWeight: 900, fontSize: '1.2rem', textTransform: 'uppercase', margin: 0, wordBreak: 'break-word' }}>{roomData.hostName}</h2>
                    </div>
                    <BBtn variant="danger" onClick={handleLeaveRoom} style={{ flexShrink: 0, fontSize: '0.75rem', padding: '8px 14px' }}>✕ Salir</BBtn>
                </div>

                {roomData.status === 'SETUP' ? (
                    <BCard style={{ textAlign: 'center', padding: '36px 24px' }}>
                        <span style={{ fontFamily: '"Space Mono", monospace', fontSize: '2.5rem', animation: 'blink 1s step-start infinite', display: 'inline-block' }}>█</span>
                        <h3 style={{ fontFamily: '"Inter", sans-serif', fontWeight: 900, fontSize: '1.3rem', textTransform: 'uppercase', margin: '14px 0 8px', letterSpacing: '-0.01em' }}>
                            Esperando al Anfitrión
                        </h3>
                        <BTag>[ WAITING ]</BTag>
                    </BCard>
                ) : (<PlayerAssignment player={me} />)}

                <BCard style={{ padding: 0 }}>
                    <div style={{ padding: '14px 16px', borderBottom: '2px solid #000' }}>
                        <h3 style={{ fontFamily: '"Inter", sans-serif', fontWeight: 900, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                            Jugadores ({players.length})
                        </h3>
                    </div>
                    {players.map((player, i) => {
                        const isHost = player.id === roomData.hostId;
                        const isMe = player.id === userId;
                        return (
                            <div key={player.id} style={{ borderTop: i === 0 ? 'none' : '2px solid #000', display: 'flex', alignItems: 'center', padding: '10px 16px', background: isMe ? '#000' : '#F5F5F0', gap: 10 }}>
                                <span style={{ color: isHost ? '#00FF41' : (isMe ? '#fff' : '#000'), fontSize: '1rem' }}>{isHost ? '🏆' : '◦'}</span>
                                <span style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.88rem', flex: 1, color: isMe ? '#fff' : '#000', fontWeight: isMe ? 700 : 400, wordBreak: 'break-word' }}>
                                    {player.name}{isMe ? ' (tú)' : ''}
                                </span>
                            </div>
                        );
                    })}
                </BCard>

                {showVoteDialog && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: 16 }}>
                        <div style={{ background: '#F5F5F0', border: '3px solid #000', padding: '28px 24px', width: '100%', maxWidth: 420 }}>
                            <h3 style={{ fontFamily: '"Inter", sans-serif', fontWeight: 900, fontSize: '1.1rem', textTransform: 'uppercase', margin: '0 0 14px 0' }}>
                                ✋ Solicitud del Anfitrión
                            </h3>
                            <p style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.82rem', lineHeight: 1.6, margin: '0 0 20px 0' }}>
                                <strong>{roomData.hostName}</strong> quiere ver las respuestas.<br />
                                Se requiere aprobación unánime.
                            </p>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <BBtn variant="danger" onClick={() => handlePlayerVote('denied')} style={{ flex: 1, justifyContent: 'center' }}>✕ Rechazar</BBtn>
                                <BBtn variant="primary" onClick={() => handlePlayerVote('approved')} style={{ flex: 1, justifyContent: 'center' }}>✓ Aprobar</BBtn>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderView = () => {
        if (loading && !isAuthReady) return renderLoading();
        if (view !== 'HOME' && !roomData && !loading) return renderHome();
        switch (view) {
            case 'HOST': return renderHost();
            case 'PLAYER': return renderPlayer();
            case 'HOME': default: return renderHome();
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <div style={{ minHeight: '100vh', background: '#F5F5F0', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
                {/* BRUTALIST APPBAR */}
                <header style={{ background: '#fff', borderBottom: '3px solid #000', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 54, position: 'sticky', top: 0, zIndex: 1100, flexShrink: 0 }}>
                    <div style={{ width: 40 }}>
                        {view !== 'HOME' && (
                            <button onClick={handleLeaveRoom} aria-label="home" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: '"Space Mono", monospace', fontWeight: 700, fontSize: '1.1rem', padding: 0 }}>
                                ←
                            </button>
                        )}
                    </div>
                    <span style={{ fontFamily: '"Space Mono", monospace', fontWeight: 700, fontSize: '1.05rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                        IMPOSTOR
                    </span>
                    <div style={{ width: 40 }} />
                </header>

                {/* MAIN CONTENT */}
                <main style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 600, width: '100%', margin: '0 auto', padding: '24px 16px', boxSizing: 'border-box' }}>
                    {renderView()}
                </main>
            </div>
        </ThemeProvider>
    );
};

export default App;