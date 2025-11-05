# Diagrama de Componentes UML - FicherApp

## Descripción

Este documento describe la arquitectura de componentes de **FicherApp**, una aplicación de escritorio desarrollada con Electron.js, React y TypeScript para comprimir y descomprimir archivos.

## Diagrama UML

El diagrama completo está disponible en formato PlantUML: `ComponentDiagram.png`

## Arquitectura de la Aplicación

### 1. Main Process (Electron - main.ts)

**Responsabilidades:**
- Crear y gestionar la ventana principal de la aplicación
- Manejar operaciones del sistema de archivos
- Procesar archivos comprimidos (tar, gzip, tgz, zip)
- Gestionar comunicación IPC segura con el proceso Renderer
- Manejar diálogos del sistema (abrir/guardar archivos)

**Métodos IPC principales:**
- `open-select-archive-dlg`: Abrir diálogo para seleccionar archivo comprimido
- `extract-archv`: Extraer archivos del comprimido
- `open-compress-file-dlg`: Abrir diálogo para seleccionar archivos/carpetas a comprimir
- `compress-dir`: Comprimir archivos/carpetas
- `window-minimize`, `window-maximize`, `window-close`: Control de ventana

### 2. Preload Script (preload.ts)

**Responsabilidades:**
- Aislar el contexto del proceso Renderer
- Exponer API segura mediante `contextBridge`
- Crear bridge entre Main Process y Renderer Process
- Gestionar comunicación IPC usando `ipcRenderer.invoke()`

**API expuesta (`window.electron`):**
- `open_select_archive_dialog()`: Abrir archivo comprimido
- `handle_extract()`: Extraer archivos seleccionados
- `open_compress_file_dialog()`: Abrir archivos/carpetas para comprimir
- `handle_compress()`: Comprimir archivos seleccionados
- `windowMinimize()`, `windowMaximize()`, `windowClose()`: Control de ventana
- `windowIsMaximized()`: Verificar estado de ventana

### 3. Renderer Process (React)

#### 3.1. Componente Principal (App.tsx)
- Componente raíz de la aplicación React
- Renderiza `MainComponent`

#### 3.2. MainComponent (MainComponent.tsx)
**Responsabilidades:**
- Gestionar navegación por tabs (Extraer/Comprimir)
- Coordinar la lógica de extracción y compresión
- Manejar estados de carga
- Renderizar componentes según el estado actual

**Props:** Ninguno (usa Zustand para estado global)

#### 3.3. TitleBar (TitleBar.tsx)
**Responsabilidades:**
- Mostrar barra de título personalizada
- Controlar ventana (minimizar, maximizar, cerrar)
- Mostrar título de la aplicación
- Área arrastrable para mover ventana

#### 3.4. ExtractComponent (ExtractComponent.tsx)
**Responsabilidades:**
- Mostrar lista de archivos dentro del comprimido
- Permitir selección de archivos a extraer
- Gestionar proceso de extracción
- Mostrar indicadores de progreso

**Estado:** Usa `extract_dir_content` del store Zustand

#### 3.5. CompressComponent (CompressComponent.tsx)
**Responsabilidades:**
- Mostrar lista de archivos/carpetas a comprimir
- Permitir selección de archivos
- Gestionar proceso de compresión
- Mostrar indicadores de progreso
- Mostrar información del formato de compresión

**Estado:** Usa `compress_dir_content` del store Zustand

### 4. State Management (Zustand)

#### 4.1. Zustand Store (zustand-state.ts)
**Responsabilidades:**
- Gestionar estado global de la aplicación
- Persistir datos en localStorage
- Proporcionar métodos para actualizar estado

**Estado persistido:**
- `extract_dir_content`: Contenido del archivo a extraer
- `compress_dir_content`: Contenido a comprimir

**Middleware utilizado:**
- `persist`: Persistencia automática en localStorage
- `devtools`: Integración con Redux DevTools

### 5. Shared (Tipos y Utilidades)

#### 5.1. Types (types.ts)
**Tipos TypeScript definidos:**
- `IMainState`: Interfaz del estado principal
- `TArchiveExtract`: Tipo para archivos a extraer
- `TCompressDirContent`: Tipo para contenido a comprimir
- `TCompressDirItem`: Tipo para items individuales
- `TCompressFileTypes`: Tipos de archivos soportados

#### 5.2. Functions (functions.ts)
**Utilidades:**
- `broadcast_event()`: Función para emitir eventos personalizados

## Flujo de Comunicación

### Flujo de Extracción:
1. Usuario hace clic en "Abrir Archivo" en `MainComponent`
2. `MainComponent` invoca `window.electron.open_select_archive_dialog()`
3. `PreloadScript` envía mensaje IPC a `MainProcess`
4. `MainProcess` abre diálogo del sistema y procesa archivo
5. `MainProcess` retorna datos al `PreloadScript`
6. `PreloadScript` retorna datos a `MainComponent`
7. `MainComponent` actualiza `ZustandStore`
8. `ExtractComponent` se renderiza con los datos del store
9. Usuario selecciona archivos y hace clic en "Extraer"
10. Se repite el flujo IPC para la extracción

### Flujo de Compresión:
1. Usuario selecciona tipo de archivo (tar, gzip, tgz, zip)
2. `MainComponent` invoca `window.electron.open_compress_file_dialog()`
3. Flujo IPC similar al de extracción
4. `CompressComponent` se renderiza con los datos
5. Usuario selecciona archivos y comprime

## Seguridad

### Context Isolation
- ✅ `contextIsolation: true` - Aisla el contexto del renderer
- ✅ `nodeIntegration: false` - Desactiva integración de Node.js en renderer
- ✅ `contextBridge` - Crea puente seguro entre procesos

### TypeScript
- ✅ Todos los tipos están definidos
- ✅ Interfaces para todas las estructuras de datos
- ✅ Tipado estricto en toda la aplicación

## Persistencia de Datos

### LocalStorage (Zustand Persist)
- Los datos se persisten automáticamente en `localStorage`
- Clave de almacenamiento: `ficherapp-storage`
- Se restauran al iniciar la aplicación
- Solo se persisten los datos de estado, no las funciones

## Dependencias Principales

- **Electron**: 38.1.2
- **React**: 19.1.1
- **TypeScript**: ~4.5.4
- **Zustand**: 5.0.8
- **adm-zip**: 0.5.16
- **compressing**: 2.0.0
- **decompress**: 4.2.1

## Notas de Implementación

1. **Sin Frame Nativo**: La aplicación usa `frame: false` para tener control total sobre la UI
2. **Barra de Título Personalizada**: Implementada con `TitleBar` component
3. **Diseño Glassmorphism**: Estilos modernos con efectos de vidrio y transparencia
4. **Paleta Azul**: Tema consistente con gradientes azules estilo iOS

## Mejoras Futuras

- [ ] Agregar historial de archivos comprimidos/extraídos
- [ ] Implementar compresión con progreso detallado
- [ ] Agregar soporte para más formatos (7z, rar, etc.)
- [ ] Implementar compresión de múltiples archivos en paralelo
- [ ] Agregar configuración de usuario (preferencias de compresión)

