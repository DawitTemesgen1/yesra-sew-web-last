import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, TextField, Select,
  MenuItem, Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, Avatar, IconButton, Tabs, Tab, Grid, Switch, FormControlLabel
} from '@mui/material';
import {
  AdminPanelSettings, Security, Business, Group, Assignment,
  VerifiedUser, Email, Settings, Person, Add, Edit, Delete,
  Visibility, Search, Refresh
} from '@mui/icons-material';

const AdminManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [adminUsers, setAdminUsers] = useState([
    { id: 1, name: 'Super Admin', email: 'admin@yesrasew.com', role: 'SuperAdmin', status: 'active', lastLogin: '2024-01-15' },
    { id: 2, name: 'John Moderator', email: 'john@yesrasew.com', role: 'Moderator', status: 'active', lastLogin: '2024-01-14' },
    { id: 3, name: 'Jane Admin', email: 'jane@yesrasew.com', role: 'Admin', status: 'inactive', lastLogin: '2024-01-10' }
  ]);

  const [auditLogs] = useState([
    { id: 1, user: 'Super Admin', action: 'Created new user', timestamp: '2024-01-15 10:30', ip: '192.168.1.1' },
    { id: 2, user: 'John Moderator', action: 'Approved listing', timestamp: '2024-01-15 09:45', ip: '192.168.1.2' },
    { id: 3, user: 'Jane Admin', action: 'Updated settings', timestamp: '2024-01-14 16:20', ip: '192.168.1.3' }
  ]);

  const [permissions] = useState({
    SuperAdmin: ['All permissions'],
    Moderator: ['Approve listings', 'Manage users', 'View reports'],
    Admin: ['Basic management', 'View analytics']
  });

  const getRoleColor = (role) => {
    const colors = {
      SuperAdmin: 'error',
      Admin: 'primary',
      Moderator: 'success'
    };
    return colors[role] || 'default';
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Admin Management</Typography>
      
      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab icon={<Security />} label="Admin Users" />
        <Tab icon={<Assignment />} label="Roles & Permissions" />
        <Tab icon={<Visibility />} label="Audit Log" />
      </Tabs>

      {activeTab === 0 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Admin Users</Typography>
              <Button variant="contained" startIcon={<Add />}>Add Admin</Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Login</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {adminUsers.map(admin => (
                    <TableRow key={admin.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2 }}><Person /></Avatar>
                          <Box>
                            <Typography>{admin.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{admin.email}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={admin.role} color={getRoleColor(admin.role)} />
                      </TableCell>
                      <TableCell>
                        <Chip label={admin.status} color={admin.status === 'active' ? 'success' : 'default'} />
                      </TableCell>
                      <TableCell>{admin.lastLogin}</TableCell>
                      <TableCell>
                        <IconButton size="small"><Edit /></IconButton>
                        <IconButton size="small" color="error"><Delete /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Roles & Permissions</Typography>
            {Object.entries(permissions).map(([role, perms]) => (
              <Card key={role} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" color={getRoleColor(role) + '.main'}>
                    {role}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {perms.map(perm => (
                      <Chip key={perm} label={perm} size="small" sx={{ mr: 1, mb: 1 }} />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Audit Log</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>IP Address</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auditLogs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell>{log.user}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.timestamp}</TableCell>
                      <TableCell><code>{log.ip}</code></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AdminManagement;
