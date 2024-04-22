const semver = require("semver");
const { engines, version } = require("./package");

const nodeExpectedVersion = engines.node;

const requiredEnv = [
    'REPLICATE_API_TOKEN', // List all required environment variables here
];

// Only load dotenv if not in production
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: '.env.local' });
}

const missingEnv = requiredEnv.filter(key => !process.env[key]);

if (missingEnv.length) {
    console.error('ENV CHECK: Error: Missing required environment variables:', missingEnv.join(', '));
    process.exit(1); // Exit with a failure code
} else {
    console.log('ENV CHECK: All required environment variables are set.');
}

if (!semver.satisfies(process.version, nodeExpectedVersion)) {
    throw new Error(`NODE VERSION CHECK: The current node version ${process.version} does not satisfy the required version ${nodeExpectedVersion}.`);
}