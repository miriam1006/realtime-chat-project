import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private jwtService: JwtService,
    ) { }

    // --- FUNCIÓN PARA REGISTRAR ---
    async register(registerDto: any) {
        const { email, nickname, password } = registerDto;

        // 1. Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // 2. Crear el usuario
        try {
            const user = await this.userModel.create({
                email,
                nickname,
                password: hashedPassword,
            });

            return { message: 'Usuario registrado exitosamente', user: user.nickname };
        } catch (error) {
            // Si el error es código 11000 es porque el email ya existe
            if (error.code === 11000) {
                throw new BadRequestException('El correo ya existe');
            }
            throw error;
        }
    }

    // --- FUNCIÓN PARA LOGIN ---
    async login(loginDto: any) {
        const { email, password } = loginDto;

        // 1. Buscar usuario por email
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new BadRequestException('Credenciales inválidas');
        }

        // 2. Verificar contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new BadRequestException('Credenciales inválidas');
        }

        // 3. Generar y retornar JWT
        const token = this.jwtService.sign({
            sub: user._id,
            email: user.email,
        });

        return {
            message: 'Login exitoso',
            token,
            user: { nickname: user.nickname, email: user.email },
        };
    }
}