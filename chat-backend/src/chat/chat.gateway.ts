import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from '../schemas/message.schema';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() server: Server;

  constructor(@InjectModel(Message.name) private messageModel: Model<Message>) { }

  handleConnection(client: Socket) {
    console.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('message')
  async handleMessage(client: Socket, payload: any): Promise<void> {
    const { room } = payload;
    const newMessage = new this.messageModel(payload);
    await newMessage.save();
    this.server.to(room).emit('message', payload);
  }

  @SubscribeMessage('typing')
  handleTyping(client: Socket, payload: { room: string, user: string }): void {
    client.to(payload.room).emit('typing', payload.user);
  }

  @SubscribeMessage('join')
  async handleJoinRoom(client: Socket, room: string): Promise<void> {
    client.join(room);
    const messages = await this.messageModel.find({ room }).exec();
    client.emit('chat-history', messages);
    client.to(room).emit('message', {
      user: 'Sistema',
      text: `¡Un nuevo usuario ha entrado a ${room}!`,
      time: new Date().toLocaleTimeString()
    });
  }
}