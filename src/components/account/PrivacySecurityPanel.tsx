import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Button, Card, Checkbox, CodeInput, ErrorText, Field, Input, Label, Modal, Textarea } from "../ui";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { authService } from "../../services/auth.service";
import { api, extractError } from "../../services/http";
import { PASSWORD_HINT, passwordProblem } from "../../utils/password";
import { setPendingSignupEmail } from "../../utils/pendingSignup";

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing(6)};
  margin-top: ${({ theme }) => theme.spacing(8)};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }

  h2 {
    font-size: 1.1rem;
    margin-bottom: ${({ theme }) => theme.spacing(4)};
  }

  h3 {
    font-size: 0.95rem;
    margin: ${({ theme }) => theme.spacing(5)} 0 ${({ theme }) => theme.spacing(2)};
  }

  p {
    font-size: 0.86rem;
    line-height: 1.55;
    color: ${({ theme }) => theme.colors.textSoft};
    margin-bottom: ${({ theme }) => theme.spacing(3)};
  }

  a {
    color: ${({ theme }) => theme.colors.accent};
    text-decoration: underline;
  }

  code {
    font-size: 0.85rem;
    word-break: break-all;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing(2)};
  }
`;

const Banner = styled.div`
  margin-top: ${({ theme }) => theme.spacing(6)};
  padding: ${({ theme }) => theme.spacing(4)};
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.radius.md};
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};
  font-size: 0.9rem;
