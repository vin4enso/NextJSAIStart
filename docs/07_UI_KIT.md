# UI Kit

## Styling

- **Tailwind CSS v4** for all styling
- **shadcn/ui** components (customized, no Radix UI primitives)
- **lucide-react** for icons
- Single light theme (no dark mode)

## Base Components (from shadcn)

Standard shadcn/ui components used throughout:

- Button
- Input
- Label
- Card
- Select
- Dialog
- DropdownMenu
- Avatar
- Badge
- Toast / Sonner
- Skeleton
- Separator
- Sheet (if drawer is needed)

## App Components (custom-built on shadcn)

### PageHeader

```typescript
<PageHeader
  title="Users"
  description="Manage system users"
  actions={<Button>Create User</Button>}
/>
```

Renders: breadcrumbs + title + description + action buttons row.

### AppTable

Wrapper around TanStack Table with consistent styling, sorting, and loading state.

```typescript
<AppTable
  columns={columns}
  data={users}
  isLoading={loading}
  pagination={{ page, pageSize, total }}
  onPageChange={setPage}
/>
```

### AppForm

Layout wrapper for React Hook Form fields.

```typescript
<AppForm>
  <FormField ... />
  <FormField ... />
</AppForm>
```

### DataToolbar

Top toolbar with search input + action buttons.

```typescript
<DataToolbar>
  <SearchInput value={search} onChange={setSearch} />
  <Button>Create</Button>
</DataToolbar>
```

### SearchInput

Debounced search input (`useDebounce`).

### ConfirmDelete

Modal confirming deletion with entity name display.

```typescript
<ConfirmDelete
  open={confirmOpen}
  onConfirm={handleDelete}
  onCancel={() => setConfirmOpen(false)}
  entityName={user.name}
/>
```

### AvatarUpload

File upload component with preview for avatar images. Stores in `public/uploads/`.

### Pagination

Standard pagination controls with page numbers, prev/next.

```typescript
<Pagination
  page={page}
  totalPages={totalPages}
  onPageChange={setPage}
/>
```

## Page Layout Pattern

Every page follows:

```
<PageHeader title="..." description="..." actions={...} />
<DataToolbar>
  <SearchInput />
  <Button>Action</Button>
</DataToolbar>
<AppTable columns={...} data={...} pagination={...} />
```

## States

Every data-fetching component handles:

1. **Loading** — skeleton rows via `Skeleton`
2. **Empty** — centered "No data" message with icon
3. **Error** — error message with retry button
4. **Success** — normal data display
