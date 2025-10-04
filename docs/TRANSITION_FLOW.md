# Transition Flow Diagram

```mermaid
graph TD
    A[IDLE] -->|Route Change Start| B[LOADING]
    B -->|Route Change Complete| C[TRANSITION_OUT]
    B -->|Route Change Error| C[TRANSITION_OUT]
    C -->|Transition Complete| A[IDLE]
    
    style A fill:#4ade80,stroke:#166534
    style B fill:#60a5fa,stroke:#1e40af
    style C fill:#fbbf24,stroke:#92400e
    
    classDef state fill:#e5e7eb,stroke:#6b7280,stroke-width:2px;
    classDef event fill:#f3f4f6,stroke:#d1d5db,stroke-width:1px;
    
    class A,B,C state;
```

## Event Flow

1. **routeChangeStart** → Show loader immediately
2. **routeChangeComplete** → Wait 300ms, then hide loader
3. **routeChangeError** → Hide loader immediately

## Hydration Safety

- All animated elements use predefined positions
- No random value generation during render
- SSR and CSR render identical markup
- Deterministic animations for consistent experience

## Component Hierarchy

```mermaid
graph TD
    A[Root Layout] --> B[LoaderProvider]
    B --> C[RouteTransitionHandler]
    C --> D[Application Pages]
    B --> E[UniversalLoader]
    
    style A fill:#3b82f6,stroke:#1d4ed8
    style B fill:#8b5cf6,stroke:#5b21b6
    style C fill:#ec4899,stroke:#9d174d
    style D fill:#10b981,stroke:#047857
    style E fill:#f59e0b,stroke:#b45309
```

## State Machine

```mermaid
stateDiagram-v2
    [*] --> IDLE
    IDLE --> LOADING: routeChangeStart
    LOADING --> TRANSITION_OUT: routeChangeComplete/routeChangeError
    TRANSITION_OUT --> IDLE: transitionComplete
```