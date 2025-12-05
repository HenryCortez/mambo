// src/auth/strategies/microsoft.strategy.ts
import 'dotenv/config';
import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-microsoft';
import { AuthService } from '../auth.service';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor(private authService: AuthService) {
    const requiredVars = ['MICROSOFT_CLIENT_ID', 'MICROSOFT_CLIENT_SECRET', 'MICROSOFT_CALLBACK_URL'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Faltan las siguientes variables de entorno: ${missingVars.join(', ')}`);
    }

    super({
        clientID: process.env.MICROSOFT_CLIENT_ID as string,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET as string,
        callbackURL: process.env.MICROSOFT_CALLBACK_URL as string,
        scope: ['user.read', 'email', 'openid', 'profile'],
        tenant: 'common',
        authorizationURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        tokenURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const { name, emails, id } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      microsoftId: id,
      accessToken,
      refreshToken,
    };
    return await this.authService.handleMicrosoftLogin(user);
  }
}