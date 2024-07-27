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
        fetchRooms();
    }, []);

    useEffect(() => {
        socket.on('message', (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        socket.on('roomData', (room) => {
            console.log('Room data:', room);
            setRoomData(room);
        });

        return () => {
            socket.off('message');
            socket.off('roomData');
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
                        placeholder="Créer une room"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                    />
                    <div>
                        <label>Private Room</label>
                        <input type={"checkbox"} onChange={() => setPrivateRoom(!privateRoom)}/>
                    </div>
                    <input
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <button onClick={() => createRoom(roomName)}>Créer ma room</button>
                </div>
            ) : (
                <div>
                    <button onClick={leaveRoom}>Leave Room</button>
                    <ul id="messages">
                        {messages.map((msg, index) => (
                            <li key={index}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} <b>{msg.username}</b>: <b>{msg.text}</b>
                            </li>
                        ))}
                    </ul>
                    <input
                        type="text"
                        placeholder="Enter message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <button onClick={sendMessage}>Send Message</button>
                </div>
            )}
            {inRoom && (
                <div>
                    <h2>Users in room:</h2>
                    <ul>
                        {roomData && roomData.users.map((user, index) => (
                            <li key={index}>{user.username} : {user.points}</li>
                        ))}
                    </ul>
                </div>
            )}
            <h2>Rooms:</h2>
            <ul>
                {rooms && rooms.map((room, index) => (
                    !room.private && (
                        <div key={index} style={{display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "row", backgroundColor: "red", cursor: "pointer", margin: "0 0 2em 0"}} onClick={() => joinRoom(room.roomId)}>
                            <p>{room.roomName}</p>
                            <p>{room.users.length}</p>
                        </div>
                    )
                ))}
            </ul>
        </div>
    );
}

export default App;
