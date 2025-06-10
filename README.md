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
Create a `.env` file in the root directory with:
```
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
```

4. Start the server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure
```
├── controllers/     # Route controllers
├── models/         # Database models
├── routes/         # Route definitions
├── views/          # EJS templates
├── public/         # Static files
├── middleware/     # Custom middleware
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