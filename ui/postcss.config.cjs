const purgecss = require('@fullhuman/postcss-purgecss')({
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  safelist: [
    /^page__backdrop/,
    /^skeleton-/,
    /^form-status--/,
    /^detail__state/,
    /^details__panel--/,
  ],
})

module.exports = {
  plugins: [
    require('autoprefixer'),
    ...(process.env.NODE_ENV === 'production' ? [purgecss] : []),
  ],
}
