# Vision

## Project Name

Next.js AI-First Starter Kit

## Purpose

Production-ready starter kit for building business applications (SaaS, CRM, internal systems) with Next.js. Provides authentication, RBAC, admin panel, and a standardized architecture out of the box.

## Core Principles

### AI-First Architecture

The project is designed to be generated and extended by AI assistants. Every architectural decision prioritizes predictability, consistency, and discoverability by AI tools. A developer should be able to instruct an AI to "add a Company entity with CRUD" and receive code that fits seamlessly into the existing structure.

### Production Readiness

Not a demo or tutorial — a foundation for real products. Includes:

- Authentication and session management
- Permission-based access control (RBAC)
- REST API with unified error handling
- Soft delete for data safety
- Dockerized development environment
- Type-safe end-to-end
- Tests and code quality tools

### Extensibility

New business entities follow a rigid template (schema → service → API → UI → permissions → menu). This makes the codebase predictable and scalable without architectural drift.

### Minimal Overhead

- SQLite for zero-config local development (Postgres-ready when needed)
- Lightweight dependency footprint
- Server Components by default, Client Components only where necessary

## Target Audience

- Teams building internal tools and dashboards
- SaaS founders needing a quick authenticated scaffold
- Developers who want an AI-friendly foundation for rapid feature development

## Non-Goals

- Not a marketing site or landing page template
- Not a CMS or e-commerce platform
- Not a low-code/no-code platform
- Activity logging is excluded
