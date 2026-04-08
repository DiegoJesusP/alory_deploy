# Frontend SPA - Alory Cosmetology

## 📁 Estructura del Proyecto

```
src/
├── assets/              # Archivos estáticos (imágenes, fuentes, etc.)
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes UI base (shadcn/ui)
│   └── landing/        # Componentes de la Landing Page
│       ├── Header.tsx      # Encabezado
│       ├── Hero.tsx        # Sección hero
│       ├── Services.tsx    # Sección de servicios
│       ├── Features.tsx    # Sección de características
│       ├── About.tsx       # Sección sobre nosotros
│       ├── Contact.tsx     # Sección de contacto
│       ├── Footer.tsx      # Pie de página
│       └── index.ts        # Exportaciones
├── constants/          # Constantes y datos estáticos
│   └── landing.constants.ts  # Constantes de la landing page
├── context/            # React Context providers (estado global)
├── hooks/              # Custom hooks de React
│   └── useLocalStorage.ts    # Hook para localStorage
├── lib/                # Bibliotecas y utilidades
│   └── utils.ts        # Funciones de utilidad (cn, etc.)
├── modules/            # Módulos de la aplicación
│   └── Landing/        # Módulo Landing Page
│       └── HomePage.tsx      # Página principal
├── router/             # Configuración de rutas
│   └── router.tsx      # Definición de rutas
├── styles/             # Estilos globales
├── types/              # Definiciones de tipos TypeScript
│   └── service.types.ts      # Tipos de servicios
├── index.css           # Estilos base
└── main.tsx            # Punto de entrada de la aplicación
```

## 🏗️ Principios de Arquitectura

### Clean Code
- **Separación de responsabilidades**: Cada componente tiene una única responsabilidad
- **Componentes pequeños**: Los componentes grandes se dividen en componentes más pequeños y manejables
- **Reutilización**: Componentes y hooks reutilizables en toda la aplicación
- **Tipado fuerte**: TypeScript para seguridad de tipos

### Organización por Módulos
- Los componentes de la Landing están en `components/landing/`
- Los componentes UI compartidos están en `components/ui/`
- Los tipos y constantes están centralizados
- Cada módulo en `modules/` representa una página o sección principal

### Importaciones con Alias
```typescript
import { Button } from '@/components/ui/button';
import { Header, Hero, Services } from '@/components/landing';
import { Service } from '@/types';
import { DEFAULT_SERVICES } from '@/constants';
```

## 🔧 Tecnologías

- **React 19** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **Tailwind CSS** - Estilos
- **React Router** - Enrutamiento
- **Lucide React** - Iconos
- **shadcn/ui** - Componentes UI

## 📝 Convenciones de Código

### Nombres de Archivos
- Componentes: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Utilidades: `camelCase.ts`
- Tipos: `camelCase.types.ts`
- Constantes: `camelCase.constants.ts`

### Estructura de Componentes
```typescript
// 1. Imports
import { useState } from 'react';
import type { ComponentProps } from '@/types';

// 2. Types/Interfaces (si no están en archivos separados)
interface Props {
  // ...
}

// 3. Component
export function Component({ prop }: Props) {
  // 3.1 Hooks
  const [state, setState] = useState();
  
  // 3.2 Functions
  const handleClick = () => {
    // ...
  };
  
  // 3.3 Return
  return (
    <div>{/* JSX */}</div>
  );
}
```

## 🚀 Comandos

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Preview
npm run preview

# Lint
npm run lint
```

## 📦 Agregar Nuevos Módulos

1. Crear carpeta en `src/modules/NuevoModulo`
2. Crear componentes en `src/components/nombre-modulo/` si son específicos
3. Crear tipos en `src/types/` si es necesario
4. Crear constantes en `src/constants/` si es necesario
5. Exportar componentes desde `components/nombre-modulo/index.ts`
6. Usar en el router

## 🎨 Agregar Componentes UI

Los componentes UI se agregan con shadcn/ui o manualmente en `src/components/ui/`

## 📚 Recursos

- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
