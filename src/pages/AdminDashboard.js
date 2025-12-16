// import React, { useState, useEffect } from 'react';
// import { Container, Grid, Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
// import apiService from '../services/api';

// const AdminDashboard = () => {
//   const [loading, setLoading] = useState(false);
//   const [stats, setStats] = useState({ totalListings: 0, totalUsers: 0 });

//   useEffect(() => {
//     // Basic fetch to prove connection
//     const loadData = async () => {
//       try {
//         const data = await apiService.admin.getDashboardStats();
//         setStats(data || { totalListings: 0, totalUsers: 0 });
//       } catch (e) { console.error(e); }
//       setLoading(false);
//     };
//     loadData();
//   }, []);

//   if (loading) return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;

//   return (
//     <Container maxWidth="lg" sx={{ mt: 4 }}>
//       <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
//       <Grid container spacing={3}>
//         <Grid item xs={12} md={4}>
//           <Card><CardContent><Typography>Users: {stats?.totalUsers || 0}</Typography></CardContent></Card>
//         </Grid>
//       </Grid>
//     </Container>
//   );
// };

// export default AdminDashboard;