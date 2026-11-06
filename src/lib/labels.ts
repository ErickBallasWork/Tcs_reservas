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

export const roleFieldLabels = {
  legend: 'Roles',
  building: 'Edificio que administra',
  chooseBuilding: 'Elige un edificio',
};

export const accessRequestLabels = {
  title: 'Solicitudes de acceso',
  tabs: { PENDING: 'Pendientes', APPROVED: 'Aprobadas', REJECTED: 'Rechazadas' },
  empty: {
    PENDING: 'No hay solicitudes pendientes.',
    APPROVED: 'Todavía no hay solicitudes aprobadas.',
    REJECTED: 'Todavía no hay solicitudes rechazadas.',
  },
  kind: { NEW_USER: 'Usuario nuevo', NEW_DEVICE: 'Dispositivo nuevo' },
  loading: 'Cargando solicitudes…',
  retry: 'Reintentar',
  requestedAt: 'Solicitada',
  decidedBy: (name: string) => `Resuelta por ${name}`,
  device: 'Dispositivo',
  department: 'Departamento',
  approve: 'Aprobar',
  reject: 'Rechazar',
  approveTitle: 'Aprobar solicitud',
  approveNewUser: (name: string, email: string) =>
    `${name} (${email}) será dada de alta con los roles que elijas.`,
  approveNewDevice: (name: string, email: string) =>
    `${name} (${email}) ya tiene cuenta. Se autorizará este dispositivo nuevo.`,
  confirmApprove: 'Aprobar',
  rejectTitle: 'Rechazar solicitud',
  rejectIntro: 'La persona verá este motivo.',
  rejectReason: 'Motivo del rechazo',
  confirmReject: 'Rechazar',
  cancel: 'Cancelar',
  saving: 'Guardando…',
  previous: 'Anterior',
  next: 'Siguiente',
  page: (page: number, total: number) => `Página ${page} de ${total}`,
};

export const userLabels = {
  searchLabel: 'Buscar',
  searchPlaceholder: 'Nombre o correo',
  loading: 'Cargando…',
  retry: 'Reintentar',
  noResults: 'No hay usuarios que coincidan.',
  active: 'Activo',
  inactive: 'Desactivado',
  lastLogin: (date: string) => `Último ingreso: ${date}`,
  neverLoggedIn: 'Todavía no ingresó',
  editRoles: 'Editar roles',
  editRolesTitle: 'Editar roles',
  associates: 'Asociados a cargo',
  devices: 'Dispositivos',
  save: 'Guardar',
  saving: 'Guardando…',
  cancel: 'Cancelar',
  close: 'Cerrar',
  deactivate: {
    action: 'Desactivar',
    title: 'Desactivar usuario',
    description: (name: string) =>
      `${name} no podrá ingresar y se cerrarán sus sesiones en todos los dispositivos.`,
    confirm: 'Desactivar',
  },
  activate: {
    action: 'Activar',
    title: 'Activar usuario',
    description: (name: string) =>
      `${name} podrá volver a ingresar, pero deberá pedir acceso de nuevo en sus dispositivos.`,
    confirm: 'Activar',
  },
  associatesTitle: 'Asociados a cargo',
  associatesIntro: (name: string) => `Elige las personas que ve ${name} en sus paneles.`,
  selectedCount: (count: number) =>
    `${count} ${count === 1 ? 'persona seleccionada' : 'personas seleccionadas'}`,
  devicesTitle: 'Dispositivos aprobados',
  noDevices: 'Este usuario no tiene dispositivos aprobados.',
  unnamedDevice: 'Dispositivo sin nombre',
  lastUsed: (date: string) => `Último uso: ${date}`,
  revoked: 'Revocado',
  revoke: 'Revocar',
};

