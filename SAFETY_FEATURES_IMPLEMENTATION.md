# Safety Features Implementation Guide

## 🛡️ Report & Block Functionality

This guide explains how to implement the new safety features in your Yesra Sew app.

---

## ✅ What's Been Added:

### 1. Database Tables
- `reports` - Stores user reports for listings and users
- `blocked_users` - Stores blocked user relationships

### 2. API Methods (in `src/services/api.js`)
- `reportListing(listingId, reason, description)` - Report a listing
- `reportUser(userId, reason, description)` - Report a user
- `blockUser(userId, reason)` - Block a user
- `unblockUser(userId)` - Unblock a user
- `getBlockedUsers()` - Get list of blocked users
- `isUserBlocked(userId)` - Check if user is blocked
- `getMyReports()` - Get user's submitted reports

### 3. React Components
- `ReportDialog.js` - Dialog for reporting listings/users
- `BlockUserDialog.js` - Dialog for blocking users

---

## 📋 Step 1: Run Database Migration

1. **Open Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard
   - Select your project

2. **Run the SQL Script:**
   - Click "SQL Editor" in sidebar
   - Click "New query"
   - Copy the entire content from `database/safety_features.sql`
   - Paste and click "Run"

3. **Verify Tables Created:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('reports', 'blocked_users');
   ```

---

## 📋 Step 2: Add Report Button to Listing Detail Page

Update `src/pages/ListingDetailPage.js`:

### Import the components:
```javascript
import ReportDialog from '../components/ReportDialog';
import BlockUserDialog from '../components/BlockUserDialog';
```

### Add state for dialogs:
```javascript
const [reportDialogOpen, setReportDialogOpen] = useState(false);
const [blockDialogOpen, setBlockDialogOpen] = useState(false);
```

### Add Report & Block buttons to the header (around line 460):
```javascript
<IconButton onClick={() => setReportDialogOpen(true)}>
  <Flag />
</IconButton>
<IconButton onClick={() => setBlockDialogOpen(true)}>
  <Block />
</IconButton>
```

### Add the dialogs before the closing tag:
```javascript
{/* Report Dialog */}
<ReportDialog
  open={reportDialogOpen}
  onClose={() => setReportDialogOpen(false)}
  type="listing"
  targetId={id}
  targetName={listing?.title}
/>

{/* Block User Dialog */}
<BlockUserDialog
  open={blockDialogOpen}
  onClose={() => setBlockDialogOpen(false)}
  userId={listing?.author_id || listing?.user_id}
  userName={sellerName}
  onBlocked={() => {
    // Optionally navigate away or refresh
    toast.success('User blocked successfully');
  }}
/>
```

---

## 📋 Step 3: Add Report Button to Chat Page

Update `src/pages/ChatPage.js`:

### Import:
```javascript
import ReportDialog from '../components/ReportDialog';
import BlockUserDialog from '../components/BlockUserDialog';
import { Flag, Block } from '@mui/icons-material';
```

### Add state:
```javascript
const [reportDialogOpen, setReportDialogOpen] = useState(false);
const [blockDialogOpen, setBlockDialogOpen] = useState(false);
```

### Add buttons to chat header (in the AppBar):
```javascript
<IconButton 
  onClick={() => setReportDialogOpen(true)}
  sx={{ color: 'white' }}
>
  <Flag />
</IconButton>
<IconButton 
  onClick={() => setBlockDialogOpen(true)}
  sx={{ color: 'white' }}
>
  <Block />
</IconButton>
```

### Add dialogs:
```javascript
<ReportDialog
  open={reportDialogOpen}
  onClose={() => setReportDialogOpen(false)}
  type="user"
  targetId={selectedConversation?.other_user_id}
  targetName={selectedConversation?.other_user_name}
/>

<BlockUserDialog
  open={blockDialogOpen}
  onClose={() => setBlockDialogOpen(false)}
  userId={selectedConversation?.other_user_id}
  userName={selectedConversation?.other_user_name}
  onBlocked={() => {
    setSelectedConversation(null);
    toast.success('User blocked. Conversation removed.');
  }}
/>
```

---

## 📋 Step 4: Add Blocked Users Management to Profile

Create a new component `src/components/BlockedUsersList.js`:

```javascript
import React, { useEffect, useState } from 'react';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import { Block as BlockIcon } from '@mui/icons-material';
import apiService from '../services/api';
import toast from 'react-hot-toast';

