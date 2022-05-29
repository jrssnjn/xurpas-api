module.exports = [
   {
      script: './build/app.js',
      name: 'api',
      exec_mode: 'cluster',
      instances: 'max',
   },
]
