import './App.css'
import io from 'socket.io-client'
import {useEffect, useState} from "react";

const socket = io('http://localhost:3001')
function App() {
    const [message, setMessage] = useState('');
    const [messageReceived, setMessageReceived] = useState('');
    const [roomNumber, setRoomNumber] = useState('');
    const [pseudo, setPseudo] = useState('');
    const [users, setUsers] = useState([]);

    const sendMessage = () => {
        socket.emit('send_message', { message, roomNumber, pseudo });
    }

    const joinRoom = () => {
        if (roomNumber !== "") {
            socket.emit('join_room', {roomNumber, pseudo});
        } else {
            alert('Veuillez renseigner un numéro de room');
        }
    }

    const disconnect = () => {
        alert(`Vous avez été déconnecté de la room ${roomNumber}`);
        setRoomNumber('');
        socket.emit('leave', {roomNumber});
    }

    useEffect(() => {
        socket.on('receive_message', (msg) => {
            setMessageReceived(msg.message);
        });
        socket.on('user_connect', (data) => {
            console.log(`${data.pseudo} a rejoint la room`);
            setUsers([...users, data.pseudo]);
        });
        socket.on('user_disconnect', (data) => {
            console.log(`${data.pseudo} a quitté la room`);
            setUsers(users.filter(user => user !== data.pseudo));
        });
    }, [socket]);

  return (
    <>
        <input placeholder='pseudo' onChange={(e) => setPseudo(e.target.value)}/>
        <input placeholder='Room Number' onChange={(e) => setRoomNumber(e.target.value)}/>
        <input placeholder='message' onChange={(e) => setMessage(e.target.value)}/>
        <button onClick={sendMessage}>Envoyer</button>
        <button onClick={joinRoom}>Rejoindre la room</button>
        <button onClick={disconnect}>Déconnecter</button>
        <p>{messageReceived}</p>
        <h1>Liste des utilisateurs</h1>
        <ul>
            {users.map((user, index) => {
                return <li key={index}>{user}</li>
            })}
        </ul>
    </>
  )
}

export default App
