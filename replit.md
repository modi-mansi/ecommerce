# Overview

This is a full-stack e-commerce application built with React (frontend) and Express.js (backend). The application provides a complete online shopping experience with product browsing, cart management, order processing, and administrative features. It's designed as a modern web application with TypeScript, PostgreSQL database integration, and a component-based UI using shadcn/ui.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Context for global state (Auth, Cart) and TanStack Query for server state
- **Form Handling**: React Hook Form with Zod validation

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **API Design**: RESTful API endpoints organized by feature (products, orders, cart, analytics)
- **Development**: Hot reload with Vite integration for full-stack development

## Data Layer
- **ORM**: Drizzle ORM configured for PostgreSQL with migrations support
- **Schema**: Type-safe database schema with relationships between users, products, orders, and cart items
- **Connection**: Neon Database serverless PostgreSQL connection
- **Storage Pattern**: Repository pattern with IStorage interface for data operations

## Authentication & Authorization
- **Strategy**: Context-based authentication with role-based access (customer/admin)
- **Implementation**: JWT-style authentication simulation with localStorage persistence
- **Authorization**: Role-based component rendering and route protection

## Core Features
- **Product Management**: CRUD operations with category filtering, search, and inventory tracking
- **Shopping Cart**: Persistent cart with quantity management and real-time updates
- **Order Processing**: Complete order lifecycle from creation to status tracking
- **Admin Dashboard**: Metrics, inventory management, and order administration
- **Responsive Design**: Mobile-first responsive layout with adaptive components

## Development Workflow
- **Build System**: Vite for fast development with ESM modules
- **Development Server**: Express server with Vite middleware integration
- **Asset Handling**: Static file serving with proper routing fallbacks
- **Error Handling**: Global error boundary with user-friendly error messages

# External Dependencies

## Database & ORM
- **PostgreSQL**: Primary database with Neon Database as the cloud provider
- **Drizzle ORM**: Type-safe ORM with migration support and PostgreSQL dialect
- **Drizzle Kit**: Database migration and introspection tools

## Frontend Libraries
- **React Ecosystem**: React 18, React DOM, React Hook Form, React Query
- **UI Framework**: Radix UI primitives with shadcn/ui component system
- **Styling**: Tailwind CSS with PostCSS and Autoprefixer
- **Icons**: Lucide React for consistent iconography
- **Utilities**: Class Variance Authority, clsx, date-fns for utility functions

## Development Tools
- **Build Tools**: Vite with TypeScript, ESBuild for production builds
- **Development**: tsx for TypeScript execution, Replit-specific plugins
- **Code Quality**: TypeScript strict mode, ESM modules throughout

## Runtime Dependencies
- **Server**: Express.js with middleware for JSON parsing and static files
- **Client-Server Communication**: Fetch API with custom request wrapper
- **Session Management**: Simulated authentication with localStorage
- **Error Handling**: Custom error classes and global error boundaries