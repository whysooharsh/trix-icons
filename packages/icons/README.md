# @trix/icons

Animated React icon components for `trix-icons`. Every icon embodies a tiny, intentional interaction story.

## Installation

```bash
npm install @trix/icons motion react
```

## Usage

```tsx
import { SearchIcon, BellIcon, MailIcon } from '@trix/icons';

export function Example() {
  return (
    <div>
      <SearchIcon size={24} trigger="hover" />
      <BellIcon size={24} trigger="hover" />
      <MailIcon size={24} trigger="hover" />
    </div>
  );
}
```

## Imperative Control

Each component exposes an imperative handle via `React.forwardRef`:

```tsx
import { useRef } from 'react';
import { SearchIcon } from '@trix/icons';
import type { AnimatedIconHandle } from '@trix/core';

export function ManualSearch() {
  const iconRef = useRef<AnimatedIconHandle>(null);

  return (
    <div>
      <SearchIcon ref={iconRef} trigger="manual" />
      <button onClick={() => iconRef.current?.startAnimation()}>
        Search
      </button>
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `size` | `number \| string` | `24` | Icon width and height in pixels or CSS length |
| `color` | `string` | `'currentColor'` | Icon stroke/fill color |
| `strokeWidth` | `number` | `2` | Stroke width for stroke-based icons |
| `trigger` | `'hover' \| 'press' \| 'focus' \| 'manual' \| 'none'` | `'hover'` | Interaction trigger |
| `disabled` | `boolean` | `false` | Disables animation and pointer events |
| `aria-label` | `string` | `undefined` | Accessible label for informative icons |

## License

MIT License.
