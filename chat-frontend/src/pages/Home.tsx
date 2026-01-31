import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonFooter, IonItem, IonInput, IonButton, IonIcon, IonButtons
} from '@ionic/react';
import { send, logOutOutline } from 'ionicons/icons'; // <--- Icono de salir
import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useHistory } from 'react-router-dom'; // <--- Importar historial

// Conectamos al servidor
const socket = io('http://localhost:3000');

const Home: React.FC = () => {
  const history = useHistory();
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [user, setUser] = useState(''); // El usuario empieza vacío
  const [typingUser, setTypingUser] = useState('');

  useEffect(() => {
    // 1. VERIFICAR QUIÉN ERES (SEGURIDAD)
    const myName = localStorage.getItem('nickname');

    if (!myName) {
      // Si no hay nombre guardado, ¡fuera de aquí! Vete al Login.
      history.replace('/login');
      return;
    }

    // Si sí existe, lo usamos
    setUser(myName);

    // 2. Unirnos a la sala
    socket.emit('join', 'General');

    // 3. Escuchar mensajes
    socket.on('message', (payload) => {
      setChatHistory((prev) => [...prev, payload]);
    });

    socket.on('chat-history', (oldMessages) => {
      setChatHistory(oldMessages);
    });

    socket.on('typing', (user) => {
      setTypingUser(`${user} está escribiendo...`);
      setTimeout(() => setTypingUser(''), 2000);
    });

    return () => {
      socket.off('message');
      socket.off('typing');
      socket.off('chat-history');
    };
  }, [history]); // Agregamos history a las dependencias

  const sendMessage = () => {
    if (message.trim() === '') return;

    // Ahora enviamos el mensaje con TU nombre real
    socket.emit('message', {
      user: user,  // <--- AQUÍ ESTÁ LA CLAVE
      text: message,
      room: 'General',
      time: new Date().toLocaleTimeString()
    });

    setMessage('');
  };

  const handleTyping = () => {
    socket.emit('typing', { room: 'General', user: user });
  };

  // Función para Cerrar Sesión
  const logout = () => {
    localStorage.clear(); // Borramos credenciales
    history.replace('/login'); // Nos vamos al login
    window.location.reload(); // Recargamos para limpiar memoria
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Sala General ({user})</IonTitle>
          {/* Botón de Salir */}
          <IonButtons slot="end">
            <IonButton onClick={logout}>
              <IonIcon icon={logOutOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">

        {/* Lista de Mensajes */}
        <div style={{ marginBottom: '60px' }}>
          {chatHistory.map((msg, index) => (
            <div key={index} style={{
              textAlign: msg.user === user ? 'right' : 'left', // TÚ a la derecha, OTROS a la izquierda
              margin: '10px 0'
            }}>
              <div style={{
                display: 'inline-block',
                padding: '10px',
                borderRadius: '10px',
                background: msg.user === user ? '#d1c4e9' : '#f1f1f1', // Color diferente para ti
                color: 'black'
              }}>
                <small style={{ fontWeight: 'bold' }}>{msg.user}</small><br />
                {msg.text}
              </div>
            </div>
          ))}
          <p style={{ fontStyle: 'italic', color: 'gray' }}>{typingUser}</p>
        </div>

      </IonContent>

      <IonFooter>
        <IonToolbar>
          <IonItem lines="none">
            <IonInput
              value={message}
              placeholder="Escribe algo..."
              onIonChange={e => setMessage(e.detail.value!)}
              onKeyUp={handleTyping}
            />
            <IonButton slot="end" onClick={sendMessage}>
              <IonIcon icon={send} />
            </IonButton>
          </IonItem>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default Home;