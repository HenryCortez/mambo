# Docs Service - Flujo de Creación de Documentos (Frontend)

## Descripción General
El servicio `DocsService` maneja el flujo completo de creación y gestión de documentos PDF en el sistema, con soporte para dos categorías: documentos normales (con contraseña) y documentos encriptados.

## Flujo de Creación de Documentos (Desde Frontend)

### 1. Usuario da a Guardar Documento
El usuario completa el formulario y presiona "Guardar":

#### **Datos del Formulario Frontend:**
- **file**: Archivo PDF seleccionado
- **type**: Tipo de documento ('OFFICE', 'MEMORANDUM', 'NONE')
- **category**: Categoría ('NORMAL', 'ENCRYPTED')
- **password**: Contraseña (solo para categoría NORMAL)
- **textContent**: Texto del documento (para encriptar si aplica)

### 2. Proceso de Encriptación (Frontend)
Si la categoría es **ENCRYPTED**, el frontend realiza:

```typescript
// 1. Encriptar el texto del documento
const encryptionResult = await encryptText(textContent)

// 2. Obtener datos de encriptación
const {
  code: encryptionCode,      // Código generado
  length: textLength,        // Longitud del texto
  frequencies: textFreq      // Frecuencias de caracteres
} = encryptionResult
```

### 3. Envío al Backend (DocsService)
El frontend envía los datos procesados:

#### **CreateDocDto** - Datos recibidos por el backend:
- **file**: `Express.Multer.File` (requerido)
  - Archivo PDF original
  - Validación: Debe ser mimetype 'application/pdf'
- **type**: `TYPES` (requerido)
  - Opciones: 'OFFICE', 'MEMORANDUM', 'NONE'
- **category**: `CATEGORY` (requerido)
  - Opciones: 'NORMAL', 'ENCRYPTED'
- **password**: `string` (opcional)
  - Requerido solo para categoría NORMAL
- **code**: `string` (opcional)
  - **Viene del frontend** - Código de encriptado generado
- **length**: `number` (opcional)
  - **Viene del frontend** - Longitud del texto encriptado
- **frequencies**: `string` (opcional, JSON)
  - **Viene del frontend** - Frecuencias del texto encriptado

#### **DecodedToken** - Datos del usuario:
- **sub**: `number`
  - ID del usuario que crea el documento

### 4. Proceso en el Backend

#### Paso 1: Validaciones Iniciales
```typescript
// Validaciones básicas
- Verificar que se proporcionó un archivo
- Validar que el archivo sea PDF
- Extraer datos del DTO separando el archivo
```

#### Paso 2: Creación del Registro Base
```typescript
// Crear registro en base de datos
const doc_temp = await this.prisma.docs.create({
  data: {
    category: dto_res.category,
    type: dto_res.type,
    name: file.originalname
  }
})
```

#### Paso 3: Manejo por Categoría

**Categoría NORMAL:**
- Requiere contraseña obligatoria
- Se almacena la contraseña en el registro del documento

**Categoría ENCRYPTED:**
- **Recibe los datos ya procesados del frontend**
- Modifica el PDF para agregar el código de encriptado
- Crea registro de encriptación asociado

```typescript
// Para documentos encriptados
fileToUpload = await this.pdfService.addCodeToPdf(file, dto_res.code)

const data_encrypted: CreateEncryptionDto = {
  id_doc: doc_temp.id,
  code: dto_res.code,        // Del frontend
  length: dto_res.length,    // Del frontend
  frequencies: dto_res.frequencies  // Del frontend
}

await this.encryption.createEncryption(data_encrypted)
```

#### Paso 4: Subida a Strapi
```typescript
// Subir archivo modificado a Strapi
const doc_upload = await this.strapi.uploadPdf(fileToUpload)
doc_temp.url = doc_upload.url
doc_temp.id_strapi = doc_upload.id
```

#### Paso 5: Actualización y Registro de Creación
```typescript
// Actualizar documento con URL de Strapi
const doc_response = await this.prisma.docs.update({
  where: { id: doc_temp.id },
  data: doc_temp
})

// Registrar creación del documento
await this.creation.createCreation(decodeToken.sub, doc_temp.id)
```

### 5. Respuesta del Servicio al Frontend

#### **Retorno:**
```typescript
// Documento completo con:
{
  id: number,
  category: CATEGORY,
  type: TYPES,
  name: string,
  url: string,        // URL de Strapi
  id_strapi: number,  // ID en Strapi
  password?: string,  // Solo para NORMAL
  // ... otros campos
}
```

### 6. Flujo Completo Resumido (Frontend → Backend)

```
Frontend:
1. Usuario completa formulario → Guardar
   ↓
2. Si es ENCRYPTED: Encriptar texto → Obtener code/length/frequencies
   ↓
3. Enviar CreateDocDto con datos procesados + Token

Backend:
4. Validar archivo PDF
   ↓
5. Crear registro base en BD
   ↓
6. Procesar por categoría:
   - NORMAL: Asignar contraseña
   - ENCRYPTED: Usar datos del frontend + modificar PDF
   ↓
7. Subir a Strapi
   ↓
8. Actualizar URL en BD
   ↓
9. Registrar creación del usuario
   ↓
10. Retornar documento completo al frontend
```

### 7. Consideraciones Importantes

- **El frontend realiza la encriptación antes de enviar**
- **El backend recibe los datos de encriptación ya procesados**
- **Solo se permiten archivos PDF**
- **Los documentos NORMAL requieren contraseña obligatoria**
- **Los documentos ENCRYPTED requieren code, length, frequencies (del frontend)**
- **El PDF se modifica para incluir el código de encriptado**
- **Todos los documentos quedan asociados al usuario que los crea**
- **El archivo final se almacena en Strapi, no localmente**
