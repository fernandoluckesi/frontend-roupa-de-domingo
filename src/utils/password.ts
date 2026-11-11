/** Mesma política do backend (auth.dto.ts): 8+ caracteres, letra e número, fora das senhas comuns. */
const COMMON = new Set([
  "12345678",
  "123456789",
  "1234567890",
  "senha123",
  "senha1234",
  "password",
  "password1",
  "password123",
  "qwerty123",
  "abc12345",
  "abcd1234",
  "11111111",
  "00000000",
  "iloveyou1",
  "brasil123",
  "mudar123",
  "admin123",
  "domingo123",
]);

export const PASSWORD_HINT = "Mínimo de 8 caracteres, com letras e números.";

export interface PasswordRule {
  label: string;
  ok: boolean;
}

/**
 * Estado de cada regra da politica, para o checklist abaixo do campo.
 * Mesmas verificacoes de `passwordProblem`, so que individualizadas: aqui a
 * pessoa ve o que ja cumpriu em vez de descobrir um problema por vez.
 */
export function passwordRules(password: string): PasswordRule[] {
  return [
    {
      label: "Ao menos 8 caracteres",
      ok: password.length >= 8 && password.length <= 72,
    },
    { label: "Uma letra", ok: /[A-Za-zÀ-ÿ]/.test(password) },
    { label: "Um número", ok: /\d/.test(password) },
    {
      // Vazio nao e "comum demais": a regra so acusa quando ha algo digitado.
      label: "Não ser uma senha óbvia",
      ok: password.length > 0 && !COMMON.has(password.toLowerCase()),
    },
  ];
}

/** Devolve a mensagem de erro, ou "" se a senha atende à política. */
export function passwordProblem(password: string): string {
  if (password.length < 8) return "A senha precisa de ao menos 8 caracteres.";
  if (password.length > 72) return "A senha pode ter no máximo 72 caracteres.";
  if (!/[A-Za-zÀ-ÿ]/.test(password) || !/\d/.test(password))
    return "Use letras e números na senha.";
  if (COMMON.has(password.toLowerCase()))
    return "Essa senha é comum demais. Escolha outra.";
  return "";
}
