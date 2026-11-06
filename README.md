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

| Variable              | Obligatoria | Ejemplo                        | Descripción                              |
| --------------------- | ----------- | ------------------------------ | ---------------------------------------- |
| `NEXT_PUBLIC_API_URL` | sí          | `http://localhost:3001/api/v1` | URL base de la API, con `http` o `https` |

### Cómo usa la app esta variable

- `NEXT_PUBLIC_API_URL` es la dirección de la API. Todas las pantallas que muestran o guardan datos (disponibilidad, reservas, avisos, administración) llaman a esa dirección con un cliente HTTP único (`src/api/`).
- Termina en `/api/v1`: por ejemplo, `http://localhost:3001/api/v1` en local y `https://<tu-api>.azurewebsites.net/api/v1` en producción.
- Como el sitio es estático, la dirección queda escrita en el JavaScript durante `npm run build`. Si cambia la URL de la API, hay que volver a compilar y desplegar el frontend: no basta con cambiar un ajuste en Azure.
- La API debe tener el origen del frontend en su `CORS_ORIGINS`. Si falta, el navegador bloquea todas las llamadas y la app muestra errores de red aunque la API funcione.
- El frontend no necesita más variables: la clave pública del push se la pide a la API cuando la persona activa las notificaciones, y el acceso funciona por solicitud y dispositivo, sin proveedores externos.

### Producción: Azure Static Web Apps y GitHub

1. En GitHub, en este repo: Settings → Secrets and variables → Actions.
   - **Variable** `NEXT_PUBLIC_API_URL`: la URL de la API terminada en `/api/v1`, por ejemplo `https://<tu-api>.azurewebsites.net/api/v1`.
   - **Secret** `AZURE_STATIC_WEB_APPS_API_TOKEN_...`: el token del recurso de Static Web Apps. Normalmente ya existe, porque lo crea Azure al conectar el repo.
2. En el workflow de Static Web Apps (solo existe en `main`), el paso `Build And Deploy` debe pasar la variable al build:

   ```yaml
   env:
     NEXT_PUBLIC_API_URL: ${{ vars.NEXT_PUBLIC_API_URL }}
   ```

   Sin esto el build de producción falla, porque la configuración exige la URL. El CI de `develop` ya la lee de la variable y, si no existe, usa `http://localhost:3001/api/v1`.

3. En el backend, añade la URL de este sitio (con `https://` y sin barra final) a la App Setting `CORS_ORIGINS` de `reservas-backend`.
4. Haz el merge a `main`. Después de desplegar, abre el sitio y comprueba que `/login` y `/request-access` cargan y que no hay errores de CORS en la consola del navegador.

La guía del backend (variables de Azure y secretos) está en el README de `Backend_Reservas`, en "Producción: Azure y GitHub".

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
- La variable `NEXT_PUBLIC_API_URL` del despliegue se explica en "Producción: Azure Static Web Apps y GitHub".
