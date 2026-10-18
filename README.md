# SIGI Retail · Sistema de Gestión de Inventarios

Sistema web de gestión de inventarios para una tienda de comercio minorista (caso: **Minimarket Sumaq**, Arequipa). Proyecto desarrollado en el **Laboratorio 03 – Metodologías de Desarrollo de Software** del curso *Gestión de Sistemas y Tecnologías de Información* (EPIS – UNSA, 2026 B).

El mismo producto se abordó con dos equipos en paralelo para comparar enfoques:

| Equipo | Metodología | Resultado |
|---|---|---|
| Equipo Ágil | Scrum (3 sprints) | Aplicación funcionando y publicada (este repositorio) |
| Equipo Cascada | Modelo en cascada (Royce) | Requisitos (SRS), diseño y avance de implementación en [`docs/cascada`](docs/cascada) |

- **Demo en línea:** https://owerlopez.github.io/gsti-lab03-sigi-inventarios/
- **Tablero (GitHub Projects):** https://github.com/users/OwerLopez/projects/3
- **Product Backlog:** [Issues](https://github.com/OwerLopez/gsti-lab03-sigi-inventarios/issues?q=is%3Aissue) · **Sprints y fases:** [Milestones](https://github.com/OwerLopez/gsti-lab03-sigi-inventarios/milestones?state=closed) · **Release:** [v1.0.0](https://github.com/OwerLopez/gsti-lab03-sigi-inventarios/releases/tag/v1.0.0)

## Funcionalidades (Release 1)

| Módulo | Historias de usuario | Sprint |
|---|---|---|
| Control de stock | HU-01 registrar producto · HU-02 editar/desactivar · HU-03 búsqueda y filtros · HU-04 ingreso de mercadería con costo promedio · HU-05 alertas de stock mínimo · HU-06 kardex · HU-19 ajuste por inventario físico | 1 y 2 |
| Registro de ventas | HU-07 punto de venta · HU-08 validación de stock · HU-09 anulación con devolución · HU-10 boleta imprimible · HU-11 métodos de pago (Efectivo, Tarjeta, Yape, Plin) · HU-12 historial | 2 |
| Reportes | HU-13 panel con KPIs · HU-14 ventas por período · HU-15 más vendidos · HU-16 inventario valorizado y reposición · HU-17 exportar CSV / imprimir · HU-18 respaldo | 3 |

## Equipo

| Integrante | Equipo | Rol |
|---|---|---|
| Saya Vargas, Cristian Raúl | Scrum | Product Owner |
| López Arela, Ower Frank | Scrum | Scrum Master / Developer |
| Zegarra Puma, Mauricio Eduardo | Scrum | Developer |
| Congona Manrique, Mauricio Elías | Cascada | Jefe de proyecto / Analista de requisitos |
| Coronado Peña, Javier | Cascada | Arquitecto / Diseñador |
| Chaisa Fernández, Anthony Leonel | Cascada | Analista programador / QA |

## Ejecución local

No requiere instalación: es una aplicación web estática (HTML, CSS y JavaScript con módulos ES). Los datos se guardan en el navegador (`localStorage`) y se pueden respaldar en JSON.

```bash
git clone https://github.com/OwerLopez/gsti-lab03-sigi-inventarios.git
cd gsti-lab03-sigi-inventarios
python -m http.server 8080      # o: npm start
# abrir http://localhost:8080
```

Pruebas automatizadas (Node.js 20+ con el *test runner* nativo):

```bash
npm test
```

## Estructura

```
├── index.html            # interfaz (SPA con rutas por hash)
├── css/styles.css
├── js/
│   ├── inventory.js      # núcleo de dominio: reglas de negocio puras y testeables
│   ├── seed.js           # datos de demostración deterministas
│   ├── store.js          # persistencia local y respaldo JSON
│   ├── ui.js             # utilidades de interfaz: formato, avisos, modales, gráficos
│   ├── app.js            # menú lateral y enrutador por hash
│   └── views/            # una vista por módulo: panel, productos, kardex, POS, historial, reportes…
├── tests/                # 23 pruebas de aceptación (una suite por sprint)
├── docs/scrum/           # backlog, planificación, dailies, review y retrospectiva
├── docs/cascada/         # plan, SRS, diseño, script de BD, control de cambios
└── .github/workflows/    # integración continua (pruebas en cada push)
```

## Flujo de trabajo

- Cada historia de usuario es un *issue* con criterios de aceptación y estimación en puntos.
- Cada sprint es un *milestone*; el tablero del proyecto muestra el estado (Backlog → Sprint Backlog → En curso → Revisión → Hecho).
- Ramas por historia (`feature/HU-xx-...`) integradas a `main` mediante *pull request* con CI en verde.
- *Definition of Done*: criterios de aceptación cumplidos, prueba automatizada en verde, revisión de otro integrante y despliegue en GitHub Pages.

## Licencia

MIT — uso académico.
