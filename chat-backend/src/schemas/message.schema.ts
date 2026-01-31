import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Message extends Document {
    @Prop()
    user: string;

    @Prop()
    text: string;

    @Prop()
    room: string;

    @Prop()
    time: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);