export const catalogAdminLabels = {
  loading: 'Cargando…',
  retry: 'Reintentar',
  save: 'Guardar',
  saving: 'Guardando…',
  cancel: 'Cancelar',
  close: 'Cerrar',
  edit: 'Editar',
  active: 'Activo',
  inactive: 'Inactivo',
  showInactive: 'Mostrar inactivos',
  filterBuilding: 'Edificio',
  allBuildings: 'Todos los edificios',
  filterType: 'Tipo',
  allTypes: 'Salas y laboratorios',
  noResults: 'No hay elementos para mostrar.',
  chooseOption: 'Elige una opción',
  noAddress: 'Sin dirección',
  fields: {
    name: 'Nombre',
    address: 'Dirección',
    building: 'Edificio',
    type: 'Tipo',
    capacity: 'Capacidad (personas)',
    equipment: 'Equipamiento',
    rules: 'Reglas de uso',
    assetTag: 'Código de inventario',
    lab: 'Laboratorio',
  },
  errors: {
    nameRequired: 'Escribe un nombre.',
    nameTooLong: 'El nombre es demasiado largo.',
    addressTooLong: 'La dirección es demasiado larga.',
    buildingRequired: 'Elige un edificio.',
    typeRequired: 'Elige un tipo.',
    labRequired: 'Elige un laboratorio.',
    capacityInvalid: 'Indica un número entero de personas, de 1 en adelante.',
    equipmentTooLong: 'El equipamiento es demasiado largo.',
    rulesTooLong: 'Las reglas son demasiado largas.',
    assetTagTooLong: 'El código es demasiado largo.',
  },
  buildings: {
    title: 'Edificios',
    create: 'Nuevo edificio',
    createTitle: 'Nuevo edificio',
    editTitle: 'Editar edificio',
    resourceCount: (count: number) =>
      `${count} ${count === 1 ? 'sala o laboratorio' : 'salas y laboratorios'}`,
  },
  resources: {
    title: 'Salas y laboratorios',
    create: 'Nueva sala o laboratorio',
    createTitle: 'Nueva sala o laboratorio',
    editTitle: 'Editar sala o laboratorio',
    laptopCount: (count: number) => `${count} ${count === 1 ? 'laptop' : 'laptops'}`,
    moveHint: 'Si cambias el edificio de un laboratorio, sus laptops se mueven con él.',
  },
  laptops: {
    title: 'Laboratorios y laptops',
    add: 'Agregar laptop',
    createTitle: 'Nueva laptop',
    editTitle: 'Editar laptop',
    noLabs: 'Todavía no hay laboratorios de IA. Crea uno en «Salas y laboratorios».',
    noLaptops: 'Este laboratorio no tiene laptops.',
    moveHint: 'Mover una laptop de laboratorio no es posible mientras tenga reservas futuras.',
    newLabHint: 'Si el laboratorio tiene reservas completas futuras, la laptop queda bloqueada.',
  },
  subjects: {
    BUILDING: 'edificio',
    MEETING_ROOM: 'sala',
    AI_LAB: 'laboratorio',
    LAPTOP: 'laptop',
  },
  toggle: {
    deactivateTitle: (subject: string) => `Inactivar ${subject}`,
    activateTitle: (subject: string) => `Reactivar ${subject}`,
    deactivate: (name: string) =>
      `${name} dejará de ser reservable. No se borra y se puede reactivar.`,
    activate: (name: string) => `${name} volverá a ser reservable.`,
    labCascade: ' Sus laptops también se inactivarán.',
    labKeepsLaptops: ' Sus laptops siguen inactivas: reactívalas una por una.',
    buildingCascade: ' Sus salas, laboratorios y laptops dejarán de ser reservables.',
    confirmDeactivate: 'Inactivar',
    confirmActivate: 'Reactivar',
    blocked: (count: number) =>
      `Hay ${count} ${count === 1 ? 'reserva futura' : 'reservas futuras'}. Resuélvelas antes de inactivar.`,
    checking: 'Revisando reservas futuras…',
  },
  futureReservation: {
    by: (name: string) => `Reservada por ${name}`,
    purpose: {
      INTERNAL_MEETING: 'Reunión interna',
      CLIENT_MEETING: 'Reunión con cliente',
      TRAINING: 'Entrenamiento',
    } as Record<string, string>,
    status: {
      PENDING_APPROVAL: 'Pendiente de aprobación',
      CONFIRMED: 'Confirmada',
      CHECKED_IN: 'En uso',
    } as Record<string, string>,
  },
};
