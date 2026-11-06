import type {
  ReservationPurpose,
  ReservationStatus as ApiReservationStatus,
  ResourceType as ApiResourceType,
  Role,
} from '@/api/types';
import type { BookingProblem } from '@/lib/booking-checks';
import type { ReallocationProblem } from '@/lib/reallocation-form';

export const appLabels = {
  title: 'Reservas TCS · Banco Pichincha',
  description: 'Reserva de salas de reuniones, laboratorios y laptops de IA',
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

export const purposeLabels: Record<ReservationPurpose, string> = {
  INTERNAL_MEETING: 'Reunión interna',
  CLIENT_MEETING: 'Reunión con cliente',
  TRAINING: 'Entrenamiento',
};

export const reservationStatusLabels: Record<ApiReservationStatus, string> = {
  PENDING_APPROVAL: 'Pendiente',
  CONFIRMED: 'Confirmada',
  REJECTED: 'Rechazada',
  CANCELLED: 'Cancelada',
  CHECKED_IN: 'En uso',
  NO_SHOW: 'Inasistencia',
};

export const weekdayShortLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export const bookingProblemMessages: Record<BookingProblem, string> = {
  END_BEFORE_START: 'La hora de fin debe ser posterior a la de inicio.',
  NOT_ALIGNED: 'Las horas deben coincidir con franjas de 30 minutos.',
  MIN_ADVANCE: 'Se requiere al menos 24 horas de anticipación.',
  MAX_DURATION: 'La duración máxima continua es de 48 horas.',
  EDIT_TOO_LATE:
    'Faltan menos de 24 horas para la reserva original: solo puedes cambiar el detalle, el motivo o los asistentes.',
  MISSING_PURPOSE: 'Elige un motivo.',
  MISSING_DETAIL: 'Escribe el detalle o la justificación.',
  ATTENDEES_REQUIRED: 'Indica cuántas personas asistirán.',
  ATTENDEES_EXCEEDS_CAPACITY: 'Los asistentes superan la capacidad del recurso.',
};

export const availabilityLabels = {
  building: 'Edificio',
  timeRange: 'Horario',
  capacity: 'Capacidad mínima',
  anyCapacity: 'Cualquiera',
  ranges: [
    { value: 'morning', label: '08:00–13:00', from: '08:00', to: '13:00' },
    { value: 'afternoon', label: '13:00–18:00', from: '13:00', to: '18:00' },
    { value: 'evening', label: '18:00–22:00', from: '18:00', to: '22:00' },
  ],
  hasReservations: 'Con mis reservas',
  pickDay: 'Elige el día; solo desde mañana en adelante.',
  previousMonth: 'Mes anterior',
  nextMonth: 'Mes siguiente',
  free: 'Libre',
  occupied: 'Ocupado',
  blocked: 'Bloqueado por laboratorio',
  closed: 'Fuera de horario',
  reserve: 'Reservar',
  newReservation: 'Nueva reserva',
  noFreeSlots: 'Sin horarios libres en este rango.',
  noResources: 'No hay recursos con esos filtros.',
  loading: 'Cargando disponibilidad…',
  retry: 'Reintentar',
  labFull: (name: string) => `${name} (completo)`,
  laptops: (count: number) => `${count} ${count === 1 ? 'laptop' : 'laptops'}`,
  laptopsToggle: 'Ver laptops',
  freeRangeHint: 'Toca un horario libre para reservarlo.',
  blockedHint: 'Amarillo: la laptop está bloqueada por una reserva del laboratorio completo.',
};

export const bookingLabels = {
  createTitle: 'Nueva reserva',
  editTitle: 'Editar reserva',
  noResources: 'Todavía no hay recursos reservables.',
  loading: 'Cargando recursos…',
  retry: 'Reintentar',
  resource: 'Recurso',
  groups: {
    MEETING_ROOM: 'Salas de reuniones',
    AI_LAB: 'Laboratorios de IA (completo)',
    LAPTOP: 'Laptops de IA',
  },
  startDate: 'Fecha de inicio',
  startTime: 'Hora de inicio',
  endDate: 'Fecha de fin',
  endTime: 'Hora de fin',
  purpose: 'Motivo',
  choosePurpose: 'Selecciona un motivo',
  detail: 'Detalle / justificación',
  attendees: 'Asistentes',
  attendeesMax: (capacity: number) => `Máximo ${capacity}`,
  repeat: 'Repetir cada semana',
  repeatEvery: 'Frecuencia',
  everyWeeks: (n: number) => (n === 1 ? 'Cada semana' : `Cada ${n} semanas`),
  weekdays: 'Días de la semana',
  limit: 'Termina',
  limitCount: 'Después de un número de reservas',
  limitUntil: 'En una fecha',
  occurrenceCount: 'Número de reservas',
  until: 'Hasta el',
  preview: 'Ver fechas',
  previewing: 'Revisando…',
  previewTitle: 'Fechas de la serie',
  previewAvailable: 'Disponible',
  previewSummary: (available: number, total: number) =>
    `${available} de ${total} fechas están disponibles. Las demás se omitirán.`,
  submit: 'Solicitar reserva',
  submitSeries: 'Solicitar serie',
  submitEdit: 'Guardar cambios',
  sending: 'Enviando…',
  validations: 'Validaciones',
  ruleAdvance: 'Al menos 24 horas de anticipación',
  ruleDuration: 'Máximo 48 horas continuas',
  ruleSlot: 'Dentro del horario y sin choques',
  ruleAttendees: 'Asistentes dentro de la capacidad',
  trainingHint: 'Entrenamiento requiere aprobación del Líder.',
  conflicts: {
    SLOT_TAKEN: 'La franja se cruza con otra reserva.',
    OUTSIDE_OPERATING_HOURS: 'La franja está fuera del horario en que se puede reservar.',
  },
  errorTitle: 'No se pudo solicitar la reserva',
  errorDescription: 'Corrige lo siguiente e inténtalo de nuevo.',
  understood: 'Entendido',
  successTitle: 'Reserva confirmada',
  successPendingTitle: 'Solicitud enviada',
  successDescription: 'Tu reserva quedó registrada. Puedes verla en Mis reservas.',
  successPendingDescription:
    'Tu entrenamiento quedó pendiente de aprobación del Líder de Conocimiento. El espacio queda bloqueado mientras se decide.',
  editedTitle: 'Reserva actualizada',
  editedPendingTitle: 'Reserva pendiente de aprobación',
  editedDescription: 'Los cambios quedaron guardados.',
  editedPendingDescription:
    'Por el cambio, el Líder de Conocimiento debe aprobar la reserva de nuevo. El espacio queda bloqueado mientras se decide.',
  seriesTitle: (created: number) =>
    `${created} ${created === 1 ? 'reserva creada' : 'reservas creadas'}`,
  seriesPendingNote: 'Cada reserva de entrenamiento espera su propia aprobación del Líder.',
  seriesSkipped: (count: number) =>
    `${count} ${count === 1 ? 'fecha se omitió' : 'fechas se omitieron'}:`,
  makeAnother: 'Hacer otra reserva',
  viewMine: 'Ver mis reservas',
  close: 'Cerrar',
  summary: { resource: 'Recurso', start: 'Inicio', end: 'Fin', purpose: 'Motivo' },
};

export const myReservationsLabels = {
  tabs: { upcoming: 'Próximas', past: 'Pasadas' },
  empty: { upcoming: 'No tienes reservas próximas.', past: 'Todavía no tienes reservas pasadas.' },
  loading: 'Cargando tus reservas…',
  retry: 'Reintentar',
  pendingTraining: 'Entrenamiento pendiente de aprobación del Líder. El espacio queda bloqueado.',
  pagination: 'Paginación',
  previous: 'Anterior',
  next: 'Siguiente',
  page: (page: number, total: number) => `Página ${page} de ${total}`,
  edit: 'Editar',
  cancel: 'Cancelar',
  tooLate: 'Faltan menos de 24 horas: ya no se puede cancelar. Aún puedes editar el detalle.',
  seriesBadge: (index: number, total: number) => `Serie · ${index} de ${total}`,
  reallocatedBadge: 'Reasignada',
  reallocatedBefore: (room: string, range: string) => `Antes: ${room}, ${range}`,
  reallocatedReason: (reason: string) => `Motivo: ${reason}`,
  reallocatedCancel:
    'Fue reasignada por un evento con cliente: puedes cancelarla aunque falte poco.',
  attendees: (count: number) => `${count} ${count === 1 ? 'persona' : 'personas'}`,
  cancelTitle: 'Cancelar reserva',
  cancelConfirm: 'Cancelar reserva',
  cancelOnlyThis: 'Cancelar solo esta',
  cancelSeries: 'Cancelar toda la serie',
  cancelSeriesHint: (total: number) =>
    `Esta reserva es parte de una serie de ${total}. Cancelar la serie cancela las reservas que faltan; las que empiezan en menos de 24 horas se conservan.`,
  cancelling: 'Cancelando…',
  keep: 'Conservar',
  close: 'Cerrar',
  seriesCancelled: 'Serie cancelada',
  seriesCancelledSummary: (cancelled: number, kept: number) =>
    kept > 0
      ? `Se cancelaron ${cancelled} reservas. ${kept} se conservan porque empiezan en menos de 24 horas.`
      : `Se cancelaron ${cancelled} reservas.`,
};

export const approvalsLabels = {
  title: 'Bandeja de entrenamientos',
  intro: 'Solicitudes de entrenamiento de las personas a tu cargo que esperan tu decisión.',
  loading: 'Cargando solicitudes…',
  retry: 'Reintentar',
  empty: 'No tienes solicitudes pendientes.',
  approve: 'Aprobar',
  reject: 'Rechazar',
  cancel: 'Cancelar',
  saving: 'Guardando…',
  requestedBy: (name: string) => `Solicita ${name}`,
  attendees: (count: number) => `${count} ${count === 1 ? 'persona' : 'personas'}`,
  seriesBadge: (index: number, total: number) => `Serie · ${index} de ${total}`,
  seriesSummary: (pending: number, total: number) => `Serie · ${pending} de ${total} por decidir`,
  approveAll: (count: number) => `Aprobar las ${count}`,
  rejectAll: (count: number) => `Rechazar las ${count}`,
  showDates: 'Ver fechas',
  hideDates: 'Ocultar fechas',
  approveTitle: 'Aprobar entrenamiento',
  rejectTitle: 'Rechazar entrenamiento',
  approveSingle: (name: string, who: string) => `Se confirmará la reserva de ${name} de ${who}.`,
  approveSeries: (count: number, who: string) =>
    `Se confirmarán ${count} reservas pendientes de ${who}.`,
  rejectSingle: (name: string, who: string) =>
    `Se rechazará la reserva de ${name} de ${who} y se liberará la franja. El motivo le llegará a la persona.`,
  rejectSeries: (count: number, who: string) =>
    `Se rechazarán ${count} reservas pendientes de ${who} y se liberarán sus franjas. El motivo le llegará a la persona.`,
  reason: 'Motivo del rechazo',
  reasonRequired: 'Escribe el motivo para poder rechazar.',
  seriesSkipped: (count: number) =>
    `${count} ${count === 1 ? 'fecha ya la había decidido' : 'fechas ya las había decidido'} otra persona.`,
  dismiss: 'Cerrar',
};

export const approvalOutcomeLabels = {
  waiting: 'Esperando la decisión del Líder.',
  expired: 'No se aprobó antes de su inicio, por eso se rechazó.',
  approvedBy: (name: string) => `Aprobada por ${name}.`,
  rejectedBy: (name: string) => `Rechazada por ${name}.`,
  reason: (comments: string) => `Motivo: ${comments}`,
};

export const weekdayFullLabels = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

export const operatingHoursLabels = {
  scope: 'Horario de',
  global: 'Todos los recursos (horario global)',
  source: {
    OWN: 'Este recurso tiene su propio horario.',
    PARENT: 'Usa el horario de su laboratorio. Si guardas, tendrá el suyo.',
    GLOBAL: 'Usa el horario global. Si guardas, tendrá el suyo.',
    ALWAYS_OPEN: 'Sin horario definido: se puede reservar todos los días a toda hora.',
  },
  loading: 'Cargando horario…',
  retry: 'Reintentar',
  closedDay: 'Cerrado',
  addWindow: 'Agregar horario',
  removeWindow: 'Quitar',
  opens: 'Apertura',
  closes: 'Cierre',
  invalid:
    'Revisa los horarios: el cierre debe ser posterior a la apertura y no pueden traslaparse.',
  save: 'Guardar horario',
  saving: 'Guardando…',
  saved: 'Horario guardado.',
  removeOwn: 'Quitar horario propio',
  removeGlobal: 'Quitar horario (24×7)',
  closedDatesTitle: 'Días cerrados',
  closedDate: 'Fecha',
  closedName: 'Motivo (por ejemplo, feriado)',
  closedScope: 'Aplica a',
  allResources: 'Todos los recursos',
  closeDay: 'Cerrar día',
  closedDateRequired: 'Indica la fecha y un motivo.',
  noClosedDates: 'No hay días cerrados próximos.',
  reopen: 'Reabrir',
};

export const dashboardLabels = {
  title: 'Panel de seguimiento',
  mobileTitle: 'Panel',
  intro: 'Solicitudes de las personas a tu cargo. Se actualiza solo cada 20 segundos.',
  introAll: 'Solicitudes de todas las personas. Se actualiza solo cada 20 segundos.',
  from: 'Desde',
  to: 'Hasta',
  status: 'Estado',
  purpose: 'Motivo',
  allStatuses: 'Todos',
  allPurposes: 'Todos',
  invalidRange: 'La fecha inicial no puede ser posterior a la final.',
  loading: 'Cargando panel…',
  retry: 'Reintentar',
  refresh: 'Actualizar',
  updatedAt: (time: string) => `Actualizado a las ${time}`,
  empty: 'No hay solicitudes con estos filtros.',
  metrics: {
    total: 'Solicitudes',
    noShowRate: 'Tasa de inasistencia',
  },
  requestedBy: (name: string) => `Solicita ${name}`,
  previous: 'Anterior',
  next: 'Siguiente',
  pageOf: (page: number, pages: number) => `Página ${page} de ${pages}`,
};

export const spocAgendaLabels = {
  title: 'Agenda de salas',
  mobileTitle: 'Agenda',
  intro:
    'Reservas de las salas de tus edificios. Cuando surja un evento con cliente, reasigna una reserva a otra sala u otro horario: el asociado recibe un aviso con tu justificación.',
  loading: 'Cargando la agenda…',
  retry: 'Reintentar',
  building: 'Edificio',
  day: 'Día',
  today: 'Hoy',
  previousDay: 'Día anterior',
  nextDay: 'Día siguiente',
  room: 'Sala',
  allRooms: 'Todas las salas',
  empty: 'No hay reservas este día.',
  noRooms: 'Este edificio no tiene salas activas.',
  gridLabel: 'Agenda del día por sala',
  roomCapacity: (capacity: number) => `${capacity} ${capacity === 1 ? 'persona' : 'personas'}`,
  attendees: (count: number) => `${count} ${count === 1 ? 'persona' : 'personas'}`,
  reallocated: 'Reasignada',
  series: 'Serie',
  reassign: 'Reasignar',
  reassignAria: (owner: string, range: string) => `Reasignar la reserva de ${owner}, ${range}`,
  notMovable: 'No se puede mover',
  moved: 'Reserva reasignada. El asociado ya recibió el aviso.',
  dismiss: 'Cerrar aviso',
};

export const reallocationLabels = {
  title: 'Reasignar reserva',
  description: (owner: string) =>
    `Mueve la reserva de ${owner} a otra sala u otro horario. Recibirá un aviso con tu justificación.`,
  current: 'Reserva actual',
  newRoom: 'Sala nueva',
  roomOption: (name: string, capacity: number) => `${name} · hasta ${capacity}`,
  startDate: 'Fecha de inicio',
  startTime: 'Hora de inicio',
  endDate: 'Fecha de fin',
  endTime: 'Hora de fin',
  justification: 'Justificación',
  justificationHint: 'La verá el asociado en su aviso.',
  counter: (count: number, max: number) => `${count}/${max}`,
  before: 'Antes',
  after: 'Después',
  pendingNote: 'Está pendiente de aprobación: seguirá pendiente y el Líder recibirá un aviso.',
  seriesNote: 'Forma parte de una serie: solo se mueve esta fecha.',
  noAdvanceNote: 'No aplica el mínimo de 24 horas de anticipación.',
  submit: 'Reasignar',
  saving: 'Reasignando…',
  cancel: 'Cancelar',
  problems: {
    JUSTIFICATION_REQUIRED: 'Escribe la justificación del cambio.',
    JUSTIFICATION_TOO_LONG: 'La justificación no puede superar los 1000 caracteres.',
    END_NOT_AFTER_START: 'La hora de fin debe ser posterior a la de inicio.',
    ATTENDEES_EXCEED_CAPACITY: 'La sala elegida no tiene capacidad para los asistentes.',
    NOTHING_TO_CHANGE: 'Cambia la sala o el horario para continuar.',
  } satisfies Record<ReallocationProblem, string>,
};
