/**
 * Configurações de Autorização Pastoral e Administrativa
 * Garante que apenas o e-mail oficial do Pastor Everton Figur tenha privilégios de Admin.
 */

export const PASTOR_PRIMARY_EMAIL = 'evertonfigur75@gmail.com';

export const AUTHORIZED_ADMIN_EMAILS: readonly string[] = [
  PASTOR_PRIMARY_EMAIL,
];

/**
 * Verifica se um endereço de e-mail pertence à lista de administradores pastorais autorizados.
 * A verificação é insensível a maiúsculas/minúsculas e ignora espaços extras.
 */
export function isAuthorizedAdminEmail(email?: string | null): boolean {
  if (!email || typeof email !== 'string') return false;
  const cleanEmail = email.trim().toLowerCase();
  return AUTHORIZED_ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase() === cleanEmail);
}

/**
 * Valida se um usuário autenticado possui o papel de administrador e o e-mail autorizado.
 */
export function isPastorUser(user?: { email?: string; role?: string } | null): boolean {
  if (!user) return false;
  return user.role === 'admin' && isAuthorizedAdminEmail(user.email);
}

/**
 * Validação explícita de acesso ao painel de administração.
 */
export function validateAdminAccess(email?: string | null): { allowed: boolean; reason?: string } {
  if (!email) {
    return {
      allowed: false,
      reason: 'E-mail não informado.',
    };
  }

  if (!isAuthorizedAdminEmail(email)) {
    return {
      allowed: false,
      reason: `Acesso negado: O e-mail "${email}" não possui permissão pastoral/administrativa. Apenas ${PASTOR_PRIMARY_EMAIL} é autorizado.`,
    };
  }

  return { allowed: true };
}
