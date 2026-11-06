# Frontend de Reservas TCS · Banco Pichincha

Web app responsive para reservar salas de reuniones, laboratorios de IA y laptops de IA. Está hecha con
**Next.js 16** (App Router con `output: "export"`), React 19, TypeScript strict, Tailwind CSS 4 y
shadcn/ui. Es un sitio estático que se publica en Azure Static Web Apps.

## Requisitos

- Node.js 22 LTS (`.nvmrc`). Con nvm: `nvm use`. Otra versión de npm puede desincronizar el `package-lock.json`.
- La API del backend corriendo en `http://localhost:3001/api/v1` para las pantallas conectadas.

## Primer arranque

```bash
npm ci                         # dependencias y hooks de git
cp .env.example .env.local     # variables públicas para desarrollo
npm run dev                    # http://localhost:3000
```

## Variables de entorno

Las variables `NEXT_PUBLIC_*` se incrustan en el JavaScript **al compilar**: cambiar una exige volver a
hacer `npm run build`. Se validan con zod en `src/lib/config.ts`: en cuanto el código importa
`publicConfig`, la compilación falla si falta alguna o no es válida. Nunca pongas secretos aquí: todo lo que lleva `NEXT_PUBLIC_` es visible en el navegador.

| Variable                        | Obligatoria | Ejemplo                        | Descripción                                                                                     |
| ------------------------------- | ----------- | ------------------------------ | ----------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`           | sí          | `http://localhost:3001/api/v1` | URL base de la API, con `http` o `https`                                                        |
| `NEXT_PUBLIC_ENABLE_TEST_LOGIN` | no          | `false`                        | Temporal. Con `true` habilita `/login-pruebas`, el login del SUPERADMIN con correo y contraseña |

El Client ID de Google no se configura aquí: el frontend lo pide a la API en `GET /auth/config`.

## Comandos

| Comando             | Para qué                                                  |
| ------------------- | --------------------------------------------------------- |
| `npm run dev`       | Servidor de desarrollo                                    |
| `npm run build`     | Genera el sitio estático en `out/`                        |
| `npm run lint`      | ESLint (`lint:fix` corrige lo automático)                 |
| `npm run format`    | Prettier sobre todo el repo (`format:check` solo revisa)  |
| `npm run typecheck` | TypeScript sin compilar                                   |
| `npm test`          | Pruebas unitarias con Vitest (`test:watch` en modo watch) |

Cada commit pasa por husky: `lint-staged` formatea y corrige los archivos en stage y `commitlint` exige
[Conventional Commits](https://www.conventionalcommits.org/) (`feat(booking): ...`).

## Estructura

```
src/
├── app/                # rutas: páginas delgadas que componen AppShell + un feature
├── features/<name>/    # UI y lógica de cada módulo
├── components/ui/      # componentes de shadcn generados
├── components/shared/  # piezas reutilizables entre features
├── components/layout/  # AppShell y navegación
├── lib/                # utilidades, configuración, auth, labels y reglas compartidas
└── types/              # tipos de dominio
```

- Todo el texto visible está en español y centralizado en `src/lib/labels.ts`.
- Los tests van junto al archivo: `booking-rules.ts` → `booking-rules.test.ts`.

## CI y despliegue

- CI (`.github/workflows/ci.yml`): en cada PR a `develop` o `main` y en cada push a `develop` corre lint,
  formato, typecheck, tests y build.
- Despliegue: el workflow de Azure Static Web Apps publica `out/` en cada push a `main`. Configura en
  GitHub la protección de `main` para exigir que el check **CI** pase antes de mergear.
- En el workflow de despliegue hay que definir `NEXT_PUBLIC_API_URL` con la URL de la API de Azure.
