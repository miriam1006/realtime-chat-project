import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonFooter, IonItem, IonInput, IonButton, IonIcon, IonList, IonLabel,
  IonAlert, IonAvatar ,
} from '@ionic/react';
import { send } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './Home.css';

// Conexión al Backend
const socket = io('http://localhost:3000');

const Home: React.FC = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [currentRoom, setCurrentRoom] = useState('General'); // Por defecto sala General

  // 2. CORREGIDO: Inicializamos vacío y agregamos 'setCurrentUser' para poder cambiarlo
  const [currentUser, setCurrentUser] = useState('');

  const [typingUser, setTypingUser] = useState('');

  useEffect(() => {
    // Escuchar mensajes
    socket.on('message', (payload) => {
      setChatHistory((prev) => [...prev, payload]);
    });

    // Escuchar quién escribe
    socket.on('typing', (user) => {
      console.log('👀 ALGUIEN ESCRIBE:', user);
      setTypingUser(`${user} está escribiendo...`);
      setTimeout(() => setTypingUser(''), 2000); // Borrar aviso a los 2 seg
    });

    return () => {
      socket.off('message');
      socket.off('typing');
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      const payload = {
        room: currentRoom,
        user: currentUser,
        text: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      socket.emit('message', payload);
      setMessage('');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          {/* Mostramos el nombre solo si ya lo eligió */}
          <IonTitle>💬 {currentRoom} ({currentUser})</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonList lines="none">
          {chatHistory.map((msg, index) => {
            const isMe = msg.user === currentUser;

            return (
              <IonItem key={index}>
                {/* 1. Avatar del OTRO (Lado Izquierdo) */}
                {!isMe && (
                  <IonAvatar slot="start" style={{ width: '35px', height: '35px', marginRight: '10px' }}>
                    <img
                      src={`https://api.dicebear.com/9.x/bottts/svg?seed=${msg.user}`}
                      alt="avatar"
                    />
                  </IonAvatar>
                )}

                {/* 2. La Burbuja del Mensaje */}
                <IonLabel className={isMe ? 'my-message' : 'other-message'}>
                  <h2>
                    {msg.user}
                    <span style={{ fontSize: '0.7em', color: '#666', marginLeft: '5px' }}>
                      {msg.time}
                    </span>
                  </h2>
                  <p style={{ fontSize: '1.1em', color: 'black' }}>{msg.text}</p>
                </IonLabel>

              </IonItem>
            );
          })}
        </IonList>
      </IonContent>

      {/* Aviso de "Escribiendo..." */}
      {typingUser && (
        <div style={{ padding: '10px', color: '#888', fontStyle: 'italic', fontSize: '0.8rem', textAlign: 'center' }}>
          {typingUser}
        </div>
      )}

      <IonFooter>
        <IonToolbar>
          <IonItem lines="none">
            <IonInput
              placeholder="Escribe un mensaje..."
              value={message}
              onIonChange={e => setMessage(e.detail.value!)}
              onKeyPress={e => e.key === 'Enter' && sendMessage()}
              // Detectar teclas para el evento "typing"
              onKeyDown={() => socket.emit('typing', { room: currentRoom, user: currentUser })}
            />
            <IonButton slot="end" onClick={sendMessage}>
              <IonIcon icon={send} />
            </IonButton>
          </IonItem>
        </IonToolbar>
      </IonFooter>

      {/* 3. AQUÍ ESTÁ LA ALERTA PARA PEDIR EL NOMBRE */}
      <IonAlert
        isOpen={currentUser === ''} // Se abre si el nombre está vacío
        header="Bienvenido al Chat 💬"
        subHeader="Elige tu apodo para entrar"
        backdropDismiss={false} // Obliga a escribir nombre
        inputs={[
          {
            name: 'nickname',
            type: 'text',
            placeholder: 'Tu Nombre (Ej: Karla)',
          },
          {
            name: 'room',
            type: 'text',
            placeholder: 'Sala (Ej: Cine, Música)',
            value: 'General' // Valor por defecto
          },
        ]}
        buttons={[
          {
            text: 'Entrar',
            handler: (data) => {
              if (data.nickname && data.room) {
                setCurrentUser(data.nickname);
                setCurrentRoom(data.room);

                // AVISAR AL SERVIDOR QUE ENTRAMOS
                socket.emit('join', data.room);
              } else {
                return false;
              }
            },
          },
        ]}
      />

    </IonPage>
  );
};

export default Home;