# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Play Lounge Admin is the Next.js 16 admin dashboard for the Play Lounge venue discovery/booking platform. It's part of a monorepo - see the parent `CLAUDE.md` for full project context.

## Development Commands

```bash
npm run dev           # Development server (http://localhost:3000)
npm run build         # Production build
npm run lint          # ESLint
npm run format        # Prettier formatting
npm run format:check  # Check formatting without modifying
```

## Architecture

### Colocation-Based Structure

Features are organized within their route folders. Each dashboard feature contains its own components, schemas, and logic:

```
src/app/(main)/dashboard/venues/
├── page.tsx                    # Route page
├── [id]/edit/page.tsx          # Dynamic edit route
├── new/page.tsx                # Create route
└── _components/
    ├── columns.tsx             # TanStack Table column definitions
    ├── venue-form.tsx          # React Hook Form component
    ├── venue-table.tsx         # Data table component
    └── delete-alert.tsx        # Deletion confirmation dialog
```

### Key Directories

- `src/app/(main)/` - Authenticated routes (dashboard, auth)
- `src/app/(external)/` - Public routes
- `src/components/ui/` - shadcn/ui components (auto-generated, ESLint-ignored)
- `src/components/data-table/` - Reusable TanStack Table components
- `src/services/` - API service functions (one per entity)
- `src/hooks/` - TanStack Query hooks (one per entity)
- `src/types/` - TypeScript interfaces
- `src/stores/` - Zustand stores (preferences/theme)
- `src/navigation/` - Sidebar configuration
- `src/lib/` - Utilities (api-client, auth, s3-upload)

### Data Flow Pattern

1. **Services** (`src/services/*.service.ts`) - Axios calls to backend API
2. **Hooks** (`src/hooks/use-*.ts`) - TanStack Query wrappers with cache invalidation
3. **Components** - Consume hooks, handle UI state

Example:

```
venue.service.ts → useVenues() hook → VenueTable component
```

### Server-Side Pagination

Tables use server-side pagination with the `PaginationParams` and `PaginationMeta` types from `@/types/pagination`:

- Hooks accept optional `{ page, limit }` params
- Without params, hooks fetch all data (limit: 1000)
- Query keys include pagination params for proper cache invalidation
- Uses `keepPreviousData` for smooth page transitions

### Authentication

- NextAuth v5 with credentials provider (`src/lib/auth.ts`)
- Admin-only login via `/api/auth/admin/login` endpoint
- Only `SUPER_ADMIN` role can access the dashboard
- JWT tokens stored in session, passed via axios interceptors

### API Client

- Configured in `src/lib/api-client.ts`
- Base URL: `${NEXT_PUBLIC_API_URL}/api`
- Auto-attaches JWT from NextAuth session via request interceptor
- Auto-logout on 401 responses via response interceptor
- 30-second timeout

### File Uploads

Files are uploaded client-side to S3 before sending the API payload:

1. Use `uploadFile(file, folder)` from `@/lib/upload-utils.ts`
2. Function posts to `/api/upload` Next.js route
3. Returns the public S3 URL to include in API payload

Example in services:

```typescript
const thumbnailUrl = await uploadFile(data.thumbnail, "venues/thumbnails");
// Then include thumbnailUrl in API payload
```

## Environment Variables

Required in `.env.local`:

- `NEXT_PUBLIC_API_URL` - Backend API base URL
- `NEXT_PUBLIC_BACKEND_URL` - Backend URL for rewrites
- `AUTH_API_URL` - Auth endpoint URL (server-side)
- AWS S3 credentials for file uploads

## Coding Conventions

### File Naming

- Kebab-case enforced by ESLint (`unicorn/filename-case`)
- Exceptions: `*.config.ts`, `*.d.ts`

### Import Order (ESLint enforced)

1. React
2. Next.js
3. External packages
4. Internal (`@/*` paths)

### ESLint Rules

- Max file length: 300 lines (use `/* eslint-disable max-lines */` for complex services)
- Max complexity: 10 (use `/* eslint-disable complexity */` for complex functions)
- Max nesting: 4 levels
- Nullish coalescing required (`??` over `||`)
- No array index keys in JSX

## Adding New Features

1. Create route folder in `src/app/(main)/dashboard/[feature]/`
2. Add service in `src/services/[feature].service.ts`
3. Add TanStack Query hook in `src/hooks/use-[feature].ts`
4. Add type in `src/types/[feature].ts`
5. Add to sidebar in `src/navigation/sidebar/sidebar-items.ts`

### Hook Pattern

```typescript
const QUERY_KEY = ["feature"];

export const useFeatures = (params?: PaginationParams) => {
  const effectiveParams = params ?? { page: 1, limit: 1000 };
  return useQuery({
    queryKey: params ? [...QUERY_KEY, params.page, params.limit] : [...QUERY_KEY, "all"],
    queryFn: () => getFeatures(effectiveParams),
    placeholderData: keepPreviousData,
  });
};

export const useCreateFeature = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInput) => createFeature(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Created successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message ?? "Failed to create");
    },
  });
};
```

### Service Pattern

```typescript
export const getFeatures = async (params: PaginationParams): Promise<FeatureListResult> => {
  const response = await apiClient.get<FeatureResponse>("/features", {
    params: { page: params.page, limit: params.limit },
  });
  return { data: response.data.data, meta: response.data.meta };
};
```
