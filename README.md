# Tree-First Family Tree Web Application

A visual-first family tree builder where members, relationships, and lineage are managed interactively on a responsive React Flow canvas.

## Features

- **Tree-First Workflow**: Node-centric interactions for adding relatives and managing members directly from the canvas.
- **Dynamic Generational Layout**: Automatic calculation of generational tiers, spouse pairings, and child branch positioning.
- **Contextual Add Member Modal**: Add relatives (**Child**, **Spouse**, **Parent**, **Sibling**) pre-configured relative to any selected node.
- **Member CRUD & Profile Drawer**: Inspect immediate family relationships, edit details, and safely delete members with automatic relationship detachment.
- **Live Search & Jump**: Search any family member by name or role with instant animated camera pan and zoom.
- **Family Head Management**: Switch active Family Head with custom administrative badges.
- **Full Persistence**: Automatic synchronization to `LocalStorage` plus JSON Export & Import.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run the Vite development server
npm run dev
```

Open `http://localhost:3000` to view the application in your browser.
