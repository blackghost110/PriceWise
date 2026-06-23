# CLAUDE.md

## Commands Reference
- Run Frontend: `ng serve` (ou ta commande exacte)
- Run Backend: `npm run start:dev`
- Test: `npm run test`

## Technology Guidelines

### Angular 22 (Frontend)
- **Architecture**: MUST use Standalone Components (no `NgModule` for components).
- **State Management**: Use **Angular Signals** (`signal`, `computed`, `effect`) exclusively for local and shared state. Avoid legacy RxJS behaviors unless interacting with HTTP requests (`HttpClient` streams converted via `toSignal`).
- **Control Flow**: Use the built-in block syntax (`@if`, `@for`, `@switch`). NEVER use legacy `*ngIf` or `*ngFor`.
- **Performance**: Always use `changeDetection: ChangeDetectionStrategy.OnPush` on all components.