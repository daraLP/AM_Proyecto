# Fase 4 · Pruebas: Pipeline de CI (GitHub Actions)

> **POSCafé · Specs · Fase 4 · Pruebas** · Índice general: `docs/specs/README.md`


```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  app:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npx jest --ci --coverage

  db:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
        with: { version: latest }
      - run: supabase start
      - run: supabase db reset
      - run: supabase test db
```
