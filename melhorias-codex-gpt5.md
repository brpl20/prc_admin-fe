Aqui está minha revisão inicial com achados e recomendações priorizadas. Se quis
er, aplico as mudanças prioritárias por você.

Principais riscos e bugs
- Middleware redirect: uso incorreto de `NextResponse.redirect('/')`. Correto: `
NextResponse.redirect(new URL('/', req.url))`. Também avalie `matcher` para abra
nger subrotas (ex.: `/clientes/:path*`).
- Efeito no render em `_app.tsx`: limpeza de `localStorage` roda dentro do corpo
 do componente, não em `useEffect`, e acessa `router.query.type` sem tratar arra
y/undefined. Isso pode causar efeitos colaterais em cada render (e em Strict Mod
e roda duas vezes).
- Título no `_document.tsx`: `title` dentro de `Document` é anti-padrão; o títul
o deve ficar em páginas (ou via `next/head`). Hoje há título em `_app` e `_docum
ent` (duplicado).
- Versões incompatíveis: `next@^15.3.1` com `react@18.2.0`. Next 15 espera React
 19. Decida entre: (a) subir para React 19 + TS recente, ou (b) voltar Next para
 14.x LTS.
- ESLint config: usa Flat Config mas importa `@typescript-eslint/parser` sem ter
 essa dependência; o repo tem `typescript-eslint` (meta-pacote) e não `@typescri
pt-eslint/parser/@typescript-eslint/eslint-plugin`. Resultado: lint pode falhar.
- Lockfile ignorado: `.gitignore` ignora `package-lock.json`, `yarn.lock`, `pnpm
-lock.yaml`. Não commitar lockfile piora reprodutibilidade e segurança de builds
.
- `next-env.d.ts` ignorado: está no `.gitignore`, mas deve ser comitado (Next re
comenda).
- Uso pesado de `any`: contexts, hooks e componentes usam `any` extensivamente,
reduzindo segurança de tipos e DX (ex.: `src/components/Details/**`, `Registrati
ons/**`, contexts).
- Mistura de libs de estilo: MUI (Emotion), styled-components e Tailwind juntos
aumentam bundle e complexidade. CustomTooltip estiliza componente MUI com styled
-components; funciona, mas é frágil. Considere padronizar um motor.
- Segurança do GA script: script inline com `dangerouslySetInnerHTML`; em produç
ão, prefira `next/script` com `strategy="afterInteractive"` e variáveis de ambie
nte.

Melhorias de arquitetura e DX
- Router e proteção: middleware protege apenas rotas raiz; adicione `:path*` par
a aninhar. Centralize regras por role no client (Layout) e no server (middleware
) para não divergir.
- Estado e tipagem: substitua `any` por interfaces em contexts (User/Customer/Wo
rk). Exponha ações com tipos precisos, e inicialize estados com objetos tipados.
- API layer: os interceptors chamam `getSession()` (assíncrono) a cada request;
você mitigou com cache de 5s—bom. Alternativa: propagar o token a partir de um `
SessionProvider` custom e usar `api` já com Authorization inserido, ou usar `ser
verApi` no SSR com cookies.
- TSConfig: `target: es5` é obsoleto; use `ES2020+`. Considere `"moduleResolutio
n": "Bundler"` com TS >= 5.3 e Next 14/15. Remova `allowJs` se não for necessári
o.
- Theming: há `ThemeProvider` do MUI e cores duplicadas em styled-components. Se
 padronizar em MUI/Emotion, migre tokens de `colors` para theme e use `sx`/`styl
ed` MUI. Se padronizar em styled-components, troque o engine do MUI para `@mui/s
tyled-engine-sc` com alias.
- Analytics: migre GA para `next/script` com `id`/`strategy` e mova a config par
a variável de ambiente (e.g., `NEXT_PUBLIC_GA_ID`).
- Navegação: há usos de `window.location.href` em componentes; use `next/router`
 para evitar full reload.
- Acessibilidade: revise componentes com ícones/labels para adicionar `aria-labe
l`, `role` e `alt` consistentes.
- Tailwind: content paths ok. Considere extrair classes repetidas para component
es estilizados ou `@apply` em utilitários locais, e revisar que Tailwind não bri
ga com MUI baseline.

Ações recomendadas (prioridade alta)
- Corrigir middleware e abrangência:
  - `return NextResponse.redirect(new URL('/', req.url));`
  - `matcher: ['/home/:path*', '/clientes/:path*', '/trabalhos/:path*', '/docume
ntos/:path*', '/escritorios/:path*', '/tarefas/:path*']`
- Mover efeito de limpeza no `_app.tsx` para `useEffect`:
  - Verificar `router.isReady` e normalizar `type` (string | string[] | undefine
d).
- Remover `title` de `_document.tsx` e migrar GA para `next/script` com `afterIn
teractive`.
- Ajustar versões:
  - Opção A: atualizar para `react@19`, `react-dom@19`, `typescript@^5.6`, mante
r `next@15.x`.
  - Opção B: baixar para `next@14.2.x` mantendo React 18 e subir TS para `^5.4`.
- ESLint:
  - Ou instalar `@typescript-eslint/parser` e `@typescript-eslint/eslint-plugin`
 e referenciá-los, ou reescrever flat config para usar o meta `typescript-eslint
` adequadamente.
- Git:
  - Remover lockfiles do `.gitignore` e comitar um lock. Remover `next-env.d.ts`
 do `.gitignore`.

Ações recomendadas (média)
- Padronizar estilo: escolher entre Emotion (nativo MUI) + Tailwind, ou styled-c
omponents como engine do MUI. Evitar dupla pilha.
- Tipagem:
  - Trocar `any` em contexts e serviços por tipos. Exemplos:
    - `setWorkForm: (data: IAttributesProps) => void;`
    - `const [customerForm, setCustomerForm] = useState<CustomerForm>({ ... });`
- TSConfig:
  - `target: ES2020`, `lib: ["ES2020", "DOM", "DOM.Iterable"]`, `module: "ESNext
"`, `moduleResolution: "Bundler"`, remover `allowJs` se possível.
- Substituir `window.location.href` por `router.push`/`replace` e revisar efeito
s com event listeners para limpeza correta.
- Segurança/CSP:
  - Evitar inline scripts; mover para `next/script` ou arquivos externos.

Sugestões de patches concretos
- src/middleware.ts
  - Redirect: `NextResponse.redirect(new URL('/', req.url))`
  - Matcher com `:path*`.
- src/pages/_app.tsx
  - Envolver limpeza de `localStorage` em `useEffect(() => { ... }, [router.isRe
ady, router.query.type])` e normalizar `type`.
- src/pages/_document.tsx
  - Remover `<title>` e migrar GA para `next/script`:
    - `<Script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.N
EXT_PUBLIC_GA_ID}`} strategy=\"afterInteractive\" />`
    - `<Script id=\"ga-init\" strategy=\"afterInteractive\">{`window.dataLayer=.
..`}</Script>`
- .gitignore
  - Remover `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, e `next-env.d.ts
` da lista.
- eslint.config.js
  - Opção rápida: instalar `@typescript-eslint/parser` e usar parser/plugin corr
etos, ou alterar para:
    - `import tseslint from 'typescript-eslint';`
    - `languageOptions: { parser: tseslint.parser }` e adicionar regras do `tses
lint.configs.recommended`.

Quer que eu aplique agora as correções de alta prioridade (middleware, _app, _do
cument, .gitignore e ESLint), e em seguida proponha um plano para padronizar o m
otor de estilos e atualizar versões?
