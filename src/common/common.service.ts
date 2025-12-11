import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

export class DecodedToken {
  sub: number
  email: string
}

@Injectable()
export class CommonService {
  constructor(private readonly jwtService: JwtService) {}
  getDatosToken(authHeader: string): DecodedToken {
    const token = authHeader?.replace('Bearer ', '')
    // Decode token to get user info
    const decodedToken: DecodedToken = this.jwtService.decode(token)
    return decodedToken
  }
}
