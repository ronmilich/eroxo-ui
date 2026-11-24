Iris provides light and dark palettes, type, sizing, shape, elevation, motion and icon tokens. Load the stylesheet once at the server document level to apply your theme on first paint.

```css
@import "eroxo-ui/tokens.css";
```

`data-erx-theme="light"` or `data-erx-theme="dark"` selects a complete built-in theme on an element and its descendants. With no explicit root selection, the root follows the system color preference. Each built-in theme also sets the native `color-scheme`.

## Partial custom themes

Use your own `data-erx-theme` name inside a built-in or system theme. Override only the roles your theme needs. Omitted values, including the native color scheme, inherit from the nearest theme. Explicitly set both colors in a custom foreground/background pair if necessary for contrast.

```css
[data-erx-theme="acme"] {
  --erx-color-primary: #184b91;
  --erx-color-on-primary: #ffffff;
}
```

Color-dependent recipes such as shadows recompute on an Eroxo theme scope. Put shadow pigment overrides on that scope, or override the finished shadow role directly. Stable typography and radius roles inherit from ancestor scopes. For a local font change, use the role-specific family hook or the font-stack primitive. Components read the optional family hook with the stack as fallback.

Set `data-erx-density` to `compact`, `standard` or `comfortable`. Density and theme can nest in either order. Density controls sizing and spacing. Use `data-erx-motion="reduce"` to reduce motion inside a scope. System reduced motion applies to every scope.

The contrast table reports sRGB ratios for the default palettes. Disabled controls and decorative edges have distinct roles. Verify contrast for any custom theme and check actual focus and state rendering when you apply the tokens to a component.

{{tokens}}
