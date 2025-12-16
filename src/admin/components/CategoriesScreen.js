import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, IconButton, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Stack, Switch, FormControlLabel, Alert, CircularProgress, Tooltip,
  Card, CardContent, Grid, alpha
} from '@mui/material';
import {
  Add, Edit, Delete, Visibility, VisibilityOff, DragIndicator,
  Settings, Category as CategoryIcon, Refresh
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import { useNavigate } from 'react-router-dom';

const BRAND_COLORS = {
  gold: '#FFD700',
  blue: '#1E3A8A',
  lightBlue: '#3B82F6'
};

const CategoriesScreen = ({ t }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    color: BRAND_COLORS.blue,
    is_active: true,
    restricted: false
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await adminService.getCategories();
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        icon: category.icon || '',
        color: category.color || BRAND_COLORS.blue,
        is_active: category.is_active ?? true,
        restricted: category.restricted ?? false
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        icon: '',
        color: BRAND_COLORS.blue,
        is_active: true,
        restricted: false
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
  };

  const handleSave = async () => {
    try {
      // Auto-generate slug from name if not provided
      const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-');
      const dataToSave = { ...formData, slug };

      if (editingCategory) {
        await adminService.updateCategory(editingCategory.id, dataToSave);
        toast.success('Category updated successfully!');
      } else {
        await adminService.createCategory(dataToSave);
        toast.success('Category created successfully!');
      }

      handleCloseDialog();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category? This will also delete its template and all associated data.')) {
      try {
        await adminService.deleteCategory(id);
        toast.success('Category deleted successfully!');
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error(`Failed to delete category: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleToggleActive = async (category) => {
    try {
      await adminService.updateCategory(category.id, {
        is_active: !category.is_active
      });
      toast.success(`Category ${!category.is_active ? 'activated' : 'deactivated'}`);
      fetchCategories();
    } catch (error) {
      console.error('Error toggling category:', error);
      toast.error('Failed to update category');
    }
  };

  const handleEditTemplate = (category) => {
    navigate(`/admin-panel/post-template/${category.id}`, {
      state: { category }
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress sx={{ color: BRAND_COLORS.gold }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Categories Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage categories and their post templates
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            startIcon={<Refresh />}
            onClick={fetchCategories}
            variant="outlined"
          >
            Refresh
          </Button>
          <Button
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            variant="contained"
            sx={{ bgcolor: BRAND_COLORS.blue }}
          >
            Add Category
          </Button>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: `linear-gradient(135deg, ${alpha(BRAND_COLORS.blue, 0.1)} 0%, ${alpha(BRAND_COLORS.gold, 0.1)} 100%)` }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color={BRAND_COLORS.blue}>
                {categories.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Categories
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: `linear-gradient(135deg, ${alpha(BRAND_COLORS.gold, 0.1)} 0%, ${alpha(BRAND_COLORS.blue, 0.1)} 100%)` }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color={BRAND_COLORS.gold}>
                {categories.filter(c => c.is_active).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Categories
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Categories Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: alpha(BRAND_COLORS.blue, 0.05) }}>
            <TableRow>
              <TableCell><strong>Category</strong></TableCell>
              <TableCell><strong>Slug</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell align="center"><strong>Access</strong></TableCell>
              <TableCell align="center"><strong>Status</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <CategoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No categories yet
                  </Typography>
                  <Button
                    startIcon={<Add />}
                    onClick={() => handleOpenDialog()}
                    sx={{ mt: 2 }}
                  >
                    Add First Category
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow
                  key={category.id}
                  component={motion.tr}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  sx={{
                    '&:hover': {
                      bgcolor: alpha(BRAND_COLORS.gold, 0.05),
                      cursor: 'pointer'
                    }
                  }}
                  onClick={() => handleEditTemplate(category)}
                >
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          bgcolor: alpha(category.color || BRAND_COLORS.blue, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: category.color || BRAND_COLORS.blue
                        }}
                      >
                        {category.icon || <CategoryIcon />}
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {category.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Order: {category.display_order || 0}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={category.slug}
                      size="small"
                      sx={{ bgcolor: alpha(BRAND_COLORS.blue, 0.1) }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                      {category.description || 'No description'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={category.restricted ? 'Restricted' : 'Public'}
                      size="small"
                      color={category.restricted ? 'secondary' : 'primary'}
                      variant={category.restricted ? 'filled' : 'outlined'}
                      sx={{ minWidth: 80 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={category.is_active ? 'Active' : 'Inactive'}
                      size="small"
                      color={category.is_active ? 'success' : 'default'}
                      icon={category.is_active ? <Visibility /> : <VisibilityOff />}
                    />
                  </TableCell>
                  <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="Edit Template">
                        <IconButton
                          size="small"
                          onClick={() => handleEditTemplate(category)}
                          sx={{ color: BRAND_COLORS.blue }}
                        >
                          <Settings />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Category">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(category)}
                          sx={{ color: BRAND_COLORS.gold }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={category.is_active ? 'Deactivate' : 'Activate'}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleActive(category)}
                        >
                          {category.is_active ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(category.id)}
                          sx={{ color: 'error.main' }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: `linear-gradient(135deg, ${BRAND_COLORS.blue} 0%, ${BRAND_COLORS.lightBlue} 100%)`, color: 'white' }}>
          {editingCategory ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              label="Category Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              helperText="URL-friendly name (auto-generated if empty)"
              placeholder={formData.name.toLowerCase().replace(/\s+/g, '-')}
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Icon"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              helperText="Material-UI icon name (e.g., Home, DirectionsCar)"
            />
            <TextField
              fullWidth
              label="Color"
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.restricted}
                  onChange={(e) => setFormData({ ...formData, restricted: e.target.checked })}
                  color="secondary"
                />
              }
              label="Restricted (Verified Companies Only)"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
              }
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{ bgcolor: BRAND_COLORS.blue }}
            disabled={!formData.name}
          >
            {editingCategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoriesScreen;
