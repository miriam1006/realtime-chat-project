import {
    IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
    IonInput, IonButton, IonItem, IonLabel, IonToast, IonLoading
} from '@ionic/react';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';

const Login: React.FC = () => {
    const history = useHistory();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Función para conectar con el Backend
    const doAuth = async (endpoint: 'login' | 'register') => {
        // 1. Validar que no estén vacíos
        if (!email || !password) {
            setToastMessage('Por favor escribe email y contraseña');
            setShowToast(true);
            return;
        }

        setLoading(true);
        try {
            // 2. Preparar los datos
            // Si es registro, creamos un nickname basado en el email (antes del @)
            const payload = {
                email,
                password,
                nickname: endpoint === 'register' ? email.split('@')[0] : undefined
            };

            // 3. Enviar al servidor
            const BACKEND_URL = 'https://chat-backend-miriam.onrender.com';

            const response = await fetch(`${BACKEND_URL}/auth/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            setLoading(false);

            console.log('📦 RESPUESTA DEL SERVER:', data); // <--- Espía para ver qué llega

            if (response.ok) {
                if (endpoint === 'login') {

                    // --- CORRECCIÓN FINAL ---
                    // Aquí leemos EXACTAMENTE lo que vi en tu captura de pantalla
                    const myToken = data.token;              // En la foto dice "token"
                    const myUser = data.user.nickname;       // En la foto dice "user" -> "nickname"

                    // Si faltan datos, no dejamos pasar
                    if (!myToken || !myUser) {
                        setToastMessage('Error: Credenciales correctas, pero falta información del servidor.');
                        console.error('Faltan datos:', { myToken, myUser });
                        setShowToast(true);
                        return;
                    }

                    // Guardamos en la memoria del navegador
                    localStorage.setItem('token', myToken);
                    localStorage.setItem('nickname', myUser);

                    console.log('✅ LOGIN EXITOSO. Usuario:', myUser);

                    // Nos vamos al chat
                    history.push('/home');
                    window.location.reload(); // Recarga necesaria para actualizar el socket
                } else {
                    setToastMessage('¡Registro exitoso! Ahora inicia sesión.');
                    setShowToast(true);
                }
            } else {
                // Si el servidor dice que no (ej: pass incorrecto o usuario ya existe)
                setToastMessage(data.message || 'Error en el servidor');
                setShowToast(true);
            }
        } catch (error) {
            setLoading(false);
            console.error(error);
            setToastMessage('No se pudo conectar con el servidor');
            setShowToast(true);
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonTitle>Bienvenido al Chat 🔐</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">

                <div style={{ marginTop: '50px', textAlign: 'center' }}>
                    <h1>Acceso</h1>
                    <p>Ingresa tus credenciales</p>
                </div>

                <IonItem lines="full">
                    <IonLabel position="floating">Correo Electrónico</IonLabel>
                    <IonInput
                        type="email"
                        value={email}
                        onIonChange={e => setEmail(e.detail.value!)}
                    />
                </IonItem>

                <IonItem lines="full">
                    <IonLabel position="floating">Contraseña</IonLabel>
                    <IonInput
                        type="password"
                        value={password}
                        onIonChange={e => setPassword(e.detail.value!)}
                    />
                </IonItem>

                <div style={{ marginTop: '30px' }}>
                    <IonButton expand="block" onClick={() => doAuth('login')}>
                        Entrar
                    </IonButton>
                    <IonButton expand="block" fill="outline" color="secondary" onClick={() => doAuth('register')}>
                        Registrarme
                    </IonButton>
                </div>

                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message={toastMessage}
                    duration={2000}
                />
                <IonLoading isOpen={loading} message={'Conectando...'} />

            </IonContent>
        </IonPage>
    );
};

export default Login;