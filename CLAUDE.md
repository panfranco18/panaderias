@AGENTS.md

## Git / GitHub

- Repo remoto: `origin` → https://github.com/panfranco18/panaderias.git (rama `main`).
- La cuenta autorizada para pushear a este repo es `panfranco18` (GitHub CLI, `gh auth login` ya completado en esta máquina). No hace falta volver a pedir permiso de login/cuenta para hacer `git push` en esta carpeta — solo confirmar el contenido del commit si corresponde.
- Si en algún momento `gh auth status` muestra otra cuenta activa distinta de `panfranco18`, hay que volver a loguear con `gh auth login --hostname github.com --git-protocol https --web` antes de pushear.

