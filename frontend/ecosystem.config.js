module.exports = {
  apps: [
    {
      name: "clixxx-frontend",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      instances: 1,
      autorestart: true,
      watch: true,
      watch_delay: 1000,
      ignore_watch: ["node_modules", ".git", "*.log", ".next"],
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
}
