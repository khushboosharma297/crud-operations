# Team Skill Matrix Graph

An interactive graph visualization that displays team members, their skills, and proficiency levels.

## Features

### Core Features
- **Interactive Graph Visualization** - Built with React Flow
  - Person nodes (blue) with User icon
  - Skill nodes (purple) with Lightbulb icon
  - Color-coded edges by proficiency level:
    - Yellow: Learning
    - Blue: Familiar
    - Green: Expert

- **Node Interaction**
  - Click any Person node to see their skills and proficiency levels
  - Click any Skill node to see which team members have it
  - Detail panel shows edit/delete options

- **CRUD Operations**
  - Add new people with name and optional role
  - Add new skills with name and optional category
  - Create connections between people and skills with proficiency levels
  - Edit person details or skill details
  - Delete nodes (automatically removes all related connections)
  - Delete individual connections

- **Data Persistence**
  - All data is automatically saved to localStorage
  - Data persists across page refreshes
  - Pre-populated with seed data on first load

### Graph Controls
- Pan and zoom the canvas
- MiniMap for navigation
- Background grid
- Zoom controls

## Tech Stack

- **Framework**: Next.js 13 with TypeScript
- **Graph Library**: React Flow
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Styling**: Tailwind CSS
- **Data Storage**: localStorage

## Project Structure

```
├── app/
│   ├── page.tsx          # Main application component
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── lib/
│   ├── types.ts          # TypeScript type definitions
│   └── data.ts           # Data management & seed data
└── components/ui/        # shadcn/ui components
```

## Running Locally

Install dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build for Production

```bash
npm run build
npm start
```

## Seed Data

The application comes pre-loaded with:
- 5 team members (Alice, Bob, Carol, Dan, Eva)
- 10 skills (React, TypeScript, Node.js, PostgreSQL, Docker, Figma, CSS, GraphQL, CI/CD, Next.js)
- 22 skill connections with various proficiency levels

## Usage

1. **View the Graph**: The graph loads automatically with seed data
2. **Click Nodes**: Click on any person or skill to see details in the side panel
3. **Add New Items**: Use the buttons in the top-left to add people, skills, or connections
4. **Edit**: Click Edit in the detail panel to modify names, roles, or categories
5. **Delete**: Remove nodes or individual connections using the delete buttons
6. **Navigate**: Use mouse to pan, scroll to zoom, or use the built-in controls

All changes are automatically saved to your browser's localStorage.
