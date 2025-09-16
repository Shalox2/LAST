# WeShop - Multi-Seller Marketplace

A complete multi-seller marketplace built with Django REST Framework (backend) and React (frontend), without Tailwind CSS.

## Features

### User Roles
- **Buyers**: Browse shops/products, place orders
- **Sellers**: Create shops, add products (after verification), manage orders
- **Admins**: Verify shops, manage all orders

### Core Functionality
- JWT Authentication (access/refresh tokens)
- Shop creation and verification system
- Product management with stock tracking
- Order placement and management
- Role-based permissions
- Responsive design with custom CSS

## Project Structure

```
BOOTING/
├── backend (Django)
│   ├── weshop/          # Main project settings
│   ├── users/           # User authentication & management
│   ├── shops/           # Shop creation & verification
│   ├── products/        # Product management
│   ├── orders/          # Order processing
│   └── manage.py
└── frontend/            # React application
    ├── src/
    │   ├── components/  # Reusable components
    │   ├── contexts/    # Auth context
    │   ├── pages/       # Page components
    │   └── index.css    # Custom CSS (no Tailwind)
    └── package.json
```

## API Endpoints

### Authentication
- `POST /api/register/` - User registration
- `POST /api/login/` - User login
- `POST /api/token/refresh/` - Refresh JWT token

### Shops
- `GET /api/shops/` - List all shops
- `POST /api/shops/` - Create shop (sellers only)
- `GET /api/shops/:id/` - Shop details
- `POST /api/shops/join-payment/` - Pay join fee (placeholder)
- `POST /api/shops/:id/verify/` - Verify shop (admin only)

### Products
- `GET /api/products/` - List products (supports ?shop=<id>)
- `POST /api/products/` - Create product (verified sellers only)
- `GET /api/products/:id/` - Product details

### Orders
- `GET /api/orders/` - List orders (filtered by role)
- `POST /api/orders/` - Create order (buyers only)
- `GET /api/orders/:id/` - Order details

## Setup Instructions

### Backend (Django)

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

3. Create superuser (optional):
```bash
python manage.py createsuperuser
```

4. Start development server:
```bash
python manage.py runserver
```

Backend will run at `http://127.0.0.1:8000`

### Frontend (React)

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm start
```

Frontend will run at `http://localhost:3000`

## User Flow

### For Sellers:
1. Register with role "seller"
2. Create a shop
3. Pay join fee (placeholder endpoint)
4. Wait for admin verification
5. Add products to verified shop
6. Manage incoming orders

### For Buyers:
1. Register with role "buyer"
2. Browse shops and products
3. Place orders
4. Track order status

### For Admins:
1. Access Django admin panel
2. Verify shops after join fee payment
3. Monitor all orders and users

## Key Features

### Authentication
- JWT-based authentication with automatic token refresh
- Role-based access control
- Protected routes in React

### Shop Management
- Shop creation with verification workflow
- Join fee payment system (placeholder)
- Admin verification required before selling

### Product Management
- Product creation only for verified shops
- Stock quantity tracking
- Automatic stock updates on orders

### Order System
- Order placement with stock validation
- Role-based order filtering
- Order status tracking

### UI/UX
- Responsive design with custom CSS
- Clean, modern interface
- No external CSS frameworks (no Tailwind)
- BEM-style CSS organization

## Development Notes

- Uses SQLite for development (easily switchable to PostgreSQL)
- CORS configured for React development server
- Proxy setup in package.json for API calls
- Error handling and loading states throughout
- Form validation on both frontend and backend

## Deployment

### Backend
- Configure production database in settings.py
- Set DEBUG=False and configure ALLOWED_HOSTS
- Collect static files: `python manage.py collectstatic`
- Use gunicorn or similar WSGI server

### Frontend
- Build production bundle: `npm run build`
- Serve static files or deploy to CDN
- Update API base URL for production

## Security Considerations

- JWT tokens stored in localStorage (consider httpOnly cookies for production)
- CORS properly configured
- Input validation on all forms
- Role-based permissions enforced
- SQL injection protection via Django ORM
