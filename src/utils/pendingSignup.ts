/**
 * E-mail do cadastro que ainda falta confirmar com o código. Fica no
 * sessionStorage (essencial: sem ele a confirmação não funciona depois de
 * recarregar a página) e nunca vai para a URL.
 */
const KEY = "rd:pendingSignupEmail";

export function setPendingSignupEmail(email: string) {
  try {
    sessionStorage.setItem(KEY, email);
  } catch {
    // sem sessionStorage: a tela de confirmação recebe o e-mail pelo state da navegação
  }
}

export function getPendingSignupEmail(): string {
  try {
    return sessionStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

export function clearPendingSignupEmail() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // nada a limpar
  }
}
