#!/usr/bin/env node

const path = require('path')
const { build } = require('vite')
const fs = require('fs')
const react = require('@vitejs/plugin-react')
const ssr = require('vite-plugin-ssr/plugin')
const dynamicImports = require('../dynamic-imports.js')
const {spawn} = require('child_process')

function getChildExitPromise(child) {
  return new Promise((res, rej) => {
    child.on("exit", (code) => {
      if (code === 0) {
        res()
      } else {
        rej(code)
      }
    })
  })
}

async function esbuildWorkerCommand() {
  const child = spawn("node", ["-r", "esbuild-register", "build-worker.js"], {
    cwd: path.join(__dirname, ".."),
    stdio: "inherit"
  })
  await getChildExitPromise(child)
}

async function serveWorker() {
  const wranglerPath = path.join(__dirname, "..", "node_modules", "wrangler", "bin", "wrangler.js")

  const child = spawn(wranglerPath, ["dev"], {cwd: path.join(__dirname, ".."), stdio: "inherit"})
  await getChildExitPromise(child)
}

async function publishWorker() {
  const wranglerPath = path.join(__dirname, "..", "node_modules", "wrangler", "bin", "wrangler.js")

  const child = spawn(wranglerPath, ["publish"], {cwd: path.join(__dirname, ".."), stdio: "inherit"})
  await getChildExitPromise(child)
}

(async function() {
  const command = process.argv[2]

  switch(command) {
    case "build:node":
      await buildCommand()
      break
    case "dev":
      await devCommand()
      break
    case "build:client:worker":
      await buildCommand("worker")
      break;
    case "esbuild:worker":
      await esbuildWorkerCommand()
      break;
    case "serve:node":
      await devCommand(true)
      break;
    case "serve:worker":
      await serveWorker()
      break;
    case "publish":
      await publishWorker()
      break;
    default:
      console.log("No command given")
  }
})()

function getConfig(buildDir = path.join(__dirname, "..", "dist")) {
  const componentsDirectory = path.join(process.cwd(), "components").toString()
  const files = fs.readdirSync(componentsDirectory)
  let customComponents = files.map((f) => ({
    name: f, path: path.join(componentsDirectory, f)
  }))

  // Don't include custom components if we are running from franklin-esr, not a customer project
  customComponents = process.cwd() === path.join(__dirname, "..").toString() ? [] : customComponents

  /**
   * @type {import('vite').UserConfig}
   */
  return {
    root: path.join(__dirname, "..").toString(),
    configFile: false,
    build: {
      outDir: buildDir
    },
    plugins: [
      react(),
      ssr(),
      dynamicImports(customComponents)
    ]
  }
}

async function devCommand(isProduction = false) {
  const { startServer } = await import("../server/index.mjs")
  await startServer({...getConfig(), server: { middlewareMode: 'ssr' }}, isProduction)
}

async function buildCommand(mode = undefined) {
  // If building worker, output to franklin-esr/dist. Else output to customer-project/dist
  const customOutDir = mode === "worker" ? undefined : path.join(process.cwd(), "dist")

  const config = getConfig(customOutDir)

  // vite build --ssr
  await build({...config, build: {...config.build, ssr: true}, mode: mode})
  // vite build
  await build(config)
}
