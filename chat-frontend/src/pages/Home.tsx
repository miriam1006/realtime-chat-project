import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonFooter, IonItem, IonInput, IonButton, IonIcon, IonButtons,
  IonSplitPane, IonMenu, IonList, IonMenuToggle, IonLabel, IonAvatar
} from '@ionic/react';
import { send, logOutOutline, menu, chatbubbles } from 'ionicons/icons';
import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useHistory } from 'react-router-dom';
import './Home.css';

// Conectamos al servidor
const socket = io('https://chat-backend-miriam.onrender.com', {
  transports: ['websocket', 'polling']
});

// --- FUNCIÓN PARA GENERAR AVATAR ---
const getAvatar = (seed: string) => {
  // Genera un avatar único basado en el nombre (seed)
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
}

const Home: React.FC = () => {
  const history = useHistory();
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [user, setUser] = useState('');
  const [typingUser, setTypingUser] = useState('');
  const [currentChannel, setCurrentChannel] = useState('General');

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
      setChatHistory((prev) => {
        const last = prev[prev.length - 1];
        // Ignorar si el mensaje nuevo es idéntico al último
        if (last && last.user === payload.user && last.text === payload.text) {
          return prev;
        }
        return [...prev, payload];
      });
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
  }, [history, user, currentChannel]); // Agregué currentChannel a las dependencias

  const switchChannel = (channelName: string) => {
    setCurrentChannel(channelName);
    setChatHistory([]);
    socket.emit('join', channelName);
  };

  const sendMessage = () => {
    if (message.trim() === '') return;

    socket.emit('message', {
      user: user,
      text: message,
      room: currentChannel,
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
              {/* AVATAR PROPIO EN EL MENU */}
              <IonAvatar slot="start" className="user-avatar-icon">
                <img src={getAvatar(user)} alt="Mi avatar" />
              </IonAvatar>

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
                    {/* AVATAR EN CADA MENSAJE */}
                    <div className="chat-message-avatar">
                      <IonAvatar style={{ width: '100%', height: '100%' }}>
                        <img src={getAvatar(msg.user || 'Anónimo')} alt="avatar" />
                      </IonAvatar>
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