`;

/**
 * Direitos do titular (LGPD art. 18) e segurança da conta:
 * exportar dados, revogar marketing, excluir conta, trocar senha,
 * sair de todos os dispositivos e verificação em duas etapas.
 */
export function PrivacySecurityPanel() {
  const { user, setUser, logoutEverywhere, refresh } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();

  const [passwords, setPasswords] = useState({ current: "", next: "" });
  const [passwordError, setPasswordError] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  /** E-mail mascarado para onde foi o código; null = ainda no passo das senhas */
  const [passwordCodeSentTo, setPasswordCodeSentTo] = useState<string | null>(null);
  const [passwordCode, setPasswordCode] = useState("");
  const [emailForm, setEmailForm] = useState({ newEmail: "", password: "" });
  const [emailError, setEmailError] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  /** E-mail novo (mascarado) que recebeu o código; null = ainda no passo do formulário */
  const [emailCodeSentTo, setEmailCodeSentTo] = useState<string | null>(null);
  const [emailCode, setEmailCode] = useState("");
  const [exporting, setExporting] = useState(false);
  const [marketing, setMarketing] = useState(Boolean(user?.marketingOptIn));
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteForm, setDeleteForm] = useState({ password: "", reason: "", confirm: false });
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [twoFactor, setTwoFactor] = useState<{ secret: string; otpauthUrl: string } | null>(null);
  const [otp, setOtp] = useState("");

  if (!user) return null;

  /** Passo 1: confere a senha atual e manda o código para o e-mail. */
  const requestPasswordCode = async (event?: FormEvent) => {
    event?.preventDefault();
    const problem = passwordProblem(passwords.next);
    if (problem) return setPasswordError(problem);
    setPasswordError("");
    setSavingPassword(true);
    try {
      setPasswordCodeSentTo(await authService.requestPasswordChangeCode(passwords.current));
      setPasswordCode("");
    } catch (err) {
      setPasswordError(extractError(err, "Não foi possível enviar o código."));
    } finally {
      setSavingPassword(false);
    }
  };

  /** Passo 2: troca a senha com o código recebido. */
  const changePassword = async (code = passwordCode) => {
    if (code.length !== 6) return setPasswordError("Digite os 6 dígitos do código.");
    setPasswordError("");
    setSavingPassword(true);
    try {
      setUser(await authService.changePassword(passwords.current, passwords.next, code));
      setPasswords({ current: "", next: "" });
      setPasswordCodeSentTo(null);
      setPasswordCode("");
      push({ variant: "success", title: "Senha alterada", message: "As outras sessões foram encerradas." });
    } catch (err) {
      setPasswordError(extractError(err, "Não foi possível trocar a senha."));
      setPasswordCode("");
    } finally {
      setSavingPassword(false);
    }
  };

  const cancelPasswordChange = () => {
    setPasswordCodeSentTo(null);
    setPasswordCode("");
    setPasswordError("");
  };

  /** Troca de e-mail, passo 1: senha atual + e-mail novo; o código vai para o e-mail novo. */
  const requestEmailCode = async (event?: FormEvent) => {
    event?.preventDefault();
    const newEmail = emailForm.newEmail.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(newEmail)) return setEmailError("Informe um e-mail válido.");
    if (newEmail === user.email) return setEmailError("Esse já é o e-mail da sua conta.");
    if (!emailForm.password) return setEmailError("Digite a sua senha atual.");
    setEmailError("");
    setSavingEmail(true);
    try {
      setEmailCodeSentTo(await authService.requestEmailChangeCode(newEmail, emailForm.password));
      setEmailCode("");
    } catch (err) {
      setEmailError(extractError(err, "Não foi possível enviar o código."));
    } finally {
      setSavingEmail(false);
    }
  };

  /** Passo 2: confirma com o código recebido no e-mail novo. */
  const changeEmail = async (code = emailCode) => {
    if (code.length !== 6) return setEmailError("Digite os 6 dígitos do código.");
    setEmailError("");
    setSavingEmail(true);
    try {
      setUser(await authService.changeEmail(code));
      setEmailForm({ newEmail: "", password: "" });
      setEmailCodeSentTo(null);
      setEmailCode("");
      push({ variant: "success", title: "E-mail alterado", message: "Use o e-mail novo no próximo login. As outras sessões foram encerradas." });
    } catch (err) {
      setEmailError(extractError(err, "Não foi possível trocar o e-mail."));
      setEmailCode("");
    } finally {
      setSavingEmail(false);
    }
  };

  const cancelEmailChange = () => {
    setEmailCodeSentTo(null);
    setEmailCode("");
    setEmailError("");
  };

  const exportData = async () => {
    setExporting(true);
    try {
      const blob = await authService.exportData();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `meus-dados-roupa-de-domingo-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      push({ variant: "error", title: "Exportação falhou", message: extractError(err) });
    } finally {
      setExporting(false);
    }
  };

  const toggleMarketing = async (value: boolean) => {
    setMarketing(value);
    try {
      await authService.setMarketingConsent(value);
      push({
        variant: "success",
        title: value ? "Consentimento registrado" : "Consentimento revogado",
        message: value ? "Você vai receber novidades por e-mail." : "Não enviaremos mais e-mails de marketing.",
      });
    } catch (err) {
      setMarketing(!value);
      push({ variant: "error", title: "Não foi possível salvar", message: extractError(err) });
    }
  };

  const resendVerification = async () => {
    try {
      await authService.resendVerification();
      setPendingSignupEmail(user.email);
      push({ variant: "success", title: "Código enviado", message: "Confira a sua caixa de entrada." });
      navigate("/confirmar-cadastro", { state: { email: user.email } });
    } catch (err) {
      push({ variant: "error", title: "Não foi possível enviar", message: extractError(err) });
    }
  };

  const signOutEverywhere = async () => {
    await logoutEverywhere();
    push({ variant: "success", title: "Sessões encerradas", message: "Você saiu de todos os dispositivos." });
    navigate("/entrar");
  };

  const startTwoFactor = async () => {
    try {
      const { data } = await api.post<{ secret: string; otpauthUrl: string }>("/auth/2fa/setup");
      setTwoFactor(data);
    } catch (err) {
      push({ variant: "error", title: "2FA", message: extractError(err) });
    }
  };

  const confirmTwoFactor = async (enable: boolean) => {
    try {
      await api.post(enable ? "/auth/2fa/enable" : "/auth/2fa/disable", { otp });
      setTwoFactor(null);
      setOtp("");
      if (!enable) {
        push({ variant: "success", title: "2FA desativado", message: "Entre de novo para continuar." });
        navigate("/entrar");
        return;
      }
      await refresh();
      push({ variant: "success", title: "2FA ativo", message: "O próximo login vai pedir o código do aplicativo." });
    } catch (err) {
      push({ variant: "error", title: "Código inválido", message: extractError(err) });
    }
  };

  const deleteAccount = async (event: FormEvent) => {
    event.preventDefault();
    if (!deleteForm.confirm) return setDeleteError("Marque a confirmação para continuar.");
    if (!deleteForm.password) return setDeleteError("Digite a sua senha.");
    setDeleteError("");
    setDeleting(true);
    try {
      await authService.deleteAccount(deleteForm.password, deleteForm.reason.trim() || undefined);
      setUser(null);
      setDeleteOpen(false);
      push({ variant: "success", title: "Conta excluída", message: "Seus dados pessoais foram anonimizados." });
      navigate("/");
    } catch (err) {
      setDeleteError(extractError(err, "Não foi possível excluir a conta."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {!user.emailVerifiedAt && (
        <Banner role="status">
          <span>Confirme o seu e-mail para receber as atualizações dos pedidos.</span>
          <Button $size="sm" $variant="secondary" type="button" onClick={() => void resendVerification()}>
            Confirmar e-mail
          </Button>
        </Banner>
      )}

      <Grid>
        <Card>
          <h2>Privacidade e dados</h2>
          <p>
            Você decide o que fazemos com os seus dados. Detalhes na{" "}
            <Link to="/privacidade">política de privacidade</Link>.
          </p>

          <h3>Comunicações</h3>
          <Checkbox id="acc-marketing" checked={marketing} onChange={(v) => void toggleMarketing(v)}>
            Quero receber novidades e ofertas por e-mail
          </Checkbox>

          <h3>Seus dados</h3>
          <p>
            Baixe uma cópia de tudo o que guardamos sobre você (conta, endereços, pedidos, consentimentos) e com quem
            compartilhamos, em JSON.
          </p>
          <div className="actions">
            <Button $variant="secondary" $size="sm" type="button" disabled={exporting} onClick={() => void exportData()}>
              {exporting ? "Gerando..." : "Exportar meus dados"}
            </Button>
            <Button as={Link} to="/contato?assunto=privacidade" $variant="ghost" $size="sm" style={{ textDecoration: "none" }}>
              Falar com o encarregado
            </Button>
          </div>

          <h3>Excluir conta</h3>
          <p>
            Apaga endereços, carrinho e troféus e anonimiza a conta. Pedidos ficam guardados sem o seu nome pelo prazo
            fiscal de 5 anos.
          </p>
          <Button $variant="danger" $size="sm" type="button" onClick={() => setDeleteOpen(true)}>
            Excluir minha conta
          </Button>
        </Card>

        <Card>
          <h2>Segurança</h2>

          <h3>Trocar e-mail</h3>
          {emailCodeSentTo ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void changeEmail();
              }}
              noValidate
            >
              <p>
                Enviamos um código de 6 dígitos para <strong>{emailCodeSentTo}</strong>. Digite abaixo para confirmar o
                e-mail novo.
              </p>
              <CodeInput
                value={emailCode}
                onChange={setEmailCode}
                onComplete={(code) => void changeEmail(code)}
                invalid={Boolean(emailError)}
                disabled={savingEmail}
                describedBy={emailError ? "acc-email-error" : undefined}
                label="Código enviado para o e-mail novo"
                autoFocus
              />
              {emailError && (
                <ErrorText id="acc-email-error" role="alert">
                  {emailError}
                </ErrorText>
              )}
              <div className="actions">
                <Button $size="sm" type="submit" disabled={savingEmail || emailCode.length !== 6}>
                  {savingEmail ? "Salvando..." : "Confirmar e-mail novo"}
                </Button>
                <Button $variant="ghost" $size="sm" type="button" disabled={savingEmail} onClick={() => void requestEmailCode()}>
                  Reenviar código
                </Button>
                <Button $variant="ghost" $size="sm" type="button" disabled={savingEmail} onClick={cancelEmailChange}>
                  Cancelar
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={requestEmailCode} noValidate>
              <p>
                E-mail atual: <strong>{user.email}</strong>. O código de confirmação vai para o e-mail novo.
              </p>
              <Field>
                <Label htmlFor="acc-new-email">E-mail novo</Label>
                <Input
                  id="acc-new-email"
                  type="email"
                  autoComplete="email"
                  value={emailForm.newEmail}
                  aria-invalid={Boolean(emailError) || undefined}
                  aria-describedby={emailError ? "acc-email-error" : undefined}
                  onChange={(e) => setEmailForm((f) => ({ ...f, newEmail: e.target.value }))}
                />
              </Field>
              <Field>
                <Label htmlFor="acc-email-password">Senha atual</Label>
                <Input
                  id="acc-email-password"
                  type="password"
                  autoComplete="current-password"
                  value={emailForm.password}
                  onChange={(e) => setEmailForm((f) => ({ ...f, password: e.target.value }))}
                />
              </Field>
              {emailError && (
                <ErrorText id="acc-email-error" role="alert">
                  {emailError}
                </ErrorText>
              )}
              <Button $size="sm" type="submit" disabled={savingEmail || !emailForm.newEmail || !emailForm.password}>
                {savingEmail ? "Enviando código..." : "Trocar e-mail"}
              </Button>
            </form>
          )}

          <h3>Trocar senha</h3>
          {passwordCodeSentTo ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void changePassword();
              }}
              noValidate
            >
              <p>
                Enviamos um código de 6 dígitos para <strong>{passwordCodeSentTo}</strong>. Digite abaixo para confirmar a
                troca da senha.
              </p>
              <CodeInput
                value={passwordCode}
                onChange={setPasswordCode}
                onComplete={(code) => void changePassword(code)}
                invalid={Boolean(passwordError)}
                disabled={savingPassword}
                describedBy={passwordError ? "acc-password-error" : undefined}
                autoFocus
              />
              {passwordError && (
                <ErrorText id="acc-password-error" role="alert">
                  {passwordError}
                </ErrorText>
              )}
              <div className="actions">
                <Button $size="sm" type="submit" disabled={savingPassword || passwordCode.length !== 6}>
                  {savingPassword ? "Salvando..." : "Confirmar troca"}
                </Button>
                <Button $variant="ghost" $size="sm" type="button" disabled={savingPassword} onClick={() => void requestPasswordCode()}>
                  Reenviar código
                </Button>
                <Button $variant="ghost" $size="sm" type="button" disabled={savingPassword} onClick={cancelPasswordChange}>
                  Cancelar
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={requestPasswordCode} noValidate>
              <Field>
                <Label htmlFor="acc-current-password">Senha atual</Label>
                <Input
                  id="acc-current-password"
                  type="password"
                  autoComplete="current-password"
                  value={passwords.current}
                  onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
                />
              </Field>
              <Field>
                <Label htmlFor="acc-new-password">Senha nova</Label>
                <Input
                  id="acc-new-password"
                  type="password"
                  autoComplete="new-password"
                  value={passwords.next}
                  aria-describedby={passwordError ? "acc-password-error acc-password-hint" : "acc-password-hint"}
                  aria-invalid={Boolean(passwordError) || undefined}
                  onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))}
                />
                <p id="acc-password-hint" style={{ fontSize: "0.78rem", marginTop: 4 }}>
                  {PASSWORD_HINT}
                </p>
              </Field>
              {passwordError && (
                <ErrorText id="acc-password-error" role="alert">
                  {passwordError}
                </ErrorText>
              )}
              <Button $size="sm" type="submit" disabled={savingPassword || !passwords.current || !passwords.next}>
                {savingPassword ? "Enviando código..." : "Trocar senha"}
              </Button>
            </form>
          )}

          <h3>Sessões</h3>
          <p>Perdeu o celular ou entrou num computador emprestado? Encerre todas as sessões abertas.</p>
          <Button $variant="secondary" $size="sm" type="button" onClick={() => void signOutEverywhere()}>
            Sair de todos os dispositivos
          </Button>

          <h3>Verificação em duas etapas</h3>
          {user.twoFactorEnabled ? (
            <>
              <p>Ativa. Para desativar, digite um código do aplicativo.</p>
              <div className="actions">
                <Input
                  aria-label="Código de 6 dígitos"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  style={{ maxWidth: 140 }}
                />
                <Button $variant="secondary" $size="sm" type="button" onClick={() => void confirmTwoFactor(false)}>
                  Desativar
                </Button>
              </div>
            </>
          ) : twoFactor ? (
            <>
              <p>
                No aplicativo autenticador (Google Authenticator, 1Password, Authy...), adicione uma conta com esta chave:
              </p>
              <p>
                <code>{twoFactor.secret}</code>
              </p>
              <p>
                Ou abra no celular: <a href={twoFactor.otpauthUrl}>adicionar ao autenticador</a>. Depois digite o código
                gerado:
              </p>
              <div className="actions">
                <Input
                  aria-label="Código de 6 dígitos"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  style={{ maxWidth: 140 }}
                />
                <Button $size="sm" type="button" onClick={() => void confirmTwoFactor(true)}>
                  Ativar
                </Button>
              </div>
            </>
          ) : (
            <>
              <p>
                Um código do celular, além da senha, a cada login.
                {user.role === "ADMIN" && " Obrigatório para acessar a área administrativa."}
              </p>
              <Button $variant="secondary" $size="sm" type="button" onClick={() => void startTwoFactor()}>
                Configurar 2FA
              </Button>
            </>
          )}
        </Card>
      </Grid>

      <Modal open={deleteOpen} title="Excluir conta" onClose={() => setDeleteOpen(false)}>
        <form onSubmit={deleteAccount} noValidate>
          <p style={{ fontSize: "0.9rem", marginBottom: 16 }}>
            Isso não tem volta. Se houver pedido em andamento, a exclusão fica disponível depois da entrega.
          </p>
          <Field>
            <Label htmlFor="del-password">Senha</Label>
            <Input
              id="del-password"
              type="password"
              autoComplete="current-password"
              value={deleteForm.password}
              onChange={(e) => setDeleteForm((f) => ({ ...f, password: e.target.value }))}
            />
          </Field>
          <Field>
            <Label htmlFor="del-reason">Motivo (opcional)</Label>
            <Textarea
              id="del-reason"
              rows={3}
              maxLength={500}
              value={deleteForm.reason}
              onChange={(e) => setDeleteForm((f) => ({ ...f, reason: e.target.value }))}
            />
          </Field>
          <Checkbox
            id="del-confirm"
            checked={deleteForm.confirm}
            onChange={(v) => setDeleteForm((f) => ({ ...f, confirm: v }))}
          >
            Entendo que a conta será excluída e os meus dados pessoais anonimizados.
          </Checkbox>
          {deleteError && (
            <ErrorText role="alert" style={{ marginTop: 12 }}>
              {deleteError}
            </ErrorText>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
            <Button $variant="danger" type="submit" disabled={deleting}>
              {deleting ? "Excluindo..." : "Excluir definitivamente"}
            </Button>
            <Button $variant="ghost" type="button" onClick={() => setDeleteOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
