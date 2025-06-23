module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run preview',
      url: ['http://localhost:4173'],
      numberOfRuns: 3,
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 1500 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.01 }],
        'first-input-delay': ['error', { maxNumericValue: 100 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
} 