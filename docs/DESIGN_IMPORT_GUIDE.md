# Design Import Guide

## Quick Start

When you get a new design zip file (from v0 or similar), follow these steps:

### 1. Extract the zip
```bash
unzip -o "path/to/design.zip" -d "path/to/extract-folder"
```

### 2. Check the structure
Key folders to look for:
- `app/` - Next.js pages
- `components/` - React components  
- `components/ui/` - Shadcn UI components
- `lib/` - Utility functions (utils.ts is common)
- `app/globals.css` or `styles/globals.css` - Design tokens

### 3. Copy UI components needed
Common shadcn components to copy to `components/ui/`:
- input.tsx, textarea.tsx, button.tsx
- card.tsx, badge.tsx, separator.tsx
- select.tsx, switch.tsx, label.tsx
- dialog.tsx, dropdown-menu.tsx
- toast.tsx, sonner.tsx

### 4. Check for dependencies
Look at `package.json` for required packages:
- `@radix-ui/react-*` - Radix UI primitives
- `lucide-react` - Icons
- `class-variance-authority` - For button/badge variants
- `clsx`, `tailwind-merge` - For cn() utility

### 5. Copy custom components
- Copy folder structure from `components/` (excluding ui/)
- Update imports to use `@/components/...`

### 6. Handle design tokens
Compare new `globals.css` with existing:
- Copy new CSS variables to existing `app/globals.css`
- Keep existing primary colors unless explicitly changing theme

### 7. Update pages
- Create new page at appropriate route
- Integrate with existing API endpoints
- Update navigation if needed

### Common Issues

1. **File too long**: Write using bash or split into smaller pieces
2. **Missing utils.ts**: Copy from `lib/utils.ts` (has cn() function)
3. **Missing @radix-ui packages**: Install with `npm install @radix-ui/react-*`
4. **Type errors**: Check imports match existing patterns

### Example: Adding a new page

```bash
# 1. Extract
unzip design.zip -d temp-design

# 2. Create folder
mkdir -p app/modules/new-module

# 3. Copy page
cp temp-design/app/page.tsx app/modules/new-module/page.tsx

# 4. Copy components
cp -r temp-design/components/my-component components/

# 5. Install deps
npm install @radix-ui/react-dialog lucide-react
```
