# Command Center UI System

A comprehensive, accessible design system built for the Command Center application using SvelteKit, TailwindCSS, and modern best practices.

## Overview

The UI system provides a complete set of reusable components with consistent styling, animations, and accessibility features. All components are built with Svelte 5 and use CSS variables for theming support.

## Design Tokens

### Colors

The design system uses HSL-based color tokens that support both light and dark modes:

- **Primary**: Main brand color (blue)
- **Secondary**: Secondary actions and UI elements
- **Destructive**: Error states and destructive actions (red)
- **Success**: Success states and positive feedback (green)
- **Warning**: Warning states and cautionary messages (orange)
- **Muted**: Subdued UI elements
- **Accent**: Highlighted UI elements
- **Background/Foreground**: Base colors for text and backgrounds
- **Border/Input**: UI element borders

### Border Radius

- `lg`: Default radius (0.5rem)
- `md`: Medium radius (calc(0.5rem - 2px))
- `sm`: Small radius (calc(0.5rem - 4px))

### Animations

Pre-configured animations for common UI patterns:
- Fade in/out
- Slide in/out (top and bottom)
- Accordion expand/collapse

## Components

### Base Components

#### Button
Versatile button component with multiple variants and sizes.

**Variants**: `default`, `secondary`, `outline`, `ghost`, `link`, `destructive`, `success`
**Sizes**: `sm`, `default`, `lg`, `icon`

```svelte
<Button variant="primary">Click me</Button>
<Button variant="destructive" size="sm">Delete</Button>
```

#### Input
Styled text input with proper accessibility attributes.

```svelte
<Input placeholder="Enter text..." bind:value={text} />
```

#### Label
Form label component with required indicator support.

```svelte
<Label for="email" required>Email Address</Label>
```

#### Textarea
Multi-line text input.

```svelte
<Textarea placeholder="Enter description..." bind:value={description} />
```

#### Select
Styled select dropdown.

```svelte
<Select bind:value={selected}>
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
</Select>
```

#### Checkbox
Custom checkbox with visual indicator.

```svelte
<Checkbox bind:checked={agreed} id="terms" />
<Label for="terms">I agree to terms</Label>
```

### Container Components

#### Card
Flexible card container with header, content, and footer sections.

```svelte
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

#### Dialog
Modal dialog with backdrop and keyboard support (Escape to close).

```svelte
<Dialog bind:open={showDialog}>
  <DialogHeader>
    <DialogTitle>Confirm Action</DialogTitle>
  </DialogHeader>
  <DialogContent>
    Are you sure you want to proceed?
  </DialogContent>
  <DialogFooter>
    <Button variant="outline" onclick={() => showDialog = false}>Cancel</Button>
    <Button>Confirm</Button>
  </DialogFooter>
</Dialog>
```

#### Dropdown
Dropdown menu container.

```svelte
<Dropdown bind:open={showMenu}>
  <button onclick={() => console.log('Item clicked')}>Menu Item</button>
</Dropdown>
```

### Feedback Components

#### Badge
Status indicators and labels.

**Variants**: `default`, `secondary`, `outline`, `destructive`, `success`, `warning`

```svelte
<Badge>New</Badge>
<Badge variant="success">Active</Badge>
<Badge variant="destructive">Error</Badge>
```

#### Alert
Informational alerts and messages.

**Variants**: `default`, `destructive`, `success`, `warning`

```svelte
<Alert variant="success">
  <CheckCircle class="h-4 w-4" />
  <AlertTitle>Success</AlertTitle>
  <AlertDescription>Your changes have been saved.</AlertDescription>
</Alert>
```

#### Progress
Progress bar indicator.

```svelte
<Progress value={50} max={100} />
```

#### Skeleton
Loading state placeholders.

```svelte
<Skeleton class="h-12 w-full" />
<Skeleton class="h-4 w-3/4" />
```

### Navigation Components

#### Tabs
Tabbed content navigation with context-based state management.

```svelte
<Tabs bind:value={activeTab}>
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

#### Separator
Horizontal or vertical dividers.

```svelte
<Separator />
<Separator orientation="vertical" />
```

## Utilities

### cn() - Class Name Utility

Merges Tailwind CSS classes intelligently, handling conflicts and conditional classes.

```typescript
import { cn } from '$lib/utils/cn';

const className = cn(
  'base-class',
  isActive && 'active-class',
  'override-class'
);
```

## Theming

The UI system supports light and dark modes through CSS classes. Apply the `dark` class to the root element to switch themes:

```svelte
<html class="dark">
```

All color tokens automatically adapt to the current theme.

## Accessibility

All components follow WCAG 2.2 AA guidelines:

- Proper ARIA attributes
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- Sufficient color contrast

## File Structure

```
frontend/src/lib/
├── components/ui/
│   ├── Button.svelte
│   ├── Input.svelte
│   ├── Label.svelte
│   ├── Textarea.svelte
│   ├── Select.svelte
│   ├── Checkbox.svelte
│   ├── Card.svelte
│   ├── CardHeader.svelte
│   ├── CardTitle.svelte
│   ├── CardDescription.svelte
│   ├── CardContent.svelte
│   ├── CardFooter.svelte
│   ├── Dialog.svelte
│   ├── DialogHeader.svelte
│   ├── DialogTitle.svelte
│   ├── DialogContent.svelte
│   ├── DialogFooter.svelte
│   ├── Dropdown.svelte
│   ├── Badge.svelte
│   ├── Alert.svelte
│   ├── AlertTitle.svelte
│   ├── AlertDescription.svelte
│   ├── Progress.svelte
│   ├── Separator.svelte
│   ├── Tabs.svelte
│   ├── TabsList.svelte
│   ├── TabsTrigger.svelte
│   ├── TabsContent.svelte
│   ├── Skeleton.svelte
│   └── index.ts
└── utils/
    ├── cn.ts
    └── index.ts
```

## Usage Example

```svelte
<script lang="ts">
  import {
    Button,
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    Input,
    Label,
    Badge
  } from '$lib/components/ui';

  let name = $state('');
</script>

<Card>
  <CardHeader>
    <CardTitle>User Profile</CardTitle>
    <Badge variant="success">Active</Badge>
  </CardHeader>
  <CardContent>
    <div class="space-y-4">
      <div class="space-y-2">
        <Label for="name">Name</Label>
        <Input id="name" bind:value={name} />
      </div>
      <Button>Save Changes</Button>
    </div>
  </CardContent>
</Card>
```

## Showcase

Visit `/ui-showcase` in the application to see all components in action with live examples.

## Contributing

When adding new components:

1. Follow the existing pattern and naming conventions
2. Use the `cn()` utility for className merging
3. Support theming through CSS variables
4. Include proper TypeScript types
5. Ensure accessibility compliance
6. Add the component to `index.ts`
7. Update this documentation

## Dependencies

- **clsx**: Conditional className construction
- **tailwind-merge**: Tailwind class conflict resolution
- **class-variance-authority**: Component variant management
- **lucide-svelte**: Icon library
