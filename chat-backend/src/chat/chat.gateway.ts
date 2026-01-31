import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from '../schemas/message.schema';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() server: Server;

  // INYECTAR LA BASE DE DATOS EN EL CONSTRUCTOR
  constructor(@InjectModel(Message.name) private messageModel: Model<Message>) { }

  handleConnection(client: Socket) {
    console.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
  }

  // GUARDAR EL MENSAJE (PERSISTENCIA) 
  @SubscribeMessage('message')
  async handleMessage(client: Socket, payload: any): Promise<void> {
    const { room, user, text, time } = payload;

    // A) Guardar en MongoDB Atlas
    const newMessage = new this.messageModel(payload);
    await newMessage.save();

    // B) Enviar a la sala como siempre
    this.server.to(room).emit('message', payload);
  }

  @SubscribeMessage('typing')
  handleTyping(client: Socket, payload: { room: string, user: string }): void {
    client.to(payload.room).emit('typing', payload.user);
  }

  // CARGAR HISTORIAL AL ENTRAR 
  @SubscribeMessage('join')
  async handleJoinRoom(client: Socket, room: string): Promise<void> {
    console.log(`🔑 Cliente ${client.id} entrando a la sala: ${room}`);
    client.join(room);

    // A) Buscar mensajes VIEJOS de esa sala en la BD
    const messages = await this.messageModel.find({ room }).exec();

    // B) Enviarlos SOLO al que acaba de entrar (Evento especial 'chat-history')
    client.emit('chat-history', messages);

    // C) Avisar a los demás
    client.to(room).emit('message', {
      user: 'Sistema',
      text: `¡Un nuevo usuario ha entrado a ${room}!`,
      time: new Date().toLocaleTimeString()
    });
  }
}