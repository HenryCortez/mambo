import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { CreateSendDto, SendResponseDto, MultipleSendResponseDto } from './dto/create-send.dto'

@Injectable()
export class SendsService {
  constructor(private readonly prisma: PrismaService) {}

  async sendToMultipleReceptors(
    id_emisor: number,
    createSendDto: CreateSendDto
  ): Promise<MultipleSendResponseDto> {
    const { id_doc, receptors, reading = true, writing = false } = createSendDto

    try {
      // Validate that the document exists
      const doc = await this.prisma.docs.findUnique({
        where: { id: id_doc }
      })

      if (!doc) {
        await this.updateCreationStatusOnError(
          id_doc,
          id_emisor,
          `Document with ID ${id_doc} not found`
        )
        throw new NotFoundException(`Document with ID ${id_doc} not found`)
      }

      // Validate that the emitter exists
      const emitter = await this.prisma.users.findUnique({
        where: { id: id_emisor }
      })

      if (!emitter) {
        await this.updateCreationStatusOnError(
          id_doc,
          id_emisor,
          `Emitter user with ID ${id_emisor} not found`
        )
        throw new NotFoundException(`Emitter user with ID ${id_emisor} not found`)
      }

      // Validate receptors exist
      const existingReceptors = await this.prisma.users.findMany({
        where: { id: { in: receptors } }
      })

      if (existingReceptors.length !== receptors.length) {
        const foundIds = existingReceptors.map((r) => r.id)
        const missingIds = receptors.filter((id) => !foundIds.includes(id))
        const errorMessage = `Receptors with IDs ${missingIds.join(', ')} not found`
        await this.updateCreationStatusOnError(id_doc, id_emisor, errorMessage)
        throw new NotFoundException(errorMessage)
      }

      // Check if the emitter is trying to send to themselves
      if (receptors.includes(id_emisor)) {
        const errorMessage = 'Cannot send document to yourself'
        await this.updateCreationStatusOnError(id_doc, id_emisor, errorMessage)
        throw new BadRequestException(errorMessage)
      }

      // Create send records for each receptor
      const sends = await this.prisma.$transaction(
        receptors.map((receptorId) =>
          this.prisma.sends.create({
            data: {
              id_emisor,
              id_receptor: receptorId,
              id_doc,
              reading,
              writing
            },
            include: {
              emisor: {
                select: { id: true, email: true, name: true }
              },
              receptor: {
                select: { id: true, email: true, name: true }
              },
              doc: {
                select: {
                  id: true,
                  name: true,
                  category: true,
                  type: true
                }
              }
            }
          })
        )
      )

      // Update creation status to SENT on success
      await this.prisma.creations.updateMany({
        where: {
          id_doc: id_doc,
          id_user: id_emisor
        },
        data: {
          status: 'SENT',
          details: `Document sent successfully to ${receptors.length} recipients`
        }
      })

      return {
        sends: sends.map((send) => ({
          id: send.id,
          id_emisor: send.id_emisor,
          id_receptor: send.id_receptor,
          id_doc: send.id_doc,
          reading: send.reading,
          writing: send.writing
        })),
        message: `Document sent successfully to ${receptors.length} recipients`
      }
    } catch (error) {
      // If it's already a handled error, just re-throw it
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error
      }

      // Handle unexpected errors
      await this.updateCreationStatusOnError(
        id_doc,
        id_emisor,
        `Unexpected error: ${error.message}`
      )
      throw error
    }
  }

  private async updateCreationStatusOnError(id_doc: number, id_user: number, errorMessage: string) {
    try {
      await this.prisma.creations.updateMany({
        where: {
          id_doc: id_doc,
          id_user: id_user
        },
        data: {
          status: 'NOT_SENT',
          details: errorMessage
        }
      })
    } catch (updateError) {
      // Log the error but don't throw to avoid masking the original error
      console.error('Failed to update creation status:', updateError)
    }
  }

  async getReceivedByUser(userId: number) {
    const sends = await this.prisma.sends.findMany({
      where: {
        id_receptor: userId
      },
      include: {
        emisor: {
          select: { id: true, email: true }
        },
        doc: {
          select: {
            id: true,
            name: true,
            category: true,
            type: true,
            url: true,
            encryptions: {
              select: {
                code_back: true,
                code_front: true,
                length_back: true,
                length_front: true,
                frequencies_back: true,
                frequencies_front: true
              }
            }
          }
        }
      },
      orderBy: {
        id: 'desc'
      }
    })

    return sends
  }
}
