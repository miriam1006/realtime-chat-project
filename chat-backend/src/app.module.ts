import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatGateway } from './chat/chat.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './schemas/message.schema';

// IMPORTAR EL MODULO NUEVO
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // Tu conexión a la base de datos (URL CON LA CONTRASEÑA)
    MongooseModule.forRoot('mongodb+srv://admin:admin1234@cluster0.yjhuzva.mongodb.net/chat_db?retryWrites=true&w=majority'),

    // REGISTRAR LA TABLA DE MENSAJES 
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),

    // SEGURIDAD
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, ChatGateway],
})
export class AppModule { }