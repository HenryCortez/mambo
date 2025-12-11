import {
  Controller,
  Post,
  Get,
  UseGuards,
  Req,
  Logger,
  HttpCode,
  HttpStatus,
  Body
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger'
import { SendsService } from './sends.service'
import { CreateSendDto, MultipleSendResponseDto } from './dto/create-send.dto'
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard'
import { CommonService } from 'src/common/common.service'

@ApiTags('sends')
@Controller('sends')
@ApiBearerAuth('jwt-auth')
@UseGuards(JwtAuthGuard)
export class SendsController {
  constructor(
    private readonly sendsService: SendsService,
    private readonly jwtService: CommonService
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send document to multiple recipients' })
  @ApiBody({ type: CreateSendDto })
  @ApiResponse({
    status: 201,
    description: 'Document sent successfully',
    type: MultipleSendResponseDto
  })
  @ApiResponse({ status: 404, description: 'Document or user not found' })
  @ApiResponse({ status: 400, description: 'Bad request - cannot send to yourself' })
  async sendDocument(
    @Body() createSendDto: CreateSendDto,
    @Req() req
  ): Promise<MultipleSendResponseDto> {
    try {
      // Extract JWT token from Authorization header
      const decodedToken = this.jwtService.getDatosToken(req.headers.authorization)

      return await this.sendsService.sendToMultipleReceptors(decodedToken?.sub, createSendDto)
    } catch (error) {
      Logger.error('Error sending document:', error)
      throw error
    }
  }

  @Get('my-sends')
  @ApiOperation({ summary: 'Get all sends for the current user (both sent and received)' })
  @ApiResponse({ status: 200, description: 'Sends retrieved successfully' })
  async getMySends(@Req() req) {
    try {
      // Extract JWT token from Authorization header
      const decodedToken = this.jwtService.getDatosToken(req.headers.authorization)

      return await this.sendsService.getSendsByUser(decodedToken?.sub)
    } catch (error) {
      Logger.error('Error getting sends:', error)
      throw error
    }
  }
}
