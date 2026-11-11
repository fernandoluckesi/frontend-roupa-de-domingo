/* Reaplica as mudancas do cadastro sobre a versao versionada, evitando o
   reformat automatico do editor. Uso unico. */
const fs = require("node:fs");
const { execSync } = require("node:child_process");

const file = "src/pages/Register.tsx";
let src = execSync(`git show HEAD:${file}`, { encoding: "utf8", cwd: __dirname });

const edits = [
  // Import do checklist
  [
    `  Label,\n  PasswordInput,\n  Section,`,
    `  Label,\n  PasswordChecklist,\n  PasswordInput,\n  Section,`,
  ],
  // PASSWORD_HINT nao e mais usado nesta tela
  [
    `import { PASSWORD_HINT, passwordProblem } from "../utils/password";`,
    `import { passwordProblem } from "../utils/password";`,
  ],
  // Scroll + foco no primeiro campo com erro
  [
    `  const validate = () => {\n    const next: Partial<Record<FieldKey, string>> = {};`,
    `  /** Leva o campo com erro para a tela e devolve o foco a ele. */\n  const focusField = (key: FieldKey) => {\n    const element = document.getElementById(\`reg-\${key}\`);\n    if (!element) return;\n    element.scrollIntoView({ behavior: "smooth", block: "center" });\n    // Sem preventScroll o browser daria um segundo salto, cancelando o smooth.\n    element.focus({ preventScroll: true });\n  };\n\n  const validate = () => {\n    const next: Partial<Record<FieldKey, string>> = {};`,
  ],
  [
    `    setErrors(next);\n    return Object.keys(next).length === 0;\n  };`,
    `    setErrors(next);\n\n    // Vai para o primeiro erro na ordem do formulario, nao na ordem do objeto.\n    const firstError = (["name", "email", "password"] as const).find(\n      (key) => next[key],\n    );\n    if (firstError) focusField(firstError);\n\n    return Object.keys(next).length === 0;\n  };`,
  ],
  // E-mail duplicado vai para o campo, nao para o aviso geral
  [
    `    } catch (err) {\n      if (extractErrorCode(err) === "EMAIL_NOT_VERIFIED") {\n        // Cadastro antigo nao confirmado: o login com a senha reenvia o codigo\n        setError(extractError(err));\n        return;\n      }\n      setError(extractError(err, "Não foi possível criar a conta."));`,
    `    } catch (err) {\n      const code = extractErrorCode(err);\n\n      if (code === "EMAIL_NOT_VERIFIED") {\n        // Cadastro antigo nao confirmado: o login com a senha reenvia o codigo\n        setError(extractError(err));\n        return;\n      }\n\n      const message = extractError(err, "Não foi possível criar a conta.");\n\n      // E-mail duplicado: o problema e de um campo especifico, entao a mensagem\n      // vai abaixo do input em vez do aviso geral no topo do formulario.\n      if (code === "EMAIL_TAKEN") {\n        setErrors((current) => ({ ...current, email: message }));\n        focusField("email");\n        return;\n      }\n\n      setError(message);`,
  ],
  // Checklist no lugar da dica estatica
  [
    `                aria-describedby={\n                  errors.password\n                    ? "reg-password-error reg-password-hint"\n                    : "reg-password-hint"\n                }\n                onChange={(e) => update("password", e.target.value)}\n                required\n              />\n              <p className="hint" id="reg-password-hint">\n                {PASSWORD_HINT}\n              </p>`,
    `                aria-describedby={\n                  errors.password\n                    ? "reg-password-error reg-password-rules"\n                    : "reg-password-rules"\n                }\n                onChange={(e) => update("password", e.target.value)}\n                required\n              />\n              <PasswordChecklist\n                id="reg-password-rules"\n                password={form.password}\n              />`,
  ],
];

for (const [from, to] of edits) {
  if (!src.includes(from)) throw new Error(`nao encontrado: ${from.slice(0, 70)}`);
  src = src.replace(from, to);
}

fs.writeFileSync(`${__dirname}/${file}`, src);
console.log("Register.tsx atualizado sem reformatacao");
