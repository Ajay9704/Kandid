/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['better-sqlite3'],
  // Remove the outputFileTracingIncludes as it's not needed for in-memory database
  // Exclude the database file from being processed by webpack
  webpack: (config) => {
    config.externals.push({
      'better-sqlite3': 'commonjs better-sqlite3'
    })
    return config
  }
}

module.exports = nextConfig