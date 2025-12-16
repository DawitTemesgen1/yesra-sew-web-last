# YesraSew Web 🌍

A modern, multilingual listing platform for Jobs, Tenders, Homes, and Cars in Ethiopia. Built with React, Material UI, and Supabase.

## ✨ Features

- **Multilingual Support**: English, Amharic, Oromo, and Tigrinya.
- **Dynamic Listings**: Browsing for Jobs, Tenders, Real Estate, and Vehicles.
- **Premium Memberships**: Tiered access for premium content using Chapa & ArifPay integration.
- **Admin Dashboard**: Comprehensive management for users, listings, payments, and site content.
- **Modern UI**: Responsive design with Dark/Light mode support.

## 🛠️ Tech Stack

- **Frontend**: React.js, Material UI (MUI), Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **State Management**: React Context API, React Query
- **Payments**: Chapa, ArifPay

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/DawitTemesgen1/yesra-sew-web-last.git
    cd yesra-sew-web-last
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure Environment Variables:
    Create a `.env` file in the root directory and add your Supabase keys:
    ```env
    REACT_APP_SUPABASE_URL=your_supabase_url
    REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  Start the development server:
    ```bash
    npm start
    ```

## 📦 Building for Production

To create a production build:
```bash
npm run build
```

## 🔒 Security Note

Ensure all API keys are secured and Row Level Security (RLS) is enabled in your Supabase instance.

## 📄 License

[MIT](LICENSE)
