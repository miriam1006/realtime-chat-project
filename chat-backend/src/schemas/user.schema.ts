import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
    @Prop({ required: true, unique: true }) // El email no se puede repetir
    email: string;

    @Prop({ required: true })
    nickname: string;

    @Prop({ required: true })
    password: string; // Se guarda el hash encriptado
}

export const UserSchema = SchemaFactory.createForClass(User);