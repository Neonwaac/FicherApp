# Documentación Técnica - FicherApp

## Índice

1. [Diagrama de Componentes UML](#diagrama-de-componentes-uml)
2. [Arquitectura](#arquitectura)
3. [Instalación](#instalación)
4. [Uso](#uso)

##  Diagrama de Componentes UML

El diagrama UML de componentes está disponible en dos formatos:

- **PlantUML** (`ComponentDiagram.png`) - Formato estándar para herramientas UML
- **Documentación Markdown** (`ComponentDiagram.md`) - Descripción detallada en texto

### Diagrama Simplificado (Texto)

```
┌─────────────────────────────────────────────────────────────┐
│                    Main Process (Electron)                   │
│                      [main.ts]                               │
│  • createWindow()                                           │
│  • IPC Handlers                                             │
│  • File System Operations                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │ IPC
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Preload Script                            │
│                    [preload.ts]                              │
│  • contextBridge                                            │
│  • IPC Bridge                                               │
└──────────────────────┬──────────────────────────────────────┘
                       │ window.electron API
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Renderer Process (React)                       │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   App.tsx    │  │ TitleBar.tsx │  │MainComponent │    │
│  └──────┬───────┘  └──────────────┘  └──────┬───────┘    │
│         │                                    │             │
│         └──────────────┬───────────────────┘             │
│                         │                                   │
│         ┌──────────────┴───────────────┐                  │
│         │                              │                   │
│  ┌──────▼──────┐            ┌─────────▼────────┐         │
│  │ExtractComp. │            │ CompressComponent│         │
│  └──────┬──────┘            └─────────┬────────┘         │
│         │                              │                   │
│         └──────────────┬───────────────┘                   │
│                        │                                    │
│              ┌─────────▼─────────┐                         │
│              │  Zustand Store    │                         │
│              │  [zustand-state]  │                         │
│              └─────────┬─────────┘                         │
│                        │                                    │
│              ┌─────────▼─────────┐                         │
│              │   localStorage     │                         │
│              │   (Persistencia)   │                         │
│              └────────────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

## Arquitectura

### Estructura de Procesos

FicherApp utiliza la arquitectura de procesos de Electron:

1. **Main Process**: Proceso principal que gestiona la aplicación
2. **Renderer Process**: Proceso que ejecuta React (UI)
3. **Preload Script**: Script que actúa como puente seguro entre procesos

### Comunicación IPC

La comunicación entre procesos se realiza mediante:

- **Main → Renderer**: `ipcMain.handle()` para recibir solicitudes
- **Renderer → Main**: `ipcRenderer.invoke()` para enviar solicitudes
- **Preload**: `contextBridge.exposeInMainWorld()` para API segura

### Gestión de Estado

El estado se gestiona con **Zustand** y se persiste automáticamente en **localStorage**.

## Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm start

# Compilar para producción
npm run package

# Crear instalador
npm run make
```

## Uso

### Extraer Archivos

1. Abre la aplicación
2. Haz clic en "Extraer Archivo"
3. Selecciona un archivo comprimido (tar, gzip, zip)
4. Selecciona los archivos a extraer
5. Haz clic en "Extraer Seleccionados" o "Extraer Todo"

### Comprimir Archivos

1. Haz clic en "Comprimir Archivos"
2. Selecciona el tipo de archivo (Tar, Gzip, Tgz, Zip)
3. Selecciona archivos o carpetas a comprimir
4. Selecciona los archivos específicos (si es carpeta)
5. Haz clic en "Comprimir Seleccionados" o "Comprimir Todo"

## Seguridad

-  Context Isolation activado
-  Node Integration desactivado
-  Comunicación IPC segura
-  TypeScript para tipado estricto
-  Validación de datos en todos los handlers

##  Notas de Desarrollo

- Los datos se persisten automáticamente al cambiar el estado
- El estado se restaura al reiniciar la aplicación
- La comunicación IPC es completamente tipada con TypeScript

