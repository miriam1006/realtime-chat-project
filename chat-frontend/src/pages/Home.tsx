import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonFooter, IonItem, IonInput, IonButton, IonIcon, IonButtons,
  IonSplitPane, IonMenu, IonList, IonMenuToggle, IonLabel, IonAvatar
} from '@ionic/react';
import { send, logOutOutline, menu, chatbubbles, personCircle } from 'ionicons/icons';
import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useHistory } from 'react-router-dom';
import './Home.css';

// Conectamos al servidor
const socket = io('https://chat-backend-miriam.onrender.com', {
  transports: ['websocket', 'polling'] // Esto ayuda a que conecte mejor en móviles
});


const Home: React.FC = () => {
  const history = useHistory();
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [user, setUser] = useState('');
  const [typingUser, setTypingUser] = useState('');
  const [currentChannel, setCurrentChannel] = useState('General'); // <--- Nuevo: Control de Canales

  useEffect(() => {
    const myName = localStorage.getItem('nickname');
    if (!myName) {
      history.replace('/login');
      return;
    }
    setUser(myName);

    // Unirnos al canal inicial
    socket.emit('join', currentChannel);

    socket.on('message', (payload) => {
      setChatHistory((prev) => [...prev, payload]);
    });

    socket.on('chat-history', (oldMessages) => {
      setChatHistory(oldMessages);
    });

    socket.on('typing', (typingUsername: string) => {
      if (typingUsername !== user) {
        setTypingUser(`${typingUsername} está escribiendo...`);
        setTimeout(() => setTypingUser(''), 2000);
      }
    });

    return () => {
      socket.off('message');
      socket.off('typing');
      socket.off('chat-history');
    };
  }, [history, user]);

  // Función para cambiar de canal (solo visual por ahora)
  const switchChannel = (channelName: string) => {
    setCurrentChannel(channelName);
    setChatHistory([]); // Limpiamos pantalla al cambiar
    socket.emit('join', channelName); // Avisamos al server (aunque falta lógica allá)
  };

  const sendMessage = () => {
    if (message.trim() === '') return;

    socket.emit('message', {
      user: user,
      text: message,
      room: currentChannel, // Ahora enviamos al canal actual
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    setMessage('');
  };

  const handleTyping = () => {
    socket.emit('typing', { room: currentChannel, user: user });
  };

  const logout = () => {
    localStorage.clear();
    history.replace('/login');
    window.location.reload();
  };

  return (
    <IonSplitPane contentId="main-content" className="chat-split-pane">
      {/* --- BARRA LATERAL (MENU) --- */}
      <IonMenu contentId="main-content" type="overlay" className="chat-sidebar">
        <IonHeader className="sidebar-header">
          <IonToolbar>
            <IonTitle className="sidebar-title">Empresa S.A.</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="sidebar-content">
          {/* Sección de Canales */}
          <IonList className="channel-list">
            <IonItem lines="none" className="channel-list-label">
              <IonLabel>CANALES</IonLabel>
            </IonItem>

            <IonMenuToggle autoHide={false}>
              <IonItem button onClick={() => switchChannel('General')} className={`channel-item ${currentChannel === 'General' ? 'channel-item--active' : ''}`}>
                <IonIcon icon={chatbubbles} slot="start" size="small" />
                <IonLabel>General</IonLabel>
              </IonItem>
              <IonItem button onClick={() => switchChannel('Proyectos')} className={`channel-item ${currentChannel === 'Proyectos' ? 'channel-item--active' : ''}`}>
                <IonIcon icon={chatbubbles} slot="start" size="small" />
                <IonLabel>Proyectos</IonLabel>
              </IonItem>
              <IonItem button onClick={() => switchChannel('Ventas')} className={`channel-item ${currentChannel === 'Ventas' ? 'channel-item--active' : ''}`}>
                <IonIcon icon={chatbubbles} slot="start" size="small" />
                <IonLabel>Ventas</IonLabel>
              </IonItem>
            </IonMenuToggle>
          </IonList>

          {/* Sección de Usuario */}
          <div className="sidebar-user-section">
            <IonItem lines="none" className="user-info-item">
              <IonIcon icon={personCircle} slot="start" className="user-avatar-icon" />
              <IonLabel>
                <h2 className="user-name">{user}</h2>
                <p className="user-status">● En línea</p>
              </IonLabel>
            </IonItem>
            <IonButton expand="block" fill="outline" onClick={logout} className="logout-btn">
              <IonIcon icon={logOutOutline} slot="start" /> Salir
            </IonButton>
          </div>
        </IonContent>
      </IonMenu>

      {/* --- AREA PRINCIPAL (CHAT) --- */}
      <IonPage id="main-content" className="chat-main-page">
        <IonHeader className="chat-header">
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuToggle>
                <IonButton className="menu-toggle-btn"><IonIcon icon={menu} /></IonButton>
              </IonMenuToggle>
            </IonButtons>
            <IonTitle className="chat-channel-title"># {currentChannel}</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent className="chat-content ion-padding">
          <div className="chat-messages-wrap">
            {chatHistory.map((msg, index) => {
              const isSystem = msg.user === 'Sistema';
              const isMine = msg.user === user;
              if (isSystem) {
                return (
                  <div key={index} className="chat-message chat-message--system">
                    <span className="chat-system-text">{msg.text}</span>
                  </div>
                );
              }
              return (
                <div
                  key={index}
                  className={`chat-message ${isMine ? 'chat-message--mine' : ''}`}
                >
                  <div className="chat-message-inner">
                    <div className="chat-message-avatar">
                      {msg.user ? msg.user.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="chat-message-body">
                      <div className="chat-message-meta">
                        <span className="chat-message-user">{msg.user || 'Anónimo'}</span>
                        <span className="chat-message-time">{msg.time}</span>
                      </div>
                      <div className="chat-message-text">{msg.text}</div>
                    </div>
                  </div>
                </div>
              );
            })}
            <p className="chat-typing-indicator">{typingUser}</p>
          </div>
        </IonContent>

        <IonFooter className="chat-footer">
          <IonToolbar>
            <form
              className="chat-input-form"
              onSubmit={e => {
                e.preventDefault();
                sendMessage();
              }}
            >
              <IonItem lines="none" className="chat-input-wrap">
                <input
                  type="text"
                  className="chat-input-native"
                  value={message}
                  placeholder={`Enviar mensaje a #${currentChannel}`}
                  onChange={e => setMessage(e.target.value)}
                  onKeyUp={handleTyping}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <IonButton type="submit" slot="end" className="chat-send-btn">
                  <IonIcon icon={send} />
                </IonButton>
              </IonItem>
            </form>
          </IonToolbar>
        </IonFooter>
      </IonPage>
    </IonSplitPane>
  );
};

export default Home;