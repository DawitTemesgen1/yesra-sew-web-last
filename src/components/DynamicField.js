import React from 'react';
import {
    TextField, FormControl, InputLabel, Select, MenuItem,
    FormControlLabel, Checkbox, RadioGroup, Radio, FormLabel,
    Box, Typography, Chip, Stack
} from '@mui/material';
import { DatePicker, TimePicker, DateTimePicker } from '@mui/x-date-pickers';
import VideoUploader from './VideoUploader';
import ImageUploader from './ImageUploader';

const DynamicField = ({ field, value, onChange, error, helperText }) => {
    const handleChange = (e) => {
        onChange(e.target.value);
    };

    const commonProps = {
        fullWidth: true,
        label: field.field_label,
        placeholder: field.placeholder,
        required: field.is_required,
        error: !!error,
        helperText: error || field.help_text || helperText,
        disabled: !field.is_visible
    };

    switch (field.field_type) {
        case 'textarea':
            return (
                <TextField
                    {...commonProps}
                    multiline
                    rows={4}
                    value={value || ''}
                    onChange={handleChange}
                />
            );

        case 'number':
            return (
                <TextField
                    {...commonProps}
                    type="number"
                    value={value || ''}
                    onChange={handleChange}
                />
            );

        case 'email':
            return (
                <TextField
                    {...commonProps}
                    type="email"
                    value={value || ''}
                    onChange={handleChange}
                />
            );

        case 'phone':
            return (
                <TextField
                    {...commonProps}
                    type="tel"
                    value={value || ''}
                    onChange={handleChange}
                />
            );

        case 'url':
            return (
                <TextField
                    {...commonProps}
                    type="url"
                    value={value || ''}
                    onChange={handleChange}
                />
            );

        case 'select':
            return (
                <FormControl fullWidth error={!!error} required={field.is_required}>
                    <InputLabel>{field.field_label}</InputLabel>
                    <Select
                        value={value || ''}
                        label={field.field_label}
                        onChange={handleChange}
                    >
                        {field.options?.map((opt, idx) => (
                            <MenuItem key={idx} value={opt}>
                                {opt}
                            </MenuItem>
                        ))}
                    </Select>
                    {(error || field.help_text) && (
                        <Typography variant="caption" color={error ? "error" : "textSecondary"} sx={{ ml: 2, mt: 0.5 }}>
                            {error || field.help_text}
                        </Typography>
                    )}
                </FormControl>
            );

        case 'multiselect':
            return (
                <FormControl fullWidth error={!!error} required={field.is_required}>
                    <InputLabel>{field.field_label}</InputLabel>
                    <Select
                        multiple
                        value={value || []}
                        label={field.field_label}
                        onChange={handleChange}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => (
                                    <Chip key={value} label={value} size="small" />
                                ))}
                            </Box>
                        )}
                    >
                        {field.options?.map((opt, idx) => (
                            <MenuItem key={idx} value={opt}>
                                {opt}
                            </MenuItem>
                        ))}
                    </Select>
                    {(error || field.help_text) && (
                        <Typography variant="caption" color={error ? "error" : "textSecondary"} sx={{ ml: 2, mt: 0.5 }}>
                            {error || field.help_text}
                        </Typography>
                    )}
                </FormControl>
            );

        case 'radio':
            return (
                <FormControl error={!!error} required={field.is_required} component="fieldset">
                    <FormLabel component="legend">{field.field_label}</FormLabel>
                    <RadioGroup
                        value={value || ''}
                        onChange={handleChange}
                    >
                        {field.options?.map((opt, idx) => (
                            <FormControlLabel key={idx} value={opt} control={<Radio />} label={opt} />
                        ))}
                    </RadioGroup>
                    {(error || field.help_text) && (
                        <Typography variant="caption" color={error ? "error" : "textSecondary"}>
                            {error || field.help_text}
                        </Typography>
                    )}
                </FormControl>
            );

        case 'checkbox':
            // If options exist, it's a multi-checkbox group
            if (field.options && field.options.length > 0) {
                return (
                    <FormControl error={!!error} required={field.is_required} component="fieldset">
                        <FormLabel component="legend">{field.field_label}</FormLabel>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            {field.options.map((opt, idx) => (
                                <FormControlLabel
                                    key={idx}
                                    control={
                                        <Checkbox
                                            checked={(value || []).includes(opt)}
                                            onChange={(e) => {
                                                const current = value || [];
                                                const newValue = e.target.checked
                                                    ? [...current, opt]
                                                    : current.filter(v => v !== opt);
                                                onChange(newValue);
                                            }}
                                        />
                                    }
                                    label={opt}
                                />
                            ))}
                        </Box>
                        {(error || field.help_text) && (
                            <Typography variant="caption" color={error ? "error" : "textSecondary"}>
                                {error || field.help_text}
                            </Typography>
                        )}
                    </FormControl>
                );
            }
            // Single checkbox (boolean)
            return (
                <FormControl error={!!error} required={field.is_required}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={!!value}
                                onChange={(e) => onChange(e.target.checked)}
                            />
                        }
                        label={field.field_label}
                    />
                    {(error || field.help_text) && (
                        <Typography variant="caption" color={error ? "error" : "textSecondary"}>
                            {error || field.help_text}
                        </Typography>
                    )}
                </FormControl>
            );

        case 'date':
            return (
                <DatePicker
                    label={field.field_label}
                    value={value || null}
                    onChange={onChange}
                    slotProps={{
                        textField: {
                            fullWidth: true,
                            required: field.is_required,
                            error: !!error,
                            helperText: error || field.help_text
                        }
                    }}
                />
            );

        case 'time':
            return (
                <TimePicker
                    label={field.field_label}
                    value={value || null}
                    onChange={onChange}
                    slotProps={{
                        textField: {
                            fullWidth: true,
                            required: field.is_required,
                            error: !!error,
                            helperText: error || field.help_text
                        }
                    }}
                />
            );

        case 'datetime':
            return (
                <DateTimePicker
                    label={field.field_label}
                    value={value || null}
                    onChange={onChange}
                    slotProps={{
                        textField: {
                            fullWidth: true,
                            required: field.is_required,
                            error: !!error,
                            helperText: error || field.help_text
                        }
                    }}
                />
            );

        case 'video':
            return (
                <Box>
                    <Typography variant="subtitle2" gutterBottom required={field.is_required}>
                        {field.field_label} {field.is_required && '*'}
                    </Typography>
                    <VideoUploader
                        value={value}
                        onChange={onChange}
                    />
                    {(error || field.help_text) && (
                        <Typography variant="caption" color={error ? "error" : "textSecondary"} sx={{ display: 'block', mt: 1 }}>
                            {error || field.help_text}
                        </Typography>
                    )}
                </Box>
            );

        case 'image':
        case 'file':
            return (
                <Box>
                    <Typography variant="subtitle2" gutterBottom required={field.is_required}>
                        {field.field_label} {field.is_required && '*'}
                    </Typography>
                    <ImageUploader
                        value={value}
                        onChange={onChange}
                        multiple={field.allow_multiple}
                    />
                    {(error || field.help_text) && (
                        <Typography variant="caption" color={error ? "error" : "textSecondary"} sx={{ display: 'block', mt: 1 }}>
                            {error || field.help_text}
                        </Typography>
                    )}
                </Box>
            );

        case 'color':
            return (
                <Box>
                    <Typography variant="subtitle2" gutterBottom>
                        {field.field_label}
                    </Typography>
                    <input
                        type="color"
                        value={value || '#000000'}
                        onChange={handleChange}
                        style={{ width: '100%', height: 40, cursor: 'pointer' }}
                    />
                </Box>
            );

        case 'text':
        default:
            return (
                <TextField
                    {...commonProps}
                    value={value || ''}
                    onChange={handleChange}
                />
            );
    }
};

export default DynamicField;
