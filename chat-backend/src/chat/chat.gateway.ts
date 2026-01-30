import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
  }

  // --- FUNCIÓN 1: MENSAJES ---
  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any): void {
    const { room, user, text, time } = payload; // Ahora esperamos recibir la sala
    console.log(`Mensaje en sala [${room}] de ${user}: ${text}`);

    // Enviar SOLO a las personas en esa sala
    this.server.to(room).emit('message', payload);
  }
  // --- FUNCIÓN 2: ESCRIBIENDO 
  @SubscribeMessage('typing')
  handleTyping(client: Socket, payload: { room: string, user: string }): void {
    // Avisar solo a los de esa sala
    client.to(payload.room).emit('typing', payload.user);
  }
  // --- FUNCIÓN 3: UNIRSE A SALA ---
  @SubscribeMessage('join')
  handleJoinRoom(client: Socket, room: string): void {
    console.log(`🔑 Cliente ${client.id} entrando a la sala: ${room}`);
    client.join(room); // SOCKET.IO

    // Avisar a esa sala que alguien llegó
    client.to(room).emit('message', {
      user: 'Sistema',
      text: `¡Un nuevo usuario ha entrado a ${room}!`,
      time: new Date().toLocaleTimeString()
    });
  }

}
