# Food Finder

A small recipe finder: tell it what's in your kitchen, and it shows you what
you can cook. Built with React, Vite, and Tailwind CSS.

## Running it on your computer

You'll need [Node.js](https://nodejs.org) installed (the LTS version is fine).
Then, in this folder:

```bash
npm install
npm run dev
```

This starts a local server (usually at `http://localhost:5173`) - open that
in your browser. Leave it running while you work; the page updates
automatically whenever a file is saved.

## Building for deployment

```bash
npm run build
```

This creates a `dist/` folder containing the finished site - this is what
gets deployed.

## Deploying

This project is ready to deploy as-is to Netlify (or Vercel):

- **Build command:** `npm run build`
- **Publish directory:** `dist`

The usual flow is to push this folder to a GitHub repository, then connect
that repository to Netlify - it will pick up the build command and publish
directory automatically and give you a live URL.

## Notes

- Your saved recipes are stored in your browser's local storage, so they'll
  stay on whichever device and browser you use the site from.
