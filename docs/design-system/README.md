# Eroxo Iris design specifications

These nine specifications define Eroxo UI's default design language (Iris) and its component conventions. From version 0.2.0 the Markdown files are the source of truth. The `.docx` files are the original v0.1.0 documents, kept for reference; they don't include the 0.2.0 changes. Color and Spacing were converted from Word to Markdown on 23 November 2026.

| Spec | ID | Version |
|---|---|---|
| [Color](eroxo-iris-color-spec.md) | ERX-DS-COLOR-001 | 0.2.0 |
| [Typography](eroxo-iris-typography-spec.md) | ERX-DS-TYPE-001 | 0.2.0 |
| [Spacing and sizing](eroxo-iris-spacing-sizing-spec.md) | ERX-DS-SPACE-001 | 0.2.0 |
| [Shape and borders](eroxo-iris-shape-borders-spec.md) | ERX-DS-SHAPE-001 | 0.2.0 |
| [Elevation and depth](eroxo-iris-elevation-depth-spec.md) | ERX-DS-DEPTH-001 | 0.2.0 |
| [Motion and interactions](eroxo-iris-motion-interactions-spec.md) | ERX-DS-MOTION-001 | 0.2.0 |
| [Iconography](eroxo-iris-iconography-spec.md) | ERX-DS-ICON-001 | 0.2.0 |
| [Behavior and accessibility](eroxo-iris-behavior-accessibility-spec.md) | ERX-DS-BEHAVIOR-001 | 0.2.0 |
| [Component anatomy and API](eroxo-iris-component-anatomy-api-spec.md) | ERX-DS-COMPONENT-001 | 0.4.0 |

## How they relate to other decisions

The owner approved the [UL-12 token decision record](ul-12-token-taxonomy.md) and [light/dark design study](../../dev/public/design/iris.html) on 24 November 2026. The record settles the UL-12 items listed in the foundation specs and provides the implementation contract for UL-13.

- The [reconciliation record](reconciliation.md), approved on 23 November 2026, checked v0.1.0 against the recorded decisions (UL-01 to UL-04) and against each other. Version 0.2.0 folds in its resolutions.
- The [UL-06 component rulebook](eroxo-iris-component-anatomy-api-spec.md) resolves the component API, part classes and density namespace in 0.3.0. Earlier reconciliation findings describe the 0.1.0 baseline.
- Approved decision records, such as the [UL-04 report](../ul-04-spike.md) and later ADRs, take precedence. A spec's user-visible contract changes only through a written decision.
- The [UI library roadmap](../ui-library-roadmap.md) uses these specs as inputs to UL-05, UL-06, UL-12, UL-13, UL-24 and UL-25.
