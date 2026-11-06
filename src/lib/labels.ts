import type { ResourceType as ApiResourceType, Role } from '@/api/types';
import type { ReservationReason, ReservationStatus, ResourceType } from '@/types';

export const appLabels = {
  title: 'Reservas TCS · Banco Pichincha',
  description: 'Reserva de salas de reuniones, laboratorios y laptops de IA',
};

export const statusLabels: Record<ReservationStatus, string> = {
  confirmed: 'Confirmada',
  pending: 'Pendiente',
  rejected: 'Rechazada',
  cancelled: 'Cancelada',
};

export const reasonLabels: Record<ReservationReason, string> = {
  internal_meeting: 'Reunión interna',
  client_meeting: 'Reunión con cliente',
  training: 'Entrenamiento',
  client_event: 'Evento con cliente',
};

export const resourceTypeLabels: Record<ResourceType, string> = {
  room: 'Sala',
  ai_lab: 'Laboratorio IA',
  laptop: 'Laptop',
};

export const catalogResourceTypeLabels: Record<ApiResourceType, string> = {
  MEETING_ROOM: 'Sala',
  AI_LAB: 'Laboratorio IA',
  LAPTOP: 'Laptop',
};

export const catalogLabels = {
  loading: 'Cargando catálogo…',
  empty: 'Todavía no hay edificios en el catálogo.',
  noResources: 'Este edificio no tiene salas ni laboratorios.',
  retry: 'Reintentar',
  capacity: (people: number) => `${people} ${people === 1 ? 'persona' : 'personas'}`,
  laptops: (count: number) => `${count} ${count === 1 ? 'laptop' : 'laptops'}`,
};

export const roleLabels: Record<Role, string> = {
  ASOCIADO: 'Asociado',
  ADMIN: 'Administrador',
  SPOC_ADMIN: 'SPOC Administrativo',
  LIDER: 'Líder de Conocimiento',
  SPOC_EDIFICIO: 'SPOC de Edificio',
  SUPERADMIN: 'Superadministrador',
};

export const authLabels = {
  brandTagline: 'Salas de reuniones y Laboratorio de IA',
  checkingDevice: 'Verificando este dispositivo…',
  unavailableTitle: 'No pudimos conectar',
  unavailableText: 'El servidor no responde. Revisa tu conexión e intenta de nuevo.',
  retry: 'Reintentar',
  loginTitle: 'Ingresar',
  loginIntro:
    'El acceso es por aprobación. Pide acceso con tu correo corporativo: un administrador lo revisa y este navegador queda autorizado para ingresar.',
  requestAccess: 'Solicitar acceso',
  allowedDomainsHint: 'Solo correos de estos dominios:',
  pendingTitle: 'Tu solicitud está en revisión',
  pendingText: (email: string) =>
    `Un administrador revisará la solicitud para ${email}. Esta pantalla se actualiza sola cuando haya una respuesta.`,
  approvedTitle: 'Solicitud aprobada',
  approvedText: 'Estamos habilitando este dispositivo…',
  rejectedTitle: 'Solicitud rechazada',
  rejectedReason: 'Motivo:',
  rejectedNoReason: 'No se indicó un motivo.',
  startOver: 'Pedir acceso de nuevo',
  cancelRequest: 'Usar otro correo',
  sessionEnded: 'Tu sesión terminó',
  requestTitle: 'Solicitar acceso',
  requestIntro:
    'Escribe tu correo corporativo. Si ya tienes cuenta y entras desde un dispositivo nuevo, este formulario también autoriza el dispositivo.',
  emailLabel: 'Correo corporativo',
  emailPlaceholder: 'nombre@tcs.com',
  fullNameLabel: 'Nombre completo',
  departmentLabel: 'Departamento (opcional)',
  submitRequest: 'Enviar solicitud',
  sending: 'Enviando…',
  backToLogin: 'Volver',
  emailInvalid: 'Escribe un correo válido.',
  emailDomain: 'Solo se permiten correos @tcs.com o @pichincha.com.',
  fullNameRequired: 'Escribe tu nombre completo.',
  fullNameTooLong: 'El nombre es demasiado largo.',
  departmentTooLong: 'El departamento es demasiado largo.',
  logout: 'Cerrar sesión',
};

export const notificationPermissionLabels = {
  banner: 'Activa las notificaciones para enterarte de tus reservas.',
  enable: 'Activar',
  seeSteps: 'Ver cómo',
  understood: 'Entendido',
  denied: {
    title: 'Notificaciones bloqueadas',
    description:
      'Para usar TCS Reservas debes permitir las notificaciones del navegador, y ahora están bloqueadas para este sitio.',
    steps: [
      'Haz clic en el icono del candado (o de ajustes) junto a la dirección del sitio.',
      'Busca «Notificaciones» y cámbialo a «Permitir».',
      'Recarga la página.',
    ],
  },
  unsupported: {
    title: 'Tu navegador no admite notificaciones',
    description:
      'Necesitas un navegador compatible. En iPhone, abre el menú Compartir, elige «Agregar a pantalla de inicio» y abre la app desde ahí (iOS 16.4 o superior).',
    steps: [] as string[],
  },
  granted: {
    title: 'Notificaciones activadas',
    body: 'Recibirás avisos de tus reservas.',
  },
};