const BlockedUsersList = () => {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlockedUsers();
  }, []);

  const loadBlockedUsers = async () => {
    try {
      const data = await apiService.getBlockedUsers();
      setBlockedUsers(data);
    } catch (error) {
      console.error('Error loading blocked users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (userId, userName) => {
    try {
      await apiService.unblockUser(userId);
      toast.success(`${userName} has been unblocked`);
      loadBlockedUsers(); // Refresh list
    } catch (error) {
      toast.error('Failed to unblock user');
    }
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>;
  }

  if (blockedUsers.length === 0) {
    return (
      <Box p={3} textAlign="center">
        <Typography color="text.secondary">No blocked users</Typography>
      </Box>
    );
  }

  return (
    <List>
      {blockedUsers.map((block) => (
        <ListItem
          key={block.id}
          secondaryAction={
            <IconButton
              edge="end"
              onClick={() => handleUnblock(block.blocked_id, block.blocked?.full_name)}
              color="primary"
            >
              <BlockIcon />
            </IconButton>
          }
        >
          <ListItemAvatar>
            <Avatar src={block.blocked?.avatar_url}>
              {block.blocked?.full_name?.[0]}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={block.blocked?.full_name || block.blocked?.email}
            secondary={`Blocked on ${new Date(block.created_at).toLocaleDateString()}`}
          />
        </ListItem>
      ))}
    </List>
  );
};

export default BlockedUsersList;
```

Then add it to your Profile page in a new tab or section.

---

## 📋 Step 5: Add Admin Moderation Panel

Create `src/pages/admin/ReportsManagement.js`:

```javascript
import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Typography,
  Box
} from '@mui/material';
import adminService from '../../services/adminService';

const ReportsManagement = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      // You'll need to add this method to adminService
      const data = await adminService.getReports();
      setReports(data);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'reviewed': return 'info';
      case 'resolved': return 'success';
      case 'dismissed': return 'default';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Reports Management</Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Reporter</TableCell>
              <TableCell>Target</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>
                  <Chip label={report.report_type} size="small" />
                </TableCell>
                <TableCell>{report.reason}</TableCell>
                <TableCell>{report.reporter_id}</TableCell>
                <TableCell>
                  {report.reported_listing_id || report.reported_user_id}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={report.status} 
                    color={getStatusColor(report.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(report.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button size="small">Review</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ReportsManagement;
```

---

## 📋 Step 6: Add Admin Service Methods

Update `src/services/adminService.js` to add:

```javascript
async getReports(status = null) {
  try {
    let query = supabase
      .from('reports')
      .select(`
        *,
        reporter:reporter_id (id, email, full_name),
        reported_user:reported_user_id (id, email, full_name),
        reported_listing:reported_listing_id (id, title)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting reports:', error);
    throw error;
  }
}

async updateReportStatus(reportId, status, adminNotes = '') {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('reports')
      .update({
        status,
        admin_notes: adminNotes,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', reportId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating report:', error);
    throw error;
  }
}
```

---

## 🎯 Testing Checklist:

### Test Report Functionality:
- [ ] Can report a listing
- [ ] Can report a user
- [ ] Report appears in database
- [ ] Toast notification shows success
- [ ] Dialog closes after submission

### Test Block Functionality:
- [ ] Can block a user
- [ ] Blocked user appears in blocked list
- [ ] Can unblock a user
- [ ] Cannot block same user twice
- [ ] Toast notifications work

### Test Admin Panel:
- [ ] Admin can view all reports
- [ ] Admin can update report status
- [ ] Statistics show correctly

---

## 🚀 Deployment Steps:

1. **Run database migration** in Supabase
2. **Commit and push** all code changes
3. **Test on staging** environment
4. **Deploy to production**
5. **Update Play Store listing** to answer "Yes" for report/block features

---

## 📝 Update Play Store Answers:

After implementing, you can now answer:

**Does the app include the ability to report users or user-generated content?**
✅ **Yes**

**Does the app include the ability to block users or user-generated content?**
✅ **Yes**

---

## 🎉 Benefits:

- ✅ Improved Google Play approval chances
- ✅ Safer platform for users
- ✅ Better content moderation
- ✅ Compliance with marketplace best practices
- ✅ Professional app appearance

---

**Need help with implementation? Check the individual component files or ask for assistance!**
