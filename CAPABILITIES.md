# Upstart - Capabilities Overview

## What is Upstart?

Upstart is a comprehensive **Student Marketplace Platform** designed to facilitate buying, selling, and trading among university students. It provides a secure, feature-rich environment where students can list products, manage transactions, communicate with buyers/sellers, and build their reputation within the student community.

---

## Core Capabilities

### 1. **User Authentication & Authorization**

#### Registration & Login
- User signup with email verification
- Secure login with JWT token authentication
- Role-based access control (Customer/Vendor)
- University affiliation selection from Nigerian universities database
- Profile customization with bio and profile picture

#### User Roles
- **Customer**: Can browse, purchase, and review products
- **Vendor**: Can list products, manage inventory, view analytics, and sell to other students

---

### 2. **Product Marketplace**

#### Product Browsing
- Browse all products on the marketplace
- Category-based filtering (Electronics, Books, Furniture, Clothing, Sports)
- Detailed product pages with image galleries
- Product search and discovery
- View product details including:
  - Multiple product images with gallery thumbnails
  - Price, quantity available, and location
  - Product description and category
  - Seller information
  - Customer reviews and ratings
  - View counts and like statistics

#### Product Engagement
- Like/favorite products
- View count tracking
- Share products with others
- Customer reviews and comments
- Star ratings for products

#### Product Details Modal
- Full-screen modal with comprehensive product information
- Image gallery with thumbnail navigation
- Seller profile quick access
- Add to cart functionality
- Contact vendor directly
- Social sharing options

---

### 3. **Vendor Capabilities**

#### Inventory Management (`inventory.html`)
- Add new products with:
  - Multiple image uploads (drag & drop support)
  - Product name, description, and price
  - Category selection
  - Quantity management
  - Location information
- Edit existing products
- Delete products from inventory
- View all personal listings
- Real-time product status updates

#### Analytics Dashboard (`analytics.html`)
- **Sales Metrics**:
  - Total sales quantity
  - Total revenue generated
  - Active products count
- **Performance Metrics**:
  - Total product views
  - Average product rating
  - Rating distribution (star visualization)
- **Top Products**:
  - Best-selling products
  - Most viewed products
  - Performance insights

#### Vendor Profile
- Public vendor profile page
- Display vendor information and ratings
- Showcase all vendor's products
- Vendor contact options
- Reputation and review system

---

### 4. **Shopping Experience**

#### Shopping Cart (`cart.html`)
- Add products to cart
- View cart items with product details
- Adjust quantities
- Remove items from cart
- Cart summary with:
  - Subtotal calculation
  - Item count
  - Tax and total calculations
- Checkout process
- Cart persistence across sessions

#### Cart Badge
- Real-time cart item counter in navigation
- Visual indicator of cart status

---

### 5. **Digital Wallet**

#### Wallet Management (`wallet.html`)
- View wallet balance (displayed in Nigerian Naira - ₦)
- Add money to wallet via Paystack integration
- Transaction history with:
  - Transaction type (credit/debit)
  - Amount
  - Timestamp
  - Status
  - Reference numbers

#### Payment Processing
- **Paystack Integration**:
  - Secure payment gateway
  - Payment verification modal with three states:
    - Loading state during verification
    - Success state with transaction details
    - Failure state with retry option
  - Automatic payment verification on return
  - Session-based payment tracking
  - Retry mechanism for failed payments

#### Payment Flow
1. User enters amount to add
2. Redirected to Paystack for payment
3. Returns to wallet page after payment
4. Automatic verification with backend
5. Success/failure modal displays result
6. Wallet balance updates automatically

---

### 6. **Real-Time Messaging**

#### Chat System (`chat.html`)
- **WebSocket-based real-time messaging**
- Direct messaging between buyers and sellers
- Conversation list with:
  - Contact names and avatars
  - Last message preview
  - Unread message indicators
  - Timestamp of last activity
- Message features:
  - Send and receive messages instantly
  - Message delivery status
  - Read receipts
  - Message timestamps
- Chat interface:
  - Clean, modern chat UI
  - Message bubbles (sent vs received)
  - Auto-scroll to latest messages
  - Typing area with send button

#### Contact Vendor
- Direct "Contact Vendor" button on product pages
- Initiates conversation from product context
- Seamless transition to chat interface

---

### 7. **Leaderboard & Community**

#### Leaderboards (`leaderboard.html`)
- **Top Vendors**: Ranked by sales and ratings
- **Top Customers**: Ranked by purchase activity
- **Top Products**: Most popular and best-selling items
- Community engagement and gamification
- Reputation building system
- Public recognition for active community members

---

### 8. **User Profile Management**

#### Personal Profile (`profile.html`)
- View and edit personal information:
  - Username
  - Email address
  - Phone number
  - University affiliation
  - Bio/description
  - Profile picture
- Edit mode toggle
- Profile picture upload
- Save profile changes
- View account role (Customer/Vendor)

#### Vendor Profile Pages (`vendor-profile.html`)
- Public-facing vendor profiles
- View vendor's product catalog
- Vendor rating and reviews
- Contact vendor option
- Vendor statistics and achievements

