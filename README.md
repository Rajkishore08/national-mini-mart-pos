# 🛒 National Mini Mart POS System

A modern, full-featured Point of Sale (POS) system built with Next.js 15, TypeScript, and Supabase. Perfect for small to medium retail businesses.

## ✨ Features

### 🏪 **Core POS Features**
- **Real-time Sales Processing**: Complete transaction management with multiple payment methods
- **Inventory Management**: Stock tracking, low stock alerts, and automatic updates
- **Customer Management**: Customer database with loyalty points and purchase history
- **Receipt Generation**: Professional receipt printing and preview
- **Multi-role Access**: Admin, Manager, and Cashier roles with different permissions

### 📊 **Dashboard & Analytics**
- **Real-time Statistics**: Live dashboard with sales, revenue, and customer metrics
- **Sales Overview**: Comprehensive transaction history with detailed views
- **Product Analytics**: Track product performance and stock levels
- **Customer Insights**: Customer behavior and loyalty tracking

### 🔧 **Technical Features**
- **Modern UI**: Built with Shadcn/ui components and Tailwind CSS
- **Real-time Updates**: Supabase real-time subscriptions for live data
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Type Safety**: Full TypeScript implementation
- **Authentication**: Secure user authentication and role-based access

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/national-mini-mart-pos.git
   cd national-mini-mart-pos
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

4. **Set up the database**
   - Create a new Supabase project
   - Run the SQL scripts in the `scripts/` folder in order:
     - `01-database-setup.sql`
     - `02-create-demo-users.sql`
     - `03-setup-demo-data.sql`
     - `04-sync-user-profiles.sql`
     - `05-add-customers-loyalty-fixed.sql`
     - `06-add-low-stock-function.sql`

5. **Start the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
final-plan4/
├── app/                    # Next.js 15 App Router
│   ├── dashboard/         # Dashboard page
│   ├── pos/              # Point of Sale interface
│   ├── sales/            # Sales overview and transactions
│   ├── inventory/        # Inventory management
│   ├── products/         # Product management
│   ├── customers/        # Customer management
│   └── settings/         # Application settings
├── components/           # Reusable UI components
│   ├── ui/              # Shadcn/ui components
│   ├── dashboard/       # Dashboard-specific components
│   ├── pos/            # POS-specific components
│   └── sales/          # Sales-specific components
├── contexts/            # React contexts
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── scripts/            # Database setup scripts
└── public/             # Static assets
```

## 🛠️ Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **State Management**: React Context + Hooks
- **Notifications**: Sonner (Toast notifications)

## 🔐 Authentication & Roles

### Demo Users
The system comes with pre-configured demo users:

- **Admin**: `admin@demo.com` / `password123`
- **Manager**: `manager@demo.com` / `password123`
- **Cashier**: `cashier@demo.com` / `password123`

### Role Permissions
- **Admin**: Full access to all features including transaction editing/deletion
- **Manager**: Access to most features, limited admin functions
- **Cashier**: Basic POS operations and customer management

## 📊 Database Schema

### Core Tables
- **profiles**: User profiles and roles
- **products**: Product catalog with pricing and stock
- **customers**: Customer database with loyalty tracking
- **transactions**: Sales transactions with payment details
- **transaction_items**: Individual items in transactions
- **categories**: Product categories
- **settings**: Application configuration

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework
- [Next.js](https://nextjs.org/) for the React framework

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/yourusername/national-mini-mart-pos/issues) page
2. Create a new issue with detailed information
3. Include your environment details and error messages

---

**Built with ❤️ for modern retail businesses** 