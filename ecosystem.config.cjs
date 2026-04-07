module.exports = {
  apps: [
    {
      name: "moodverse",
      script: "node_modules/next/dist/bin/next",
      args: "start -H 0.0.0.0 -p 3000",
      cwd: ".",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "600M",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
        MV_DATA_DIR: process.env.MV_DATA_DIR || "./data",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: "3000",
        MV_DATA_DIR: process.env.MV_DATA_DIR || "./data",
      },
    },
  ],
};
