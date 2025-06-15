// This adds type definitions for Node.js globals
interface ProcessEnv {
  NODE_ENV: 'development' | 'production' | 'test';
  // Add other environment variables here as needed
}

declare namespace NodeJS {
  interface ProcessEnv extends ProcessEnv {}
  interface Process {
    env: ProcessEnv;
  }
}

declare const process: NodeJS.Process;
