import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { User } from './models/users.model';
import { AuthService } from 'src/auth/auth.service';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';

@Injectable()
export class UsersService {
    constructor( 
        @InjectModel('User') private readonly usersModule: Model<User>, 
        private readonly authService: AuthService
    ) {}

    public async signUp(signUpDto: SignUpDto): Promise<User> {
        const user = new this.usersModule(signUpDto);
        return user.save();
    }

    public async signIn(signInDto: SignInDto
    ): Promise<{name: string; jwtToken:string; email: string;}> {
            const user = await this.findByEmail(signInDto.email);
            const match = await this.checkPassword(signInDto.password, user);
            if (!match){
                throw new NotFoundException('Invalid credentials');
            }

            const jwtToken = await this.authService.createAccessToken(user._id);

            return {name: user.name, jwtToken, email: user.email};
    }

    public async findAll(): Promise<User[]> {
        return this.usersModule.find();
    }

    private async findByEmail(email: string): Promise<User> {
        const user = await this.usersModule.findOne({email});

        if (!user){
            throw new NotFoundException('Email not found');
        }

        return user;
    }

    private async checkPassword(password: string, user: User): Promise<boolean> {
        const match = await bcrypt.compare(password, user.password);

        if (!match){
            throw new NotFoundException('Password not found');
        }

        return match;
    }
}
