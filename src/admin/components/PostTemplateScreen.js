import React, { useState, useEffect } from 'react';
// v2.1 - Fixed null safety checks for steps and fields
import { useParams } from 'react-router-dom';
import {
    Box, Typography, Button, Card, CardContent, TextField, Dialog, DialogTitle,
    DialogContent, DialogActions, IconButton, Stack, Grid, Paper, Chip, Alert,
    Select, MenuItem, FormControl, InputLabel, Checkbox, FormControlLabel, Divider, alpha
} from '@mui/material';
import {
    Add, Delete, Edit, DragIndicator, Visibility, VisibilityOff,
    Save, Publish, ArrowBack
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import { StrictModeDroppable } from './StrictModeDroppable';
import { ThemeProvider } from '@mui/material/styles';
import adminTheme from '../theme/adminTheme';

// Brand Colors
const BRAND_COLORS = {
    blue: '#1976d2',
    lightBlue: '#e3f2fd',
    gold: '#ffd700',
    gradient: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)'
};

// Available Field Types
const FIELD_TYPES = [
    { value: 'text', label: 'Text' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'number', label: 'Number' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'url', label: 'URL' },
    { value: 'date', label: 'Date' },
    { value: 'time', label: 'Time' },
    { value: 'datetime', label: 'Date & Time' },
    { value: 'select', label: 'Dropdown' },
    { value: 'multiselect', label: 'Multi-Select' },
    { value: 'radio', label: 'Radio Buttons' },
    { value: 'checkbox', label: 'Checkboxes' },
    { value: 'file', label: 'File Upload' },
    { value: 'image', label: 'Image Upload' },
    { value: 'location', label: 'Location Picker' },
    { value: 'price', label: 'Price' },
    { value: 'currency', label: 'Currency' },
    { value: 'boolean', label: 'Yes/No Toggle' }
];

const PostTemplateScreen = () => {
    const { categoryId } = useParams();
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(categoryId || '');
    const [template, setTemplate] = useState(null);
    const [steps, setSteps] = useState([]);
    const [viewMode, setViewMode] = useState('form'); // 'form', 'detail', 'card'

    // Dialog States
    const [stepDialogOpen, setStepDialogOpen] = useState(false);
    const [fieldDialogOpen, setFieldDialogOpen] = useState(false);
    const [editingStep, setEditingStep] = useState(null);
    const [editingField, setEditingField] = useState(null);
    const [currentStepId, setCurrentStepId] = useState(null);

    // Form States
    const [stepForm, setStepForm] = useState({ title: '', description: '', icon: '', is_required: true });
    const [fieldForm, setFieldForm] = useState({
        field_name: '', field_label: '', field_type: 'text', placeholder: '', help_text: '',
        is_required: false, is_visible: true, width: 'full', section: 'main',
        options: [], allow_multiple: false,
        display_in_card: false, display_in_detail: true, card_priority: 0, is_cover_image: false
    });

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            loadTemplate();
        }
    }, [selectedCategory]);

    const loadCategories = async () => {
        try {
            const data = await adminService.getCategories();
            setCategories(data);
        } catch (error) {
            toast.error('Failed to load categories');
        }
    };

    const loadTemplate = async () => {
        setLoading(true);
        try {
            const data = await adminService.getTemplate(selectedCategory);
            if (data) {
                setTemplate(data.template);
                setSteps(data.steps || []);
            } else {
                setTemplate(null);
                setSteps([]);
            }
        } catch (error) {
            console.error('Error loading template:', error);
            setTemplate(null);
            setSteps([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTemplate = async () => {
        try {
            const newTemplate = await adminService.createTemplate({
                category_id: selectedCategory,
                name: `Template for ${categories.find(c => c.id === parseInt(selectedCategory))?.name}`,
                description: 'Auto-generated template',
                is_active: false
            });
            setTemplate(newTemplate);
            toast.success('Template created!');
        } catch (error) {
            toast.error('Failed to create template');
        }
    };

    const handlePublishTemplate = async () => {
        try {
            await adminService.updateTemplate(template.id, { is_active: true });
            toast.success('Template published!');
            loadTemplate();
        } catch (error) {
            toast.error('Failed to publish template');
        }
    };

    // Step Handlers
    const handleAddStep = () => {
        setEditingStep(null);
        setStepForm({ title: '', description: '', icon: '', is_required: true });
        setStepDialogOpen(true);
    };

    const handleEditStep = (step) => {
        setEditingStep(step);
        setStepForm({
            title: step.title,
            description: step.description || '',
            icon: step.icon || '',
            is_required: step.is_required
        });
        setStepDialogOpen(true);
    };

    const handleSaveStep = async () => {
        try {
            if (editingStep) {
                await adminService.updateStep(editingStep.id, stepForm);
                toast.success('Step updated!');
            } else {
                await adminService.createStep({
                    ...stepForm,
                    template_id: template.id,
                    step_number: steps.length + 1
                });
                toast.success('Step added!');
            }
            setStepDialogOpen(false);
            loadTemplate();
        } catch (error) {
            toast.error('Failed to save step');
        }
    };

    const handleDeleteStep = async (stepId) => {
        if (!window.confirm('Delete this step?')) return;
        try {
            await adminService.deleteStep(stepId);
            toast.success('Step deleted!');
            loadTemplate();
        } catch (error) {
            toast.error('Failed to delete step');
        }
    };

    // Field Handlers
    const handleAddField = (stepId) => {
        setCurrentStepId(stepId);
        setEditingField(null);
        setFieldForm({
            field_name: '', field_label: '', field_type: 'text', placeholder: '', help_text: '',
            is_required: false, is_visible: true, width: 'full', section: 'main',
            options: [], allow_multiple: false
        });
        setFieldDialogOpen(true);
    };

    const handleEditField = (field, stepId) => {
        setCurrentStepId(stepId);
        setEditingField(field);
        setFieldForm({
            field_name: field.field_name,
            field_label: field.field_label,
            field_type: field.field_type,
            placeholder: field.placeholder || '',
            help_text: field.help_text || '',
            is_required: field.is_required,
            is_visible: field.is_visible,
            width: field.width || 'full',
            section: field.section || 'main',
            options: field.options || [],
            allow_multiple: field.allow_multiple || false,
            display_in_card: field.display_in_card || false,
            display_in_detail: field.display_in_detail !== false, // Default true
            card_priority: field.card_priority || 0,
            is_cover_image: field.is_cover_image || false
        });
        setFieldDialogOpen(true);
    };

    const handleSaveField = async () => {
        try {
            const fieldData = {
                ...fieldForm,
                field_name: fieldForm.field_name || fieldForm.field_label.toLowerCase().replace(/\s+/g, '_'),
                step_id: currentStepId,
                width: fieldForm.width || 'full', // DB expects text: 'full', 'half', 'third', 'quarter'
                display_order: editingField ? editingField.display_order : (steps.find(s => s.id === currentStepId)?.fields.length || 0) + 1
            };

            if (editingField) {
                await adminService.updateField(editingField.id, fieldData);
                toast.success('Field updated!');
            } else {
                await adminService.createField(fieldData);
                toast.success('Field added!');
            }
            setFieldDialogOpen(false);
            loadTemplate();
        } catch (error) {
            console.error('Save field error:', error);
            toast.error('Failed to save field');
        }
    };

    const handleDeleteField = async (fieldId) => {
        if (!window.confirm('Delete this field?')) return;
        try {
            await adminService.deleteField(fieldId);
            toast.success('Field deleted!');
            loadTemplate();
        } catch (error) {
            toast.error('Failed to delete field');
        }
    };

    // Drag & Drop Handlers
    const handleDragEnd = async (result) => {
        if (!result.destination) return;

        const { source, destination, type } = result;

        if (type === 'step') {
            // Reorder steps
            const newSteps = Array.from(steps);
            const [removed] = newSteps.splice(source.index, 1);
            newSteps.splice(destination.index, 0, removed);

            setSteps(newSteps);

            // Update step numbers
            try {
                await Promise.all(
                    newSteps.map((step, index) =>
                        adminService.updateStep(step.id, { step_number: index + 1 })
                    )
                );
                toast.success('Steps reordered!');
            } catch (error) {
                console.error('Step reorder error:', error);
                toast.error('Failed to reorder steps');
                // Reload to get correct state from database
                loadTemplate();
            }
        } else if (type === 'field') {
            // Handle field reordering based on view mode
            if (viewMode === 'form') {
                const sourceStepIdStr = source.droppableId.replace('step-', '');
                const destStepIdStr = destination.droppableId.replace('step-', '');

                if (sourceStepIdStr === destStepIdStr) {
                    // Reorder within the same step
                    const step = steps.find(s => String(s.id) === sourceStepIdStr);
                    if (!step || !step.fields) return;

                    const newFields = Array.from(step.fields);
                    const [removed] = newFields.splice(source.index, 1);
                    newFields.splice(destination.index, 0, removed);

                    const newSteps = steps.map(s =>
                        String(s.id) === sourceStepIdStr ? { ...s, fields: newFields } : s
                    );
                    setSteps(newSteps);

                    try {
                        await Promise.all(
                            newFields.map((field, index) =>
                                adminService.updateField(field.id, { display_order: index + 1 })
                            )
                        );
                        toast.success('Fields reordered!');
                    } catch (error) {
                        toast.error('Failed to update order');
                        loadTemplate();
                    }
                } else {
                    // Move field to a different step
                    const sourceStep = steps.find(s => String(s.id) === sourceStepIdStr);
                    const destStep = steps.find(s => String(s.id) === destStepIdStr);

                    if (!sourceStep || !destStep) return;

                    const sourceFields = Array.from(sourceStep.fields);
                    const destFields = Array.from(destStep.fields);
                    const [movingField] = sourceFields.splice(source.index, 1);

                    destFields.splice(destination.index, 0, movingField);

                    const newSteps = steps.map(s => {
                        if (String(s.id) === sourceStepIdStr) return { ...s, fields: sourceFields };
                        if (String(s.id) === destStepIdStr) return { ...s, fields: destFields };
                        return s;
                    });
                    setSteps(newSteps);

                    try {
                        // Update the moving field's step_id first
                        await adminService.updateField(movingField.id, {
                            step_id: destStep.id,
                            display_order: destination.index + 1
                        });

                        // Normalize order in both steps
                        await Promise.all([
                            ...sourceFields.map((f, i) => adminService.updateField(f.id, { display_order: i + 1 })),
                            ...destFields.map((f, i) => adminService.updateField(f.id, { display_order: i + 1 }))
                        ]);
                        toast.success('Field moved to new step!');
                    } catch (error) {
                        console.error('Move error:', error);
                        toast.error('Failed to move field');
                        loadTemplate();
                    }
                }
            } else if (viewMode === 'detail') {
                // Detail Layout Builder: move between sections
                const newSection = destination.droppableId;
                const draggableId = result.draggableId;
                const allFields = (steps || []).flatMap(s => s.fields || []);
                const movingField = allFields.find(f => String(f.id) === draggableId);

                if (movingField) {
                    const destSectionFields = allFields
                        .filter(f => (f.section || 'main') === newSection && f.id !== movingField.id)
                        .sort((a, b) => (a.view_order || 0) - (b.view_order || 0));

                    destSectionFields.splice(destination.index, 0, { ...movingField, section: newSection });

                    const updates = {};
                    destSectionFields.forEach((field, index) => {
                        updates[field.id] = { section: newSection, view_order: index };
                    });

                    const newSteps = steps.map(step => ({
                        ...step,
                        fields: step.fields.map(f => updates[f.id] ? { ...f, ...updates[f.id] } : f)
                    }));
                    setSteps(newSteps);

                    try {
                        await Promise.all(
                            Object.entries(updates).filter(([id]) => id && id !== 'undefined' && id !== 'NaN').map(([id, data]) =>
                                adminService.updateField(id, data)
                            )
                        );
                        toast.success('Layout updated!');
                    } catch (error) {
                        console.error('Layout update error:', error);
                        toast.error('Failed to update layout');
                        loadTemplate();
                    }
                }
            } else if (viewMode === 'card') {
                // Card Builder: move between card sections
                const newCardSection = destination.droppableId;
                const draggableId = result.draggableId;
                const allFields = (steps || []).flatMap(s => s.fields || []);
                const movingField = allFields.find(f => String(f.id) === draggableId);

                if (movingField) {
                    const isVisible = newCardSection !== 'hidden';
                    const targetSection = isVisible ? newCardSection : (movingField.card_section || 'body');

                    const destSectionFields = allFields
                        .filter(f => {
                            if (!isVisible) return !f.is_card_visible;
                            return f.is_card_visible && (f.card_section || 'body') === targetSection && f.id !== movingField.id;
                        })
                        .sort((a, b) => (a.card_order || 0) - (b.card_order || 0));

                    destSectionFields.splice(destination.index, 0, {
                        ...movingField,
                        is_card_visible: isVisible,
                        card_section: targetSection
                    });

                    const updates = {};
                    destSectionFields.forEach((field, index) => {
                        updates[field.id] = {
                            card_order: index,
                            is_card_visible: isVisible,
                            card_section: isVisible ? targetSection : field.card_section
                        };
                    });

                    const newSteps = steps.map(step => ({
                        ...step,
                        fields: step.fields.map(f => updates[f.id] ? { ...f, ...updates[f.id] } : f)
                    }));
                    setSteps(newSteps);

                    try {
                        await Promise.all(
                            Object.entries(updates).filter(([id]) => id && id !== 'undefined' && id !== 'NaN').map(([id, data]) =>
                                adminService.updateField(id, data)
                            )
                        );
                        toast.success('Card layout updated!');
                    } catch (error) {
                        console.error('Card layout error:', error);
                        toast.error('Failed to update card layout');
                        loadTemplate();
                    }
                }
            }
        }
    };

    if (loading) return <Box p={3}><Typography>Loading...</Typography></Box>;

    return (
        <ThemeProvider theme={adminTheme}>
            <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto', bgcolor: 'background.default', minHeight: '100vh', color: 'text.primary' }}>
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Post Template Builder
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={3}>
                        Create dynamic forms, detail layouts, and card designs for listings
                    </Typography>

                    {/* Category Selector */}
                    <FormControl sx={{ minWidth: 300, mb: 3 }}>
                        <InputLabel>Select Category</InputLabel>
                        <Select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            label="Select Category"
                        >
                            {categories.map(cat => (
                                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {selectedCategory && !template && (
                        <Button variant="contained" onClick={handleCreateTemplate} startIcon={<Add />}>
                            Create Template
                        </Button>
                    )}

                    {template && (
                        <Box>
                            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                                <Chip
                                    label={template.is_active ? 'Published' : 'Draft'}
                                    color={template.is_active ? 'success' : 'default'}
                                />
                                {!template.is_active && (
                                    <Button
                                        variant="contained"
                                        color="success"
                                        startIcon={<Publish />}
                                        onClick={handlePublishTemplate}
                                    >
                                        Publish Template
                                    </Button>
                                )}
                            </Stack>

                            {/* View Mode Switcher */}
                            <Stack direction="row" spacing={1} sx={{ bgcolor: 'grey.100', p: 0.5, borderRadius: 2, display: 'inline-flex' }}>
                                <Button
                                    variant={viewMode === 'form' ? 'contained' : 'text'}
                                    onClick={() => setViewMode('form')}
                                >
                                    Form Builder
                                </Button>
                                <Button
                                    variant={viewMode === 'detail' ? 'contained' : 'text'}
                                    onClick={() => setViewMode('detail')}
                                >
                                    Detail Layout
                                </Button>
                                <Button
                                    variant={viewMode === 'card' ? 'contained' : 'text'}
                                    onClick={() => setViewMode('card')}
                                >
                                    Card Layout
                                </Button>
                            </Stack>
                        </Box>
                    )}
                </Box>

                {/* FORM BUILDER */}
                {viewMode === 'form' && template && (
                    <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h6">Form Steps & Fields</Typography>
                            <Button variant="contained" startIcon={<Add />} onClick={handleAddStep}>
                                Add Step
                            </Button>
                        </Stack>

                        <DragDropContext onDragEnd={handleDragEnd}>
                            <StrictModeDroppable droppableId="steps" type="step">
                                {(provided) => (
                                    <Stack spacing={2} ref={provided.innerRef} {...provided.droppableProps}>
                                        {(steps || []).filter(s => s && s.id).map((stepData, index) => (

                                            <Draggable key={stepData.id} draggableId={String(stepData.id)} index={index}>
                                                {(dragProvided) => (
                                                    <Card
                                                        ref={dragProvided.innerRef}
                                                        {...dragProvided.draggableProps}
                                                        elevation={2}
                                                    >
                                                        <CardContent>
                                                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                                                <Stack direction="row" spacing={2} alignItems="center">
                                                                    <Box {...dragProvided.dragHandleProps}>
                                                                        <DragIndicator color="action" />
                                                                    </Box>
                                                                    <Typography variant="h6">
                                                                        Step {index + 1}: {stepData.title}
                                                                    </Typography>
                                                                    {stepData.is_required && (
                                                                        <Chip label="Required" size="small" color="error" />
                                                                    )}
                                                                </Stack>
                                                                <Stack direction="row" spacing={1}>
                                                                    <IconButton size="small" onClick={() => handleEditStep(stepData)}>
                                                                        <Edit fontSize="small" />
                                                                    </IconButton>
                                                                    <IconButton size="small" onClick={() => handleDeleteStep(stepData.id)}>
                                                                        <Delete fontSize="small" />
                                                                    </IconButton>
                                                                    <Button
                                                                        size="small"
                                                                        startIcon={<Add />}
                                                                        onClick={() => handleAddField(stepData.id)}
                                                                    >
                                                                        Add Field
                                                                    </Button>
                                                                </Stack>
                                                            </Stack>

                                                            {/* Fields */}
                                                            <StrictModeDroppable droppableId={`step-${stepData.id}`} type="field">
                                                                {(fieldProvided) => (
                                                                    <Box
                                                                        ref={fieldProvided.innerRef}
                                                                        {...fieldProvided.droppableProps}
                                                                        sx={{ minHeight: 50, bgcolor: 'grey.50', p: 2, borderRadius: 1 }}
                                                                    >
                                                                        <Grid container spacing={2}>
                                                                            {(stepData.fields || []).filter(f => f && f.id).map((field, fieldIndex) => (
                                                                                <Draggable
                                                                                    key={field.id}
                                                                                    draggableId={String(field.id)}
                                                                                    index={fieldIndex}
                                                                                >
                                                                                    {(fieldDragProvided) => (
                                                                                        <Grid
                                                                                            item
                                                                                            xs={field.width === 'half' || field.width === 6 ? 6 : (field.width === 'third' || field.width === 4 ? 4 : (field.width === 'quarter' || field.width === 3 ? 3 : 12))}
                                                                                            ref={fieldDragProvided.innerRef}
                                                                                            {...fieldDragProvided.draggableProps}
                                                                                        >
                                                                                            <Paper sx={{ p: 1.5 }}>
                                                                                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                                                                        <Box {...fieldDragProvided.dragHandleProps}>
                                                                                                            <DragIndicator fontSize="small" color="action" />
                                                                                                        </Box>
                                                                                                        <Box>
                                                                                                            <Typography variant="body2" fontWeight="bold">
                                                                                                                {field.field_label}
                                                                                                                {field.is_required && <span style={{ color: 'red' }}> *</span>}
                                                                                                            </Typography>
                                                                                                            <Typography variant="caption" color="text.secondary">
                                                                                                                {field.field_type}
                                                                                                            </Typography>
                                                                                                        </Box>
                                                                                                    </Stack>
                                                                                                    <Stack direction="row" spacing={0.5}>
                                                                                                        <IconButton
                                                                                                            size="small"
                                                                                                            onClick={() => handleEditField(field, stepData.id)}
                                                                                                        >
                                                                                                            <Edit fontSize="small" />
                                                                                                        </IconButton>
                                                                                                        <IconButton
                                                                                                            size="small"
                                                                                                            onClick={() => handleDeleteField(field.id)}
                                                                                                        >
                                                                                                            <Delete fontSize="small" />
                                                                                                        </IconButton>
                                                                                                    </Stack>
                                                                                                </Stack>
                                                                                            </Paper>
                                                                                        </Grid>
                                                                                    )}
                                                                                </Draggable>
                                                                            ))}
                                                                        </Grid>
                                                                        {fieldProvided.placeholder}
                                                                        {stepData.fields.length === 0 && (
                                                                            <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                                                                                No fields yet. Click "Add Field" to get started.
                                                                            </Typography>
                                                                        )}
                                                                    </Box>
                                                                )}
                                                            </StrictModeDroppable>
                                                        </CardContent>
                                                    </Card>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </Stack>
                                )}
                            </StrictModeDroppable>
                        </DragDropContext>

                        {steps.length === 0 && (
                            <Alert severity="info">
                                No steps yet. Click "Add Step" to create your first form step.
                            </Alert>
                        )}
                    </Box>
                )}

                {/* DETAIL LAYOUT BUILDER */}
                {viewMode === 'detail' && template && (
                    <Box>
                        <Alert severity="info" sx={{ mb: 3 }}>
                            <strong>Detail Layout Builder:</strong> Drag fields to arrange them on the listing detail page.
                            Organize fields into Header, Main Content, or Sidebar sections.
                        </Alert>

                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Grid container spacing={3}>
                                {/* Header Section */}
                                <Grid item xs={12}>
                                    <Paper sx={{ p: 2, bgcolor: alpha(BRAND_COLORS.blue, 0.05) }}>
                                        <Typography variant="h6" gutterBottom>Header Section</Typography>
                                        <Droppable droppableId="header" type="field">
                                            {(provided, snapshot) => (
                                                <Box
                                                    ref={provided.innerRef}
                                                    {...provided.droppableProps}
                                                    sx={{
                                                        minHeight: 100,
                                                        border: '2px dashed #ccc',
                                                        borderRadius: 1,
                                                        p: 2,
                                                        bgcolor: snapshot.isDraggingOver ? alpha(BRAND_COLORS.gold, 0.1) : 'white'
                                                    }}
                                                >
                                                    <Grid container spacing={1}>
                                                        {(steps || []).flatMap(s => s.fields || [])
                                                            .filter(f => f && f.id && (f.section || 'main') === 'header')
                                                            .sort((a, b) => (a.view_order || 0) - (b.view_order || 0))
                                                            .map((field, index) => (
                                                                <Draggable key={field.id} draggableId={String(field.id)} index={index}>
                                                                    {(dragProvided) => (
                                                                        <Grid item xs={field.width === 'half' ? 6 : 12}>
                                                                            <Paper
                                                                                ref={dragProvided.innerRef}
                                                                                {...dragProvided.draggableProps}
                                                                                {...dragProvided.dragHandleProps}
                                                                                sx={{ p: 1.5, cursor: 'grab', position: 'relative' }}
                                                                            >
                                                                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                                                                    <Box>
                                                                                        <Typography variant="body2" fontWeight="bold">
                                                                                            {field.field_label}
                                                                                        </Typography>
                                                                                        <Typography variant="caption" color="text.secondary">
                                                                                            {field.field_type} - {field.width === 'half' ? '50%' : '100%'}
                                                                                        </Typography>
                                                                                    </Box>
                                                                                    <IconButton
                                                                                        size="small"
                                                                                        onClick={() => handleEditField(field, field.step_id)} // Use existing handleEditField
                                                                                        sx={{ mt: -0.5, mr: -0.5 }}
                                                                                    >
                                                                                        <Edit fontSize="small" />
                                                                                    </IconButton>
                                                                                </Stack>
                                                                            </Paper>
                                                                        </Grid>
                                                                    )}
                                                                </Draggable>
                                                            ))}
                                                    </Grid>
                                                    {provided.placeholder}
                                                </Box>
                                            )}
                                        </Droppable>
                                    </Paper>
                                </Grid>

                                {/* Main Content Section */}
                                <Grid item xs={12} md={8}>
                                    <Paper sx={{ p: 2 }}>
                                        <Typography variant="h6" gutterBottom>Main Content</Typography>
                                        <Droppable droppableId="main" type="field">
                                            {(provided, snapshot) => (
                                                <Box
                                                    ref={provided.innerRef}
                                                    {...provided.droppableProps}
                                                    sx={{
                                                        minHeight: 200,
                                                        border: '2px dashed #ccc',
                                                        borderRadius: 1,
                                                        p: 2,
                                                        bgcolor: snapshot.isDraggingOver ? alpha(BRAND_COLORS.gold, 0.1) : 'white'
                                                    }}
                                                >
                                                    <Grid container spacing={1}>
                                                        {(steps || []).flatMap(s => s.fields || [])
                                                            .filter(f => f && f.id && (f.section || 'main') === 'main')
                                                            .sort((a, b) => (a.view_order || 0) - (b.view_order || 0))
                                                            .map((field, index) => (
                                                                <Draggable key={field.id} draggableId={String(field.id)} index={index}>
                                                                    {(dragProvided) => (
                                                                        <Grid item xs={field.width === 'half' ? 6 : 12}>
                                                                            <Paper
                                                                                ref={dragProvided.innerRef}
                                                                                {...dragProvided.draggableProps}
                                                                                {...dragProvided.dragHandleProps}
                                                                                sx={{ p: 1.5, cursor: 'grab' }}
                                                                            >
                                                                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                                                                    <Box>
                                                                                        <Typography variant="body2" fontWeight="bold">
                                                                                            {field.field_label}
                                                                                        </Typography>
                                                                                        <Typography variant="caption" color="text.secondary">
                                                                                            {field.field_type} - {field.width === 'half' ? '50%' : '100%'}
                                                                                        </Typography>
                                                                                    </Box>
                                                                                    <IconButton
                                                                                        size="small"
                                                                                        onClick={() => handleEditField(field, field.step_id)}
                                                                                        sx={{ mt: -0.5, mr: -0.5 }}
                                                                                    >
                                                                                        <Edit fontSize="small" />
                                                                                    </IconButton>
                                                                                </Stack>
                                                                            </Paper>
                                                                        </Grid>
                                                                    )}
                                                                </Draggable>
                                                            ))}
                                                    </Grid>
                                                    {provided.placeholder}
                                                </Box>
                                            )}
                                        </Droppable>
                                    </Paper>
                                </Grid>

                                {/* Sidebar Section */}
                                <Grid item xs={12} md={4}>
                                    <Paper sx={{ p: 2, bgcolor: alpha(BRAND_COLORS.lightBlue, 0.3) }}>
                                        <Typography variant="h6" gutterBottom>Sidebar</Typography>
                                        <Droppable droppableId="sidebar" type="field">
                                            {(provided, snapshot) => (
                                                <Box
                                                    ref={provided.innerRef}
                                                    {...provided.droppableProps}
                                                    sx={{
                                                        minHeight: 200,
                                                        border: '2px dashed #ccc',
                                                        borderRadius: 1,
                                                        p: 2,
                                                        bgcolor: snapshot.isDraggingOver ? alpha(BRAND_COLORS.gold, 0.1) : 'white'
                                                    }}
                                                >
                                                    <Stack spacing={1}>
                                                        {(steps || []).flatMap(s => s.fields || [])
                                                            .filter(f => f && f.id && (f.section || 'main') === 'sidebar')
                                                            .sort((a, b) => (a.view_order || 0) - (b.view_order || 0))
                                                            .map((field, index) => (
                                                                <Draggable key={field.id} draggableId={String(field.id)} index={index}>
                                                                    {(dragProvided) => (
                                                                        <Paper
                                                                            ref={dragProvided.innerRef}
                                                                            {...dragProvided.draggableProps}
                                                                            {...dragProvided.dragHandleProps}
                                                                            sx={{ p: 1.5, cursor: 'grab' }}
                                                                        >
                                                                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                                                                <Box>
                                                                                    <Typography variant="body2" fontWeight="bold">
                                                                                        {field.field_label}
                                                                                    </Typography>
                                                                                    <Typography variant="caption" color="text.secondary">
                                                                                        {field.field_type}
                                                                                    </Typography>
                                                                                </Box>
                                                                                <IconButton
                                                                                    size="small"
                                                                                    onClick={() => handleEditField(field, field.step_id)}
                                                                                    sx={{ mt: -0.5, mr: -0.5 }}
                                                                                >
                                                                                    <Edit fontSize="small" />
                                                                                </IconButton>
                                                                            </Stack>
                                                                        </Paper>
                                                                    )}
                                                                </Draggable>
                                                            ))}
                                                    </Stack>
                                                    {provided.placeholder}
                                                </Box>
                                            )}
                                        </Droppable>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </DragDropContext>
                    </Box>
                )}

                {/* CARD BUILDER */}
                {viewMode === 'card' && template && (
                    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 2 }}>
                        <Alert severity="info" sx={{ mb: 3 }}>
                            <strong>Card Layout Builder:</strong> Customize how listings appear on category results pages.
                            Drag fields into Card sections or move to "Hidden" to exclude from cards.
                        </Alert>

                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Grid container spacing={4}>
                                <Grid item xs={12} md={7}>
                                    <Typography variant="h6" gutterBottom>Card Preview</Typography>

                                    {/* Mock Card */}
                                    <Card sx={{ maxWidth: 450, mx: 'auto', overflow: 'visible', bgcolor: 'background.paper', boxShadow: 3 }}>
                                        {/* Image Section with Overlays */}
                                        <Box sx={{ position: 'relative', height: 220, bgcolor: 'grey.300', mb: 0 }}>
                                            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Typography color="text.secondary">📷 Listing Image</Typography>
                                            </Box>

                                            {/* TOP LEFT */}
                                            <Box sx={{ position: 'absolute', top: 10, left: 10, zIndex: 6, width: '40%' }}>
                                                <Paper sx={{ bgcolor: alpha('#000', 0.2), p: 0.5, backdropFilter: 'blur(2px)' }}>
                                                    <Droppable droppableId="header_top_left" type="field" direction="horizontal">
                                                        {(provided, snapshot) => (
                                                            <Box
                                                                ref={provided.innerRef}
                                                                {...provided.droppableProps}
                                                                sx={{
                                                                    minHeight: 30,
                                                                    display: 'flex',
                                                                    flexWrap: 'wrap',
                                                                    gap: 0.5,
                                                                    bgcolor: snapshot.isDraggingOver ? 'rgba(255,255,255,0.4)' : 'transparent'
                                                                }}
                                                            >
                                                                {(steps || []).flatMap(s => s.fields || [])
                                                                    .filter(f => f.is_card_visible && f.card_section === 'header_top_left')
                                                                    .sort((a, b) => (a.card_order || 0) - (b.card_order || 0))
                                                                    .map((field, index) => (
                                                                        <Draggable key={field.id} draggableId={String(field.id)} index={index}>
                                                                            {(dragProvided) => (
                                                                                <Chip
                                                                                    ref={dragProvided.innerRef}
                                                                                    {...dragProvided.draggableProps}
                                                                                    {...dragProvided.dragHandleProps}
                                                                                    label={field.field_label}
                                                                                    size="small"
                                                                                    sx={{ bgcolor: 'white', color: 'black', height: 20, fontSize: '0.6rem' }}
                                                                                />
                                                                            )}
                                                                        </Draggable>
                                                                    ))}
                                                                {provided.placeholder}
                                                                {(steps || []).flatMap(s => s.fields || []).filter(f => f.card_section === 'header_top_left').length === 0 && (
                                                                    <Typography variant="caption" sx={{ color: 'white', opacity: 0.8, fontSize: '0.6rem' }}>
                                                                        Top Left
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        )}
                                                    </Droppable>
                                                </Paper>
                                            </Box>

                                            {/* TOP RIGHT */}
                                            <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 6, width: '40%', display: 'flex', justifyContent: 'flex-end' }}>
                                                <Paper sx={{ bgcolor: alpha('#000', 0.2), p: 0.5, backdropFilter: 'blur(2px)' }}>
                                                    <Droppable droppableId="header_top_right" type="field" direction="horizontal">
                                                        {(provided, snapshot) => (
                                                            <Box
                                                                ref={provided.innerRef}
                                                                {...provided.droppableProps}
                                                                sx={{
                                                                    minHeight: 30,
                                                                    display: 'flex',
                                                                    flexWrap: 'wrap',
                                                                    justifyContent: 'flex-end',
                                                                    gap: 0.5,
                                                                    bgcolor: snapshot.isDraggingOver ? 'rgba(255,255,255,0.4)' : 'transparent'
                                                                }}
                                                            >
                                                                {(steps || []).flatMap(s => s.fields || [])
                                                                    .filter(f => f.is_card_visible && f.card_section === 'header_top_right')
                                                                    .sort((a, b) => (a.card_order || 0) - (b.card_order || 0))
                                                                    .map((field, index) => (
                                                                        <Draggable key={field.id} draggableId={String(field.id)} index={index}>
                                                                            {(dragProvided) => (
                                                                                <Chip
                                                                                    ref={dragProvided.innerRef}
                                                                                    {...dragProvided.draggableProps}
                                                                                    {...dragProvided.dragHandleProps}
                                                                                    label={field.field_label}
                                                                                    size="small"
                                                                                    sx={{ bgcolor: 'black', color: 'white', height: 20, fontSize: '0.6rem' }}
                                                                                />
                                                                            )}
                                                                        </Draggable>
                                                                    ))}
                                                                {provided.placeholder}
                                                                {(steps || []).flatMap(s => s.fields || []).filter(f => f.card_section === 'header_top_right').length === 0 && (
                                                                    <Typography variant="caption" sx={{ color: 'white', opacity: 0.8, fontSize: '0.6rem' }}>
                                                                        Top Right
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        )}
                                                    </Droppable>
                                                </Paper>
                                            </Box>

                                            {/* COVER FIELD (Center) */}
                                            <Box sx={{ position: 'absolute', inset: 0, zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Droppable droppableId="cover" type="field">
                                                    {(provided, snapshot) => (
                                                        <Box
                                                            ref={provided.innerRef}
                                                            {...provided.droppableProps}
                                                            sx={{
                                                                minWidth: 150,
                                                                minHeight: 100,
                                                                border: '2px dashed rgba(255,255,255,0.7)',
                                                                borderRadius: 2,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                bgcolor: snapshot.isDraggingOver ? 'rgba(255,255,255,0.3)' : 'transparent'
                                                            }}
                                                        >
                                                            {(steps || []).flatMap(s => s.fields || [])
                                                                .filter(f => f.is_card_visible && f.card_section === 'cover')
                                                                .map((field, index) => (
                                                                    <Draggable key={field.id} draggableId={String(field.id)} index={index}>
                                                                        {(dragProvided) => (
                                                                            <Paper
                                                                                ref={dragProvided.innerRef}
                                                                                {...dragProvided.draggableProps}
                                                                                {...dragProvided.dragHandleProps}
                                                                                elevation={3}
                                                                                sx={{ p: 1, bgcolor: 'white', color: 'black', maxWidth: 140, textAlign: 'center' }}
                                                                            >
                                                                                <Typography variant="caption" fontWeight="bold" display="block">
                                                                                    {field.field_label}
                                                                                </Typography>
                                                                                <Chip label="Cover" size="small" color="primary" sx={{ height: 16, fontSize: '0.6rem' }} />
                                                                            </Paper>
                                                                        )}
                                                                    </Draggable>
                                                                ))}
                                                            {provided.placeholder}
                                                            {(steps || []).flatMap(s => s.fields || []).filter(f => f.card_section === 'cover').length === 0 && (
                                                                <Typography variant="caption" sx={{ color: 'white', textShadow: '0 1px 2px black', p: 1, textAlign: 'center' }}>
                                                                    Drop Custom Cover Field
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    )}
                                                </Droppable>
                                            </Box>

                                            {/* BOTTOM OVERLAY */}
                                            <Box sx={{ position: 'absolute', bottom: 10, left: 10, right: 10, zIndex: 10 }}>
                                                <Typography variant="overline" sx={{ color: 'white', textShadow: '0 1px 2px black' }}>
                                                    Badges / Overlay
                                                </Typography>
                                                <Paper sx={{ bgcolor: alpha('#000', 0.4), p: 1, minHeight: 40, backdropFilter: 'blur(4px)' }}>
                                                    <Droppable droppableId="image_overlay" type="field" direction="horizontal">
                                                        {(provided) => (
                                                            <Stack direction="row" spacing={1} ref={provided.innerRef} {...provided.droppableProps} sx={{ minHeight: 30 }}>
                                                                {(steps || []).flatMap(s => s.fields || [])
                                                                    .filter(f => f.is_card_visible && f.card_section === 'image_overlay')
                                                                    .sort((a, b) => (a.card_order || 0) - (b.card_order || 0))
                                                                    .map((field, index) => (
                                                                        <Draggable key={field.id} draggableId={String(field.id)} index={index}>
                                                                            {(dragProvided) => (
                                                                                <Chip
                                                                                    ref={dragProvided.innerRef}
                                                                                    {...dragProvided.draggableProps}
                                                                                    {...dragProvided.dragHandleProps}
                                                                                    label={field.field_label}
                                                                                    size="small"
                                                                                    sx={{ bgcolor: 'rgba(255,255,255,0.9)', color: 'black' }}
                                                                                />
                                                                            )}
                                                                        </Draggable>
                                                                    ))}
                                                                {provided.placeholder}
                                                            </Stack>
                                                        )}
                                                    </Droppable>
                                                </Paper>
                                            </Box>
                                        </Box>

                                        {/* Body Section */}
                                        <Box sx={{ p: 2, minHeight: 150, borderBottom: '1px solid #eee' }}>
                                            <Typography variant="overline" color="text.secondary">Card Body</Typography>
                                            <Droppable droppableId="body" type="field">
                                                {(provided) => (
                                                    <Stack spacing={1} ref={provided.innerRef} {...provided.droppableProps} sx={{ minHeight: 100, border: '1px dashed #ccc', p: 1 }}>
                                                        {(steps || []).flatMap(s => s.fields || [])
                                                            .filter(f => f.is_card_visible && (f.card_section === 'body' || !f.card_section))
                                                            .sort((a, b) => (a.card_order || 0) - (b.card_order || 0))
                                                            .map((field, index) => (
                                                                <Draggable key={field.id} draggableId={String(field.id)} index={index}>
                                                                    {(dragProvided) => (
                                                                        <Box
                                                                            ref={dragProvided.innerRef}
                                                                            {...dragProvided.draggableProps}
                                                                            {...dragProvided.dragHandleProps}
                                                                            sx={{ p: 1, border: '1px solid #eee', borderRadius: 1, bgcolor: 'white', color: 'black' }}
                                                                        >
                                                                            <Typography variant="body2" fontWeight="bold">{field.field_label}</Typography>
                                                                            <Typography variant="caption" color="text.secondary">Preview</Typography>
                                                                        </Box>
                                                                    )}
                                                                </Draggable>
                                                            ))}
                                                        {provided.placeholder}
                                                    </Stack>
                                                )}
                                            </Droppable>
                                        </Box>

                                        {/* Footer Section */}
                                        <Box sx={{ p: 1, bgcolor: 'grey.50' }}>
                                            <Typography variant="overline" color="text.secondary" sx={{ ml: 1 }}>Card Footer</Typography>
                                            <Droppable droppableId="footer" type="field" direction="horizontal">
                                                {(provided) => (
                                                    <Stack direction="row" spacing={1} flexWrap="wrap" ref={provided.innerRef} {...provided.droppableProps} sx={{ minHeight: 40, border: '1px dashed #ccc', p: 1 }}>
                                                        {(steps || []).flatMap(s => s.fields || [])
                                                            .filter(f => f.is_card_visible && f.card_section === 'footer')
                                                            .sort((a, b) => (a.card_order || 0) - (b.card_order || 0))
                                                            .map((field, index) => (
                                                                <Draggable key={field.id} draggableId={String(field.id)} index={index}>
                                                                    {(dragProvided) => (
                                                                        <Chip
                                                                            ref={dragProvided.innerRef}
                                                                            {...dragProvided.draggableProps}
                                                                            {...dragProvided.dragHandleProps}
                                                                            label={field.field_label}
                                                                            size="small"
                                                                            variant="outlined"
                                                                        />
                                                                    )}
                                                                </Draggable>
                                                            ))}
                                                        {provided.placeholder}
                                                    </Stack>
                                                )}
                                            </Droppable>
                                        </Box>
                                    </Card>
                                </Grid>

                                {/* Hidden Fields List */}
                                <Grid item xs={12} md={5}>
                                    <Typography variant="h6" gutterBottom>Available Fields</Typography>
                                    <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                                        <Droppable droppableId="hidden" type="field">
                                            {(provided) => (
                                                <Stack spacing={1} ref={provided.innerRef} {...provided.droppableProps} sx={{ minHeight: 200 }}>
                                                    {(steps || []).flatMap(s => s.fields || [])
                                                        .filter(f => !f.is_card_visible)
                                                        .map((field, index) => (
                                                            <Draggable key={field.id} draggableId={String(field.id)} index={index}>
                                                                {(dragProvided) => (
                                                                    <Card
                                                                        ref={dragProvided.innerRef}
                                                                        {...dragProvided.draggableProps}
                                                                        {...dragProvided.dragHandleProps}
                                                                        variant="outlined"
                                                                        sx={{ p: 1.5 }}
                                                                    >
                                                                        <Typography variant="subtitle2">{field.field_label}</Typography>
                                                                        <Typography variant="caption" color="text.secondary">{field.field_type}</Typography>
                                                                    </Card>
                                                                )}
                                                            </Draggable>
                                                        ))}
                                                    {provided.placeholder}
                                                </Stack>
                                            )}
                                        </Droppable>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </DragDropContext>
                    </Box>
                )}

                {/* Step Dialog */}
                <Dialog open={stepDialogOpen} onClose={() => setStepDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ background: BRAND_COLORS.gradient, color: 'white' }}>
                        {editingStep ? 'Edit Step' : 'Add New Step'}
                    </DialogTitle>
                    <DialogContent sx={{ mt: 2 }}>
                        <Stack spacing={2.5}>
                            <TextField
                                fullWidth
                                label="Step Title"
                                value={stepForm.title}
                                onChange={(e) => setStepForm({ ...stepForm, title: e.target.value })}
                                required
                            />
                            <TextField
                                fullWidth
                                label="Description"
                                multiline
                                rows={2}
                                value={stepForm.description}
                                onChange={(e) => setStepForm({ ...stepForm, description: e.target.value })}
                            />
                            <TextField
                                fullWidth
                                label="Icon (emoji or icon name)"
                                value={stepForm.icon}
                                onChange={(e) => setStepForm({ ...stepForm, icon: e.target.value })}
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={stepForm.is_required}
                                        onChange={(e) => setStepForm({ ...stepForm, is_required: e.target.checked })}
                                    />
                                }
                                label="Required Step"
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setStepDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveStep} variant="contained" disabled={!stepForm.title}>
                            {editingStep ? 'Update' : 'Add'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Field Dialog */}
                <Dialog open={fieldDialogOpen} onClose={() => setFieldDialogOpen(false)} maxWidth="md" fullWidth>
                    <DialogTitle sx={{ background: BRAND_COLORS.gradient, color: 'white' }}>
                        {editingField ? 'Edit Field' : 'Add New Field'}
                    </DialogTitle>
                    <DialogContent sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Field Label"
                                    value={fieldForm.field_label}
                                    onChange={(e) => setFieldForm({ ...fieldForm, field_label: e.target.value })}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Field Name (internal)"
                                    value={fieldForm.field_name}
                                    onChange={(e) => setFieldForm({ ...fieldForm, field_name: e.target.value })}
                                    helperText="Leave blank to auto-generate"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Field Type</InputLabel>
                                    <Select
                                        value={fieldForm.field_type}
                                        onChange={(e) => setFieldForm({ ...fieldForm, field_type: e.target.value })}
                                        label="Field Type"
                                    >
                                        {FIELD_TYPES.map(type => (
                                            <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Width</InputLabel>
                                    <Select
                                        value={fieldForm.width}
                                        onChange={(e) => setFieldForm({ ...fieldForm, width: e.target.value })}
                                        label="Width"
                                    >
                                        <MenuItem value="full">Full Width</MenuItem>
                                        <MenuItem value="half">Half Width</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Placeholder"
                                    value={fieldForm.placeholder}
                                    onChange={(e) => setFieldForm({ ...fieldForm, placeholder: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Help Text"
                                    value={fieldForm.help_text}
                                    onChange={(e) => setFieldForm({ ...fieldForm, help_text: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={fieldForm.is_required}
                                            onChange={(e) => setFieldForm({ ...fieldForm, is_required: e.target.checked })}
                                        />
                                    }
                                    label="Required"
                                />
                            </Grid>
                            {['file', 'image'].includes(fieldForm.field_type) && (
                                <Grid item xs={12} sm={6}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={fieldForm.allow_multiple}
                                                onChange={(e) => setFieldForm({ ...fieldForm, allow_multiple: e.target.checked })}
                                            />
                                        }
                                        label="Allow Multiple Files"
                                    />
                                </Grid>
                            )}
                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={fieldForm.is_visible}
                                            onChange={(e) => setFieldForm({ ...fieldForm, is_visible: e.target.checked })}
                                        />
                                    }
                                    label="Visible"
                                />
                            </Grid>
                            {['select', 'multiselect', 'radio', 'checkbox'].includes(fieldForm.field_type) && (
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Options (comma-separated)"
                                        helperText="e.g., Option 1, Option 2, Option 3"
                                        onChange={(e) => {
                                            const opts = e.target.value.split(',').map(o => o.trim()).filter(Boolean);
                                            setFieldForm({ ...fieldForm, options: opts });
                                        }}
                                    />
                                </Grid>
                            )}

                            {/* Layout Management Section */}
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                                    Layout & Display Settings
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Section (Detail Page)</InputLabel>
                                    <Select
                                        value={fieldForm.section}
                                        onChange={(e) => setFieldForm({ ...fieldForm, section: e.target.value })}
                                        label="Section (Detail Page)"
                                    >
                                        <MenuItem value="header">Header (Top Banner)</MenuItem>
                                        <MenuItem value="main">Main Content</MenuItem>
                                        <MenuItem value="sidebar">Sidebar</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Width</InputLabel>
                                    <Select
                                        value={fieldForm.width}
                                        onChange={(e) => setFieldForm({ ...fieldForm, width: e.target.value })}
                                        label="Width"
                                    >
                                        <MenuItem value="full">Full Width (100%)</MenuItem>
                                        <MenuItem value="half">Half Width (50%)</MenuItem>
                                        <MenuItem value="third">Third Width (33%)</MenuItem>
                                        <MenuItem value="quarter">Quarter Width (25%)</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={fieldForm.display_in_card}
                                            onChange={(e) => setFieldForm({ ...fieldForm, display_in_card: e.target.checked })}
                                        />
                                    }
                                    label="Show in Listing Card"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={fieldForm.display_in_detail}
                                            onChange={(e) => setFieldForm({ ...fieldForm, display_in_detail: e.target.checked })}
                                        />
                                    }
                                    label="Show in Detail Page"
                                />
                            </Grid>

                            {fieldForm.display_in_card && (
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Card Display Priority"
                                        value={fieldForm.card_priority}
                                        onChange={(e) => setFieldForm({ ...fieldForm, card_priority: parseInt(e.target.value) || 0 })}
                                        helperText="Lower number = higher priority"
                                    />
                                </Grid>
                            )}

                            {fieldForm.field_type === 'image' && (
                                <Grid item xs={12} sm={6}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={fieldForm.is_cover_image}
                                                onChange={(e) => setFieldForm({ ...fieldForm, is_cover_image: e.target.checked })}
                                            />
                                        }
                                        label="Use as Cover Image"
                                    />
                                </Grid>
                            )}
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setFieldDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveField} variant="contained" disabled={!fieldForm.field_label}>
                            {editingField ? 'Update' : 'Add'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </ThemeProvider>
    );
};

export default PostTemplateScreen;



