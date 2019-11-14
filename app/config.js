export default {
  ...process.env.CLIENT_CONFIG,
  herokuUrl: 'https://dashboard.heroku.com',
  githubUrl: process.env.SELFIES_APP_REPO_URL,
  keys: {
    prev: 'alt+left',
    next: 'alt+right',
    clear: 'alt+c',
    reset: 'alt+r',
    autoToggle: 'alt+a'
  },
  auto: {
    interval: 5 * 1000
  },
  characters: {
    max: 5,
    hideAfter: 60 * 1000
  }
}
