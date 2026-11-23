# AM_Proyecto
Proyecto de Aplicaciones Móviles desarrollado con React Native y Expo.

## Descripción

Este proyecto es una aplicación móvil diseñada para ofrecer una experiencia sólida y fluida, integrando persistencia de datos local y remota, navegación estructurada, manejo de estado global y validaciones estrictas de formularios.

## Librerías y Tecnologías Utilizadas

### Backend y Base de Datos
* **@supabase/supabase-js**: Cliente oficial para la interacción con los servicios y la base de datos de Supabase.
* **expo-sqlite**: Base de datos SQLite nativa para almacenamiento local estructurado en Expo.
* **@react-native-async-storage/async-storage**: Almacenamiento local persistente clave-valor.

### Soporte y Compatibilidad
* **react-native-url-polyfill**: Polyfill para asegurar el soporte completo de la API estándar de URL en React Native.
* **expo-constants**: Acceso a las constantes del sistema y configuraciones en el entorno de Expo.
* **expo-mail-composer**: Interfaz nativa para redactar y enviar correos electrónicos directamente desde la aplicación.

### Navegación
* **@react-navigation/native**: Infraestructura principal y contenedores para el flujo de navegación.
* **@react-navigation/native-stack**: Navegación por pila nativa (Stack Navigator).
* **@react-navigation/bottom-tabs**: Navegación basada en pestañas inferiores (Bottom Tabs).
* **react-native-screens**: Optimización de rendimiento que utiliza vistas nativas subyacentes.
* **react-native-safe-area-context**: Manejo adaptativo del área segura (muescas, barras de estado y del sistema).

### Gestión de Estado
* **zustand**: Biblioteca liviana, rápida y escalable para la administración del estado global de la aplicación.

### Formularios y Validación
* **react-hook-form**: Gestión eficiente y de alto rendimiento del estado de formularios.
* **zod**: Declaración de esquemas y validación de tipos de datos.
* **@hookform/resolvers**: Adaptador para integrar esquemas de validación de Zod con React Hook Form.

## Requisitos Previos

* Node.js (versión LTS recomendada)
* npm o yarn
* Expo Go o entorno de emulación configurado (Android Studio / Xcode)

## Instalación

1. Clonar este repositorio:
```bash
git clone <URL_DEL_REPOSITORIO>
cd AM_Proyecto
```

2. Instalar las dependencias del proyecto:
```bash
npm install
```

3. Iniciar el servidor de desarrollo:
```bash
npx expo start
```