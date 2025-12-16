import React from 'react';
import { AuthProvider } from './AuthContext';
import { FallbackAuthProvider } from './FallbackAuthContext';

const SafeAuthProvider = ({ children }) => {
  return (
    <React.Suspense fallback={<FallbackAuthProvider>{children}</FallbackAuthProvider>}>
      <ErrorBoundary fallback={<FallbackAuthProvider>{children}</FallbackAuthProvider>}>
        <AuthProvider>{children}</AuthProvider>
      </ErrorBoundary>
    </React.Suspense>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('AuthProvider Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export default SafeAuthProvider;
