# Snorkle Dashboard

A modern dashboard for viewing and managing Aleo program mappings. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- View all mappings in Aleo programs
- Paginated data display
- Real-time data updates
- Dark mode support
- Responsive design

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Aleo CLI (for local development)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd snorkle-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with the following variables:
```
NEXT_PUBLIC_ALEO_NETWORK=testnet
NEXT_PUBLIC_ALEO_RPC_URL=https://api.explorer.aleo.org/v1
```

4. Start the development server:
```bash
npm run dev
```

## Development

### Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── components/        # React components
│   ├── page.tsx          # Main dashboard page
│   └── layout.tsx        # Root layout
├── lib/                   # Utility functions
│   ├── aleo.ts           # Aleo SDK integration
│   ├── config.ts         # Configuration
│   └── types.ts          # TypeScript types
└── tests/                # Test files
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run lint` - Run linter

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
