import { Injectable, Logger } from '@nestjs/common'
import { PDFDocument, rgb } from 'pdf-lib'
import * as fs from 'fs'
import * as path from 'path'

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name)

  async addCodeToPdf(file: Express.Multer.File, code: string): Promise<Express.Multer.File> {
    try {
      // Cargar el PDF existente
      const pdfDoc = await PDFDocument.load(file.buffer)

      // Obtener la primera página
      const pages = pdfDoc.getPages()
      const firstPage = pages[0]

      // Agregar el código de encriptado como texto visible en la parte superior
      const { width, height } = firstPage.getSize()

      // Cubrir el área donde está el "daaa" con un rectángulo blanco
      // Coordenadas aproximadas para cubrir el texto en la parte inferior izquierda
      firstPage.drawRectangle({
        x: 45,
        y: 45,
        width: 100,
        height: 20,
        color: rgb(1, 1, 1) // Blanco para cubrir el texto existente
      })

      // Escribir el código en la misma posición donde estaba "daaa"
      firstPage.drawText(code, {
        x: 50,
        y: 50,
        size: 12,
        color: rgb(0, 0, 0)
      })

      // También mantener el código en la parte superior como antes
      firstPage.drawText(`CÓDIGO: ${code}`, {
        x: 50,
        y: height - 50,
        size: 12,
        color: rgb(0, 0, 0)
      })

      // Serializar el PDF modificado
      const modifiedPdfBytes = await pdfDoc.save()

      // Retornar el archivo modificado
      return {
        ...file,
        buffer: Buffer.from(modifiedPdfBytes),
        size: modifiedPdfBytes.length
      }
    } catch (error) {
      this.logger.error('Error al modificar PDF:', error)
      throw new Error('No se pudo modificar el PDF con el código de encriptado')
    }
  }
}
