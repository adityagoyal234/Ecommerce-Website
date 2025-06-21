# E-Commerce Website

A full-featured e-commerce platform built with Node.js, Express, MongoDB, and EJS.

## Features

### User Features
- User authentication (signup, login, logout)
- Role-based access control (Admin/Customer)
- User profile management
- Shopping cart functionality
- Order history and tracking

### Product Features
- Advanced product search with real-time suggestions
- Price range filtering
- Multiple sorting options (price, name)
- Pagination (4 products per page)
- Product categories
- Detailed product views

### Admin Features
- Product management (add, edit, delete)
- Order management
- User management
- Sales analytics

## Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Template Engine**: EJS
- **Authentication**: Session-based
- **Styling**: CSS3

## Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/adityagoyal234/Ecommerce-Website.git
cd Ecommerce-Website
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `env.example` to `.env`
   - Update the values in `.env`:
```bash
cp env.example .env
```

Required environment variables:
```
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
PORT=3000 (optional, defaults to 3000)
NODE_ENV=development (or production)
```

4. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

The application will be available at `http://localhost:3000`

## Deployment

### Local Development
```bash
npm run dev
```

### Production Deployment

1. Set environment variables for production:
```bash
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
SESSION_SECRET=your_production_session_secret
PORT=your_port_number
```

2. Install dependencies:
```bash
npm install --production
```

3. Start the application:
```bash
npm start
```

### Platform-Specific Deployment

#### Heroku
1. Create a Heroku app
2. Set environment variables in Heroku dashboard
3. Deploy using Git:
```bash
git push heroku main
```

#### Railway
1. Connect your GitHub repository
2. Set environment variables in Railway dashboard
3. Deploy automatically

#### Vercel
1. Import your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically

## Project Structure
```
├── controllers/     # Route controllers
├── models/         # Database models
├── routes/         # Route definitions
├── views/          # EJS templates
├── public/         # Static files
├── middleware/     # Custom middleware
├── env.example     # Environment variables template
└── index.js        # Application entry point
```

## API Endpoints

### Search API
- `GET /api/search-suggestions?q=<query>`
  - Returns product suggestions based on search query
  - Minimum 2 characters required
  - Includes product title and price

## Features in Detail

### Search and Filtering
- Real-time search suggestions
- Price range filtering
- Multiple sorting options:
  - Price: Low to High
  - Price: High to Low
  - Name: A to Z
  - Name: Z to A

### Pagination
- 4 products per page
- Previous/Next navigation
- Page number indicators
- Maintains filters across pages

### User Authentication
- Secure session-based authentication
- Role-based access control
- Protected routes
- User profile management

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env file
   - Verify network connectivity

2. **Port Already in Use**
   - Change PORT in .env file
   - Kill existing processes on the port

3. **Session Issues in Production**
   - Ensure SESSION_SECRET is set
   - Check cookie settings for HTTPS

4. **Static Files Not Loading**
   - Verify public folder path
   - Check file permissions

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License.

## Contact
Aditya Goyal - [GitHub](https://github.com/adityagoyal234) 