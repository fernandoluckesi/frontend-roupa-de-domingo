# QR Codes

## segredo.svg · segredo-1024.png

Aponta para **`/segredo`**, a página que mostra "Você desbloqueou um segredo"
e manda o visitante para o catálogo.

| Arquivo            | Uso                                              |
| ------------------ | ------------------------------------------------ |
| `segredo.svg`      | Impressão em qualquer tamanho (vetor, sem perda) |
| `segredo-1024.png` | Bitmap para etiqueta, post, marketplace          |

URL codificada:

```
https://roupadedomingo.com.br/segredo
```

Gerado com correção de erro nível **H** (recupera ~30% do código), que tolera
etiqueta amassada, dobra e falha de tinta.

## Regerar

Necessário sempre que o domínio mudar — o QR tem a URL embutida, não é um
redirecionador.

```bash
cd frontend-roupa-de-domingo
npm install qrcode --no-save
node scripts/gen-qrcode.cjs                      # usa a URL de produção
node scripts/gen-qrcode.cjs http://localhost:5273 # para testar local
```

A dependência `qrcode` entra com `--no-save` de propósito: o app não gera QR em
tempo de execução, então não precisa dela no `package.json`.

## Ao imprimir

- Tamanho mínimo de 2 cm × 2 cm para leitura confiável a ~15 cm de distância.
- Preserve a margem branca em volta (quiet zone). Sem ela, muitos leitores falham.
- Não recorte, não aplique sobre foto e não inverta as cores.
- A rota tem `noindex`: a piada só funciona se chegarem pelo QR, não pela busca.
- A tela não dispara notificação de troféu: o aviso competia com a piada.
- Nenhum modal aparece em `/segredo` (banner de cookies e pegadinha do desconto
  ficam suprimidos). A rota está em `src/config/quietRoutes.ts`; adicione novas
  rotas lá se precisar do mesmo comportamento.
- Teste com a câmera do celular depois de imprimir o primeiro lote.

## camiseta-costas.svg · camiseta-costas-1024.png

QR das **costas da camiseta**. Aponta para `/segredo?q=costas`: a mesma página,
mas o `?q=costas` faz a área "Análise" do backoffice (Aquisição) separar os
escaneamentos e as vendas que vieram das costas da camiseta.

A arte para impressão (3000 px, 10" a 300 DPI) fica em
`docs-roupa-de-domingo/catalog/print-arts/qrcode/camiseta-costas-3000px.png`.

Para outro local impresso (etiqueta, embalagem, adesivo), adicione uma linha em
`VARIANTS` no `scripts/gen-qrcode.cjs` com outro `?q=` e rode o script de novo.
Veja `docs-roupa-de-domingo/ANALISE-DE-ACESSOS.md`.
