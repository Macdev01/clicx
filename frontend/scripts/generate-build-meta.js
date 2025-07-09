const fs = require("fs")
const { execSync } = require("child_process")
const path = require("path")

// Get git hash
const gitHash = execSync("git rev-parse HEAD").toString().trim()
const gitBranch = execSync("git rev-parse --abbrev-ref HEAD").toString().trim()

// Create build metadata
const buildMeta = {
  gitHash,
  gitBranch,
  buildTime: new Date().toISOString(),
}

// Ensure the public directory exists
const publicDir = path.join(process.cwd(), "public")
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir)
}

// Write to a JSON file
fs.writeFileSync(path.join(publicDir, "build-meta.json"), JSON.stringify(buildMeta, null, 2))
