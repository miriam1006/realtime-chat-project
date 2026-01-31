import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User, UserSchema } from '../schemas/user.schema';

@Module({
    imports: [
        // 1. Registrar el Schema de Usuario para que este módulo pueda guardar gente
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),

        // 2. Configurar la seguridad (JWT)
        JwtModule.register({
            secret: 'CLAVE_SECRETA_123', // ⚠️ Se sube por tratarse de un proyecto de prueba
            signOptions: { expiresIn: '1d' }, // El token dura 1 día
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule { }