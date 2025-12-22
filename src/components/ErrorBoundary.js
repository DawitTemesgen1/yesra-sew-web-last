import React from 'react';
import { Box, Typography, Button } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            p: 3,
            textAlign: 'center'
          }}
        >
          <Typography variant="h4" color="error" gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            An error occurred while loading this page. Please try refreshing the page.
          </Typography>
          {process.env.NODE_ENV === 'development' && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1, textAlign: 'left' }}>
              <Typography variant="h6" gutterBottom>
                Error Details (Development Mode):
              </Typography>
              <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem' }}>
                {this.state.error && this.state.error.toString()}
              </Typography>
            </Box>
          )}
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            sx={{ mr: 2 }}
          >
            Refresh Page
          </Button>
          <Button
            variant="outlined"
            onClick={() => this.setState({ hasError: false })}
          >
            Try Again
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

