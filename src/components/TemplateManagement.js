import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, TextField, Select,
  MenuItem, Button, Switch, FormControlLabel, Accordion, AccordionSummary,
  AccordionDetails, List, ListItem, ListItemText, ListItemIcon,
  IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
  DynamicForm, Person, Settings, Email, Sms, NotificationsActive,
  ExpandMore, Add, Edit, Delete, Save, Preview, Code
} from '@mui/icons-material';

const TemplateManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [postTemplates, setPostTemplates] = useState([
    {
      id: 1,
      name: 'Car Listing Template',
      category: 'Cars',
      fields: [
        { id: 'make', label: 'Make', type: 'text', required: true },
        { id: 'model', label: 'Model', type: 'text', required: true },
        { id: 'year', label: 'Year', type: 'number', required: true },
        { id: 'mileage', label: 'Mileage', type: 'number', required: false },
        { id: 'condition', label: 'Condition', type: 'dropdown', options: ['New', 'Used'], required: true }
      ],
      active: true
    },
    {
      id: 2,
      name: 'Property Listing Template',
      category: 'Homes',
      fields: [
        { id: 'bedrooms', label: 'Bedrooms', type: 'number', required: true },
        { id: 'bathrooms', label: 'Bathrooms', type: 'number', required: true },
        { id: 'area', label: 'Area (sqm)', type: 'number', required: true },
        { id: 'furnished', label: 'Furnished', type: 'checkbox', required: false },
        { id: 'parking', label: 'Parking Available', type: 'checkbox', required: false }
      ],
      active: true
    }
  ]);

  const [profileTemplates, setProfileTemplates] = useState([
    {
      id: 1,
      name: 'Individual Profile Template',
      fields: [
        { id: 'firstName', label: 'First Name', type: 'text', required: true },
        { id: 'lastName', label: 'Last Name', type: 'text', required: true },
        { id: 'phone', label: 'Phone', type: 'text', required: true },
        { id: 'bio', label: 'Bio', type: 'text', required: false },
        { id: 'profilePicture', label: 'Profile Picture', type: 'file', required: false }
      ],
      active: true
    },
    {
      id: 2,
      name: 'Business Profile Template',
      fields: [
        { id: 'companyName', label: 'Company Name', type: 'text', required: true },
        { id: 'businessType', label: 'Business Type', type: 'dropdown', options: ['PLC', 'Sole Proprietor', 'Partnership'], required: true },
        { id: 'tinNumber', label: 'TIN Number', type: 'text', required: true },
        { id: 'licenseNumber', label: 'License Number', type: 'text', required: true },
        { id: 'logo', label: 'Company Logo', type: 'file', required: false }
      ],
      active: true
    }
  ]);

  const [communicationTemplates, setCommunicationTemplates] = useState([
    {
      id: 1,
      name: 'Welcome Email',
      type: 'email',
      subject: 'Welcome to Yesra Sew!',
      content: 'Dear {{name}}, welcome to our platform...',
      variables: ['name', 'email'],
      active: true
    },
    {
      id: 2,
      name: 'Listing Approved SMS',
      type: 'sms',
      content: 'Your listing "{{title}}" has been approved!',
      variables: ['title', 'category'],
      active: true
    },
    {
      id: 3,
      name: 'Payment Confirmation',
      type: 'email',
      subject: 'Payment Confirmation',
      content: 'Your payment of ETB {{amount}} has been received...',
      variables: ['amount', 'service'],
      active: false
    }
  ]);

  const renderFieldEditor = (field, index, templateType) => (
    <Card key={field.id} sx={{ mb: 2 }}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Field Label"
              value={field.label}
              onChange={(e) => updateField(templateType, index, 'label', e.target.value)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Select
              fullWidth
              value={field.type}
              onChange={(e) => updateField(templateType, index, 'type', e.target.value)}
              size="small"
            >
              <MenuItem value="text">Text</MenuItem>
              <MenuItem value="number">Number</MenuItem>
              <MenuItem value="dropdown">Dropdown</MenuItem>
              <MenuItem value="checkbox">Checkbox</MenuItem>
              <MenuItem value="file">File</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={field.required}
                  onChange={(e) => updateField(templateType, index, 'required', e.target.checked)}
                />
              }
              label="Required"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            {field.type === 'dropdown' && (
              <TextField
                fullWidth
                label="Options (comma separated)"
                value={field.options?.join(', ') || ''}
                onChange={(e) => updateField(templateType, index, 'options', e.target.value.split(',').map(o => o.trim()))}
                size="small"
              />
            )}
          </Grid>
          <Grid item xs={12} md={2}>
            <IconButton color="error" onClick={() => removeField(templateType, index)}>
              <Delete />
            </IconButton>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const updateField = (templateType, fieldIndex, property, value) => {
    if (templateType === 'post') {
      const updated = [...postTemplates];
      updated[0].fields[fieldIndex][property] = value;
      setPostTemplates(updated);
    } else if (templateType === 'profile') {
      const updated = [...profileTemplates];
      updated[0].fields[fieldIndex][property] = value;
      setProfileTemplates(updated);
    }
  };

  const removeField = (templateType, index) => {
    if (templateType === 'post') {
      const updated = [...postTemplates];
      updated[0].fields.splice(index, 1);
      setPostTemplates(updated);
    } else if (templateType === 'profile') {
      const updated = [...profileTemplates];
      updated[0].fields.splice(index, 1);
      setProfileTemplates(updated);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Template Management</Typography>
      
      <Grid container spacing={3}>
        {/* Post Templates */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>Post Templates</Typography>
              <List>
                {postTemplates.map(template => (
                  <ListItem key={template.id}>
                    <ListItemIcon><DynamicForm /></ListItemIcon>
                    <ListItemText
                      primary={template.name}
                      secondary={`${template.category} • ${template.fields.length} fields`}
                    />
                    <IconButton size="small"><Edit /></IconButton>
                  </ListItem>
                ))}
              </List>
              <Button variant="contained" fullWidth startIcon={<Add />}>
                Add Post Template
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Templates */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>Profile Templates</Typography>
              <List>
                {profileTemplates.map(template => (
                  <ListItem key={template.id}>
                    <ListItemIcon><Person /></ListItemIcon>
                    <ListItemText
                      primary={template.name}
                      secondary={`${template.fields.length} fields`}
                    />
                    <IconButton size="small"><Edit /></IconButton>
                  </ListItem>
                ))}
              </List>
              <Button variant="contained" fullWidth startIcon={<Add />}>
                Add Profile Template
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Communication Templates */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>Communication Templates</Typography>
              <List>
                {communicationTemplates.map(template => (
                  <ListItem key={template.id}>
                    <ListItemIcon>
                      {template.type === 'email' ? <Email /> : <Sms />}
                    </ListItemIcon>
                    <ListItemText
                      primary={template.name}
                      secondary={template.type}
                    />
                    <IconButton size="small"><Edit /></IconButton>
                  </ListItem>
                ))}
              </List>
              <Button variant="contained" fullWidth startIcon={<Add />}>
                Add Communication Template
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Template Editor */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>Template Editor</Typography>
              
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>Car Listing Template - Field Editor</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {postTemplates[0]?.fields.map((field, index) => 
                    renderFieldEditor(field, index, 'post')
                  )}
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => {
                      const newField = {
                        id: Date.now().toString(),
                        label: 'New Field',
                        type: 'text',
                        required: false
                      };
                      const updated = [...postTemplates];
                      updated[0].fields.push(newField);
                      setPostTemplates(updated);
                    }}
                  >
                    Add Field
                  </Button>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>Email Template Editor</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Subject"
                        defaultValue="Welcome to Yesra Sew!"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Email Content"
                        defaultValue="Dear {{name}}, welcome to our platform..."
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">
                        Available variables: {'{{name}}'}, {'{{email}}'}, {'{{listing_title}}'}
                      </Typography>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TemplateManagement;

