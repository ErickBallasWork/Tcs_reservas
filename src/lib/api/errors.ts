export class ApiError extends Error {
  status: number; // 0 = network error or timeout
  details: string[];

  constructor(status: number, message: string, details: string[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }

  get isNetworkError() {
    return this.status === 0;
  }
  get isUnauthorized() {
    return this.status === 401;
  }
  get isConflict() {
    return this.status === 409;
  }
}

// Spanish message ready to show in a modal or toast
export function getUserMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "Ocurrió un error inesperado. Inténtalo de nuevo.";
  }
  switch (true) {
    case error.status === 0:
      return error.message; // already worded in the client
    case error.status === 401:
      return "Tu sesión expiró. Inicia sesión de nuevo.";
    case error.status === 403:
      return "No tienes permiso para realizar esta acción.";
    case error.status === 404:
      return "No se encontró lo que buscas.";
    case error.status === 409:
      return error.details[0] ?? "La acción entra en conflicto con otra reserva.";
    case error.status === 400 || error.status === 422:
      return error.details[0] ?? "Hay datos inválidos en la solicitud.";
    case error.status >= 500:
      return "El servidor tuvo un problema. Inténtalo en unos minutos.";
    default:
      return error.details[0] ?? "No se pudo completar la acción.";
  }
}