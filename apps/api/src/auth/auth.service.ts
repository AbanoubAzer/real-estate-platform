import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
      }
    });

    // If an anonymous sessionId was provided, migrate their data!
    if (dto.sessionId) {
      await this.migrateAnonymousData(dto.sessionId, user.id);
    }

    return this.generateTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  private async generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    
    // In a full implementation, we would generate a refresh token,
    // hash it, and store it in UserSession.

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    };
  }

  private async migrateAnonymousData(sessionId: string, userId: string) {
    // 1. Migrate Favorites
    await this.prisma.favorite.updateMany({
      where: { userId: sessionId }, // Previously userId stored the sessionId
      data: { userId: userId }
    });

    // 2. Migrate UserEvents
    await this.prisma.userEvent.updateMany({
      where: { sessionId: sessionId },
      data: { userId: userId }
    });

    // 3. Migrate SavedSearches
    await this.prisma.savedSearch.updateMany({
      where: { userId: sessionId },
      data: { userId: userId }
    });
    
    // We could optionally delete the AnonymousSession or keep it for audit.
  }
}