---

### 9. **Navigation & UI**

#### Shared Navigation (`shared-nav.js`)
- **Responsive navbar** with:
  - Logo and branding
  - Search functionality
  - Navigation links (Home, Leaderboard, Analytics for vendors)
  - Wallet balance display
  - Shopping cart with badge
  - Notifications with badge
  - User profile dropdown
- **Mobile-optimized**:
  - Hamburger menu
  - Mobile menu dropdown
  - Touch-friendly interface
- **Context-aware**:
  - Vendor-only sections (Analytics, Inventory)
  - Customer-specific features
  - Dynamic content based on user role

#### Notifications
- Real-time notification system
- Notification badge counter
- Notification dropdown
- Empty state handling

---

### 10. **AI Assistant**

#### Chat Bubble Widget
- Always-available AI assistant
- Floating chat button (💬)
- Expandable chat widget
- "Upstart Assistant" for user support
- Help with navigation and questions
- Conversational interface

---

### 11. **Design & User Experience**

#### Visual Design
- Modern, clean interface
- Responsive layouts for all screen sizes
- Consistent color scheme with CSS variables
- Professional typography
- Icon usage throughout

#### Loading States
- Skeleton loaders for products
- Loading modals for async operations
- Smooth transitions and animations
- Progressive content loading

#### Animations & Transitions
- Smooth page transitions
- Hover effects on interactive elements
- Modal animations (slide up, scale in, shake)
- Loading spinners
- Toast notifications with slide-in animations

#### Toast Notifications
- Success, error, and info messages
- Auto-dismiss with configurable timeout
- Manual close option
- Accessible with ARIA attributes
- Positioned top-right corner

---

### 12. **Technical Features**

#### State Management
- LocalStorage for user data and authentication
- SessionStorage for payment tracking
- Cart persistence
- User session management

#### API Integration
- RESTful API endpoints
- JWT token authentication
- Supabase storage for images
- University data from external API
- Backend URL configured per environment

#### WebSocket Features
- Real-time chat messaging
- Live conversation updates
- Connection status monitoring
- Automatic reconnection handling

#### Security
- Secure authentication flow
- Protected routes (login required)
- Role-based access control
- Session expiration handling
- Secure payment processing via Paystack

#### Image Handling
- Multiple image uploads
- Drag and drop support
- Image preview before upload
- Gallery with thumbnails
- Image storage via Supabase

---

## Page Structure

### Public Pages
1. **`index.html`** - Main marketplace/product listing page
2. **`login.html`** - User login page
3. **`signup.html`** - New user registration
4. **`leaderboard.html`** - Community leaderboards

### Authenticated User Pages
5. **`profile.html`** - User profile management
6. **`cart.html`** - Shopping cart
7. **`wallet.html`** - Digital wallet management
8. **`chat.html`** - Messaging interface
9. **`vendor-profile.html`** - Public vendor profile view

### Vendor-Only Pages
10. **`inventory.html`** - Product inventory management
11. **`analytics.html`** - Sales and performance analytics

### Test Pages
- `test_data.html` - Data testing
- `test_direct_modal.html` - Modal testing
- `test_mobile_menu.html` - Mobile menu testing
- `test_modal.html` - Modal functionality testing
- `test_modal2.html` - Additional modal testing

---

## Key Technologies

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla JS)
- **Backend**: Python (Django/FastAPI)
- **Backend API**: RESTful endpoints (configurable via environment)
- **Real-time**: WebSockets for chat
- **Storage**: Supabase for images
- **Payments**: Paystack integration
- **Authentication**: JWT tokens

---

## User Journeys

### Buying Flow
1. Browse products on homepage
2. Filter by category
3. Click product to view details
4. Add to cart or contact vendor
5. View cart and adjust quantities
6. Checkout (requires wallet balance)
7. Payment processing
8. Order confirmation

### Selling Flow
1. Register as vendor
2. Access inventory management
3. Add product with images and details
4. Product appears in marketplace
5. Receive messages from interested buyers
6. View analytics on sales performance
7. Manage inventory and pricing
8. Track earnings and views

### Communication Flow
1. Buyer finds product of interest
2. Click "Contact Vendor"
3. Real-time chat opens
4. Exchange messages
5. Negotiate and arrange transaction
6. Complete purchase through platform

---

## Additional Features

### Accessibility
- ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly
- Focus management in modals

### Mobile Optimization
- Responsive design for all screen sizes
- Touch-friendly controls
- Mobile-specific navigation
- Optimized layouts for small screens

### Error Handling
- User-friendly error messages
- Network error recovery
- Session expiration handling
- Validation feedback
- Retry mechanisms

---

## Summary

Upstart is a **full-featured student marketplace platform** that enables students to:
- **Buy and sell** products within their university community
- **Communicate directly** with buyers/sellers via real-time chat
- **Manage finances** through an integrated digital wallet
- **Track performance** with analytics and leaderboards
- **Build reputation** through ratings and reviews
- **Engage with community** through gamification and social features

The platform combines e-commerce, social networking, and financial services into a cohesive ecosystem designed specifically for the student marketplace use case.
