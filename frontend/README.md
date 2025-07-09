# Clixx frontend

A modern model sharing platform built with Next.js 15, React 18, and Tailwind CSS.

## Features

- 🏠 **Home Feed** - Browse and discover model content with tags
- 👥 **Models Directory** - Explore different models and creators
- 📱 **Responsive Design** - Works on desktop and mobile
- 🔍 **Live Search** - Search by author names, nicknames, and tags
- 💳 **Content Management** - Manage free and paid content
- 👤 **User Profiles** - Personal profiles with content management
- 🎨 **Modern UI** - Built with shadcn/ui components

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI + shadcn/ui
- **Icons:** Lucide React
- **State Management:** React Context

## Prerequisites

- Node.js 18.17.0 or higher
- npm 9.0.0 or higher

## Installation

1. **Extract the project files** to your desired directory

2. **Navigate to the project directory:**

   ```
   cd frontend
   ```

3. **Install dependencies:**

   ```
   yarn install
   ```

4. **Start the development server:**

   ```
   yarn dev
   ```

5. **Open your browser** and navigate to `http://localhost:3000`

## Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint
- `yarn type-check` - Run TypeScript type checking

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   ├── models/             # Models pages
│   ├── mycontent/          # My Content page
│   └── profile/            # Profile page
├── components/             # React components
│   ├── ui/                 # shadcn/ui components
│   ├── header.tsx          # Header component
│   ├── hero.tsx            # Hero banner
│   ├── posts.tsx           # Posts feed
│   └── footer.tsx          # Footer component
├── contexts/               # React contexts
│   └── search-context.tsx  # Search state management
├── hooks/                  # Custom React hooks
│   └── use-toast.ts        # Toast notifications
├── lib/                    # Utility functions
│   └── utils.ts            # Common utilities
└── public/                 # Static assets
```

## Features Overview

### Home Page

- Browse model content with rich media
- Tag-based content discovery
- Interactive engagement (likes, comments, shares)
- Subscribe to premium content

### Models Directory

- Explore different models and creators
- View model details and statistics
- Author profiles with verification status

### Search Functionality

- Live search across all pages
- Search by author names, nicknames, and tags
- Real-time filtering as you type

### Content Management

- Filter content by type (All, Free, Paid)
- Personal content library
- Download free content

### User Profiles

- Personal information management
- Account settings and preferences
- Content creation tools

## Customization

### Colors

The project uses a sky-blue color scheme. You can customize colors in:

- `tailwind.config.js` - Tailwind color palette
- `app/globals.css` - CSS custom properties

### Components

All UI components are built with shadcn/ui and can be customized in the `components/ui/` directory.

## Deployment

### Build for Production

```
yarn build
```

### Deploy to Server

1. Push your code to GitHub
2. Connect your repository to server
3. Pull and build

## Troubleshooting

### Common Issues

**TypeScript errors:**

```
yarn type-check
```

## Contributing

2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

```
.env.example
```

# Environment Variables Example

# Copy this file to .env.local and fill in your values

# App Configuration

- NEXT_PUBLIC_APP_URL=http://localhost:3000
- NEXT_PUBLIC_APP_NAME="Clixxx frontend"
