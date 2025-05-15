# Snorkle Dashboard

A Next.js dashboard for monitoring and interacting with Snorkle oracles and events.

## Prerequisites

- Node.js 18.x or later
- Yarn package manager
- Docker and Docker Compose (for production deployment)

## Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_ALEO_RPC_URL=https://api.explorer.aleo.org/v1
NEXT_PUBLIC_ALEO_NETWORK=mainnet
```

## Development Setup

1. Install dependencies:
```bash
yarn install
```

2. Start the development server:
```bash
yarn dev
```

The application will be available at `http://localhost:3000`

## Building for Production

1. Create a production build:
```bash
yarn build
```

2. Start the production server:
```bash
yarn start
```

## Docker Deployment

1. Build the Docker image:
```bash
docker build -t snorkle-dashboard .
```

2. Run with Docker Compose:
```bash
docker-compose up -d
```

The application will be available at `http://localhost:3000`

## Project Structure

```
snorkle-dashboard/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── components/      # React components
│   │   └── page.tsx        # Main page
│   └── lib/                # Utility functions and types
├── public/                 # Static assets
├── next.config.mjs        # Next.js configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── package.json           # Project dependencies
```

## Features

- View and monitor Snorkle oracles
- Check attestation verification
- View event data
- Real-time updates
- Responsive design

## Dependencies

### Core Dependencies
- Next.js 14.1.0
- React 18.2.0
- Material-UI (@mui/material)
- Provable SDK (@provablehq/sdk)

### Development Dependencies
- TypeScript
- ESLint
- Tailwind CSS
- PostCSS

## Troubleshooting

### Common Issues

1. **Build Errors**
   - Clear the `.next` directory: `rm -rf .next`
   - Reinstall dependencies: `yarn install`
   - Rebuild: `yarn build`

2. **Runtime Errors**
   - Check browser console for detailed error messages
   - Verify environment variables are set correctly
   - Ensure all dependencies are installed

3. **Docker Issues**
   - Ensure Docker daemon is running
   - Check port 3000 is not in use
   - Verify Docker Compose configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details
