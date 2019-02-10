module.exports = {
  apps: [{
    name: 'piano-web',
    script: 'npm',
    args: 'start'
  }],
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'ec2-52-73-254-0.compute-1.amazonaws.com',
      key: '~/.ssh/piano_key_pair.pem',
      ref: 'origin/master',
      repo: 'git@github.com:djiaak/piano-web.git',
      path: '/home/ubuntu/piano-web',
      'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js'
    }
  }
}