import React from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, IconButton
} from '@mui/material';
import {
  Payments, AccessTime, TrendingUp, People, Visibility, CheckCircle, Cancel
} from '@mui/icons-material';

const StatCard = ({ title, value, icon, color }) => (
  <Card>
    <CardContent sx={{ textAlign: 'center', py: 3 }}>
      <Box sx={{ color, mb: 1 }}>{icon}</Box>
      <Typography variant="h4" fontWeight="bold" color={color}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
    </CardContent>
  </Card>
);

const FinancialScreen = ({ t, stats }) => {
  const transactions = [
    { id: 'TRX001', user: 'John Doe', type: 'Listing Fee', amount: 'ETB 500', status: 'completed', date: '2024-01-15' },
    { id: 'TRX002', user: 'Jane Smith', type: 'Premium Subscription', amount: 'ETB 2,500', status: 'completed', date: '2024-01-15' },
    { id: 'TRX003', user: 'Mike Johnson', type: 'Featured Listing', amount: 'ETB 1,000', status: 'pending', date: '2024-01-14' },
    { id: 'TRX004', user: 'Sarah Williams', type: 'Commission', amount: 'ETB 250', status: 'completed', date: '2024-01-14' },
    { id: 'TRX005', user: 'David Brown', type: 'Refund', amount: 'ETB -500', status: 'processed', date: '2024-01-13' },
    { id: 'TRX006', user: 'Lisa Anderson', type: 'Listing Fee', amount: 'ETB 750', status: 'failed', date: '2024-01-13' }
  ];

  const payouts = [
    { user: 'Alice Cooper', amount: 'ETB 5,000', requested: '2 days ago' },
    { user: 'Bob Martin', amount: 'ETB 3,500', requested: '3 days ago' },
    { user: 'Carol White', amount: 'ETB 7,200', requested: '5 days ago' }
  ];

  const revenueByCategory = [
    { category: 'Cars', transactions: 89, revenue: 'ETB 445,000', growth: '+12.5%' },
    { category: 'Jobs', transactions: 156, revenue: 'ETB 312,000', growth: '+8.3%' },
    { category: 'Homes', transactions: 67, revenue: 'ETB 502,500', growth: '+15.7%' },
    { category: 'Tender', transactions: 23, revenue: 'ETB 345,000', growth: '+22.1%' },
    { category: 'Home', transactions: 45, revenue: 'ETB 112,500', growth: '+5.2%' }
  ];

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Revenue Overview */}
        <Grid item xs={12} md={3}>
          <StatCard 
            title="totalRevenue" 
            value={`ETB ${stats.revenue.toLocaleString()}`} 
            icon={<Payments />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard 
            title="pendingPayouts" 
            value="ETB 45,000" 
            icon={<AccessTime />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard 
            title="commissionEarned" 
            value="ETB 12,500" 
            icon={<TrendingUp />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard 
            title="activeSubscriptions" 
            value="234" 
            icon={<People />}
            color="#9c27b0"
          />
        </Grid>

        {/* Revenue Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('revenueOverview')}
              </Typography>
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100', borderRadius: 1 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <TrendingUp sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                  <Typography variant="h4" color="success.main" gutterBottom>
                    ETB 2,456,789
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('totalRevenue')} - {t('last30Days')}
                  </Typography>
                  <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                    ↑ 23.5% {t('fromLastMonth')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('financialStats')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">{t('avgTransaction')}</Typography>
                  <Typography variant="h6" color="primary.main">ETB 2,345</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">{t('commissionRate')}</Typography>
                  <Typography variant="h6" color="success.main">5.2%</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">{t('refundRate')}</Typography>
                  <Typography variant="h6" color="error.main">1.8%</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">{t('successRate')}</Typography>
                  <Typography variant="h6" color="info.main">98.2%</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Transactions Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('recentTransactions')}
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('transactionId')}</TableCell>
                      <TableCell>{t('user')}</TableCell>
                      <TableCell>{t('type')}</TableCell>
                      <TableCell>{t('amount')}</TableCell>
                      <TableCell>{t('status')}</TableCell>
                      <TableCell>{t('date')}</TableCell>
                      <TableCell>{t('actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((transaction, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {transaction.id}
                          </Typography>
                        </TableCell>
                        <TableCell>{transaction.user}</TableCell>
                        <TableCell>
                          <Chip size="small" label={transaction.type} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color={transaction.amount.startsWith('-') ? 'error.main' : 'success.main'} fontWeight="medium">
                            {transaction.amount}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            size="small" 
                            label={transaction.status} 
                            color={
                              transaction.status === 'completed' ? 'success' : 
                              transaction.status === 'pending' ? 'warning' : 
                              transaction.status === 'processed' ? 'info' : 'error'
                            }
                          />
                        </TableCell>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton size="small">
                              <Visibility />
                            </IconButton>
                            {transaction.status === 'pending' && (
                              <IconButton size="small" color="success">
                                <CheckCircle />
                              </IconButton>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Payout Management */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('pendingPayouts')}
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('user')}</TableCell>
                      <TableCell>{t('amount')}</TableCell>
                      <TableCell>{t('requested')}</TableCell>
                      <TableCell>{t('actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payouts.map((payout, i) => (
                      <TableRow key={i}>
                        <TableCell>{payout.user}</TableCell>
                        <TableCell>
                          <Typography variant="body2" color="success.main" fontWeight="medium">
                            {payout.amount}
                          </Typography>
                        </TableCell>
                        <TableCell>{payout.requested}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton size="small" color="success">
                              <CheckCircle />
                            </IconButton>
                            <IconButton size="small" color="error">
                              <Cancel />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue by Category */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('revenueByCategory')}
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('category')}</TableCell>
                      <TableCell>{t('transactions')}</TableCell>
                      <TableCell>{t('revenue')}</TableCell>
                      <TableCell>{t('growth')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {revenueByCategory.map((cat, i) => (
                      <TableRow key={i}>
                        <TableCell>{cat.category}</TableCell>
                        <TableCell>{cat.transactions}</TableCell>
                        <TableCell>
                          <Typography variant="body2" color="success.main" fontWeight="medium">
                            {cat.revenue}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="success.main">
                            {cat.growth}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FinancialScreen;

