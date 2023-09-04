module.exports = {
    apps: [
      {
        name: "Waterbus-Restful",
        script: "dist/main.js",
        instances: "max", // can set is "max" for using max of processors
        autorestart: true,
        watch: false,
        max_memory_restart: "2G",
        exec_mode: "cluster",
        env: {
          NODE_ENV: "production",
        },
        error_file: "logs/error.log",
        out_file: "logs/out.log",
        log_date_format: "YYYY-MM-DD HH:mm:ss",
      },
    ],
  };
  