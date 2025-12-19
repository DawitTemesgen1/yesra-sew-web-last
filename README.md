# YesraSew Web 🌍

A modern, multilingual marketplace platform connecting job seekers, home buyers, car enthusiasts, and businesses across Ethiopia. Built with React, Material UI, and Supabase.

## ✨ Key Features

### 🌐 Multilingual Support
- **4 Languages**: Full support for English, Amharic (አማርኛ), Oromo (Afaan Oromoo), and Tigrinya (ትግርኛ)
- **RTL Support**: Proper text rendering for all Ethiopian languages
- **Dynamic Translation**: Seamless language switching across all pages

### 🏠 Multi-Category Marketplace
- **Jobs**: Browse and post job opportunities across various industries
- **Tenders**: Government and private sector procurement opportunities
- **Real Estate**: Houses, apartments, and commercial properties
- **Vehicles**: Cars, motorcycles, and commercial vehicles

### 🎨 Modern User Experience
- **Bento Grid Hero Design**: Clean, light-themed homepage with dynamic image grid
- **Dark/Light Mode**: Automatic theme switching based on user preference
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Skeleton Loaders**: Professional loading states for better UX
- **Framer Motion Animations**: Smooth transitions and micro-interactions

### 💎 Premium Features
- **Tiered Memberships**: Free, Basic, Premium, and Enterprise plans
- **Featured Listings**: Boost visibility with premium placement
- **Advanced Search**: Smart search with category-specific filters
- **Payment Integration**: Chapa and ArifPay for secure transactions

### 🛠️ Admin Dashboard
- **User Management**: Verify users, manage roles and permissions
- **Listing Moderation**: Approve, reject, or feature listings
- **Template Builder**: Dynamic form templates for each category
- **Analytics**: Track platform performance and user engagement
- **Payment Tracking**: Monitor subscriptions and transactions

### 🔒 Security & Performance
- **Supabase RLS**: Row-level security for data protection
- **React Query Caching**: Optimized data fetching with 5-minute stale time
- **Image Optimization**: Lazy loading and optimized image delivery
- **SEO Optimized**: Meta tags, sitemaps, and structured data

## 🛠️ Tech Stack

### Frontend
- **React.js** (v18+) - UI framework
- **Material UI (MUI)** - Component library
- **Framer Motion** - Animation library
- **React Router** - Client-side routing
- **React Query** - Server state management

### Backend & Services
- **Supabase** - PostgreSQL database, authentication, and edge functions
- **Supabase Storage** - File and image hosting
- **Chapa** - Ethiopian payment gateway
- **ArifPay** - Alternative payment processor

### State Management
- **React Context API** - Global state (Auth, Language, Theme)
- **React Query** - Server state and caching

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/DawitTemesgen1/yesra-sew-web-last.git
   cd yesra-sew-web-last
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_SUPABASE_URL=your_supabase_project_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```
   The app will open at `http://localhost:3000`

## 📦 Building for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npx serve -s build
```

## 🗂️ Project Structure

```
yesra-sew-web-last/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   ├── contexts/        # React Context providers
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   ├── services/       # API and service layers
│   ├── theme/          # MUI theme configuration
│   └── translations/   # Language files
├── yesrasew_app/       # Flutter mobile app wrapper
└── README.md
```

## 🎯 Recent Updates

### Homepage Redesign (Dec 2024)
- ✅ New Bento Grid hero section with dynamic image composition
- ✅ Light/Dark mode adaptive backgrounds
- ✅ Mobile-first responsive design
- ✅ Integrated translations across all hero elements
- ✅ Trust indicators and social proof elements

### Performance Optimizations
- ✅ React Query caching (5-minute stale time for listings)
- ✅ Skeleton loaders on all listing pages
- ✅ Lazy loading for images and components
- ✅ Optimized Unsplash image URLs with quality parameters

### Mobile App
- ✅ Flutter WebView wrapper for native mobile experience
- ✅ Deep linking support for WhatsApp, Phone, Email
- ✅ Offline mode handling
- ✅ Native splash screen

## 🔐 Security Best Practices

1. **Environment Variables**: Never commit `.env` files to version control
2. **Supabase RLS**: Ensure Row Level Security policies are enabled
3. **API Keys**: Use environment variables for all sensitive keys
4. **HTTPS**: Always use SSL in production
5. **Input Validation**: Sanitize user inputs on both client and server

## 🌍 Deployment

### Recommended Platforms
- **Vercel** (Recommended for React apps)
- **Netlify**
- **AWS Amplify**
- **Firebase Hosting**

### Deployment Steps
1. Build the production bundle: `npm run build`
2. Set environment variables on your hosting platform
3. Configure custom domain and SSL
4. Enable automatic deployments from GitHub

## 📱 Mobile App (Flutter)

The `yesrasew_app` directory contains a Flutter WebView wrapper for native mobile experience:

```bash
cd yesrasew_app
flutter pub get
flutter run
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Material UI for the component library
- Supabase for the backend infrastructure
- Unsplash for high-quality images
- The Ethiopian developer community

## 📞 Support

For support, email support@yesrasew.com or join our community channels.

---

**Built with ❤️ for Ethiopia** 🇪🇹
