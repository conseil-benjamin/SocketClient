import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:3001');

function App() {
    const [roomName, setRoomName] = useState('');
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [inRoom, setInRoom] = useState(false);
    const [roomData, setRoomData] = useState({ users: [], messages: [] });
    const [rooms, setRooms] = useState([]);
    const [privateRoom, setPrivateRoom] = useState(false);

    useEffect(() => {
        const fetchRooms = async () => {
            const response = await fetch('http://localhost:3001/rooms');
            const data = await response.json();
            console.log(data);
            setRooms(data);
        }
        fetchRooms().then(r => console.log('Rooms fetched'));
    }, []);

    useEffect(() => {
        socket.on('message', (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        socket.on('roomData', (room) => {
            console.log('Room data:', room);
            setRoomData(room);
        });

        // Mise à jour des rooms en temps réel
        socket.on('updateRooms', (updatedRooms) => {
            console.log('Rooms updated:', updatedRooms);
            setRooms(updatedRooms);
        });

        return () => {
            socket.off('message');
            socket.off('roomData');
            socket.off('updateRooms');
        };
    }, []);


    const createRoom = (roomName) => {
        if (roomName && username) {
            socket.emit('createRoom', { roomName, username, privateRoom });
            setInRoom(true);
        } else if (roomName && !username) {
            alert('Please enter a username');
        }
    }

    const joinRoom = (roomName) => {
        if (roomName && username) {
            socket.emit('joinRoom', { roomName, username });
            setInRoom(true);
            setRoomName(roomName);
        } else if (roomName && !username) {
            alert('Please enter a username');
        }
    };

    const leaveRoom = () => {
        socket.emit('leaveRoom', { roomName, username });
        setInRoom(false);
        setMessages([]);
    };

    const sendMessage = () => {
        if (message) {
            socket.emit('sendMessage', { roomName, username, text: message });
            setMessage('');
        }
    };

    return (
        <div className="App">
            <h1>Chat Room</h1>
            {!inRoom ? (
                <div>
                    <input
                        type="text"
                        placeholder="Nom de la room"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                    />
                    <div>
                        <label>
                            Private Room
                            <input
                                type="checkbox"
                                onChange={() => setPrivateRoom(!privateRoom)}
                            />
                        </label>
                    </div>
                    <input
                        type="text"
                        placeholder="Nom d'utilisateur"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <button onClick={() => createRoom(roomName)}>Créer une Room</button>
                </div>
            ) : (
                <div>
                    <button onClick={leaveRoom}>Quitter la Room</button>
                    <div id="messages">
                        <ul>
                            {messages.map((msg, index) => (
                                <li key={index}>
                                <span>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                    <strong>{msg.username}</strong>: {msg.text}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <input
                        type="text"
                        placeholder="Entrer un message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <button onClick={sendMessage}>Envoyer</button>
                </div>
            )}
            {inRoom && (
                <div>
                    <h2>Utilisateurs dans la Room :</h2>
                    <ul>
                        {roomData.users.map((user, index) => (
                            <li key={index}>{user.username} : {user.points}</li>
                        ))}
                    </ul>
                </div>
            )}
            <h2>Rooms :</h2>
            <div className="rooms-container">
                {rooms.map((room, index) => (
                    !room.private && (
                        <div
                            key={index}
                            className="room-card"
                            onClick={() => joinRoom(room.roomId)}
                        >
                            <p>{room.roomName}</p>
                            <p>{room.users.length} participants</p>
                        </div>
                    )
                ))}
            </div>
        </div>
    );

}

export default App;
