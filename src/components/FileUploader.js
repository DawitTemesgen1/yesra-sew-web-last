import React, { useState, useRef } from 'react';
import {
    Box, Typography, IconButton, LinearProgress, Card, Stack, alpha, Button, Link
} from '@mui/material';
import { CloudUpload, Delete, InsertDriveFile, PictureAsPdf, Description } from '@mui/icons-material';
import { supabase } from '../services/api';
import toast from 'react-hot-toast';

const FileUploader = ({ value, onChange, maxSize = 10, multiple = false }) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    // Ensure value is always an array for consistent handling internally
    const initialFiles = Array.isArray(value) ? value : (value ? [value] : []);
    const [fileUrls, setFileUrls] = useState(initialFiles);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        // Validation
        const validFiles = [];
        for (const file of files) {
            const fileType = file.type;
            const validTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ];

            if (!validTypes.includes(fileType)) {
                toast.error(`Invalid file type: ${file.name}. Only PDF and Word documents are allowed.`);
                continue;
            }
            if (file.size > maxSize * 1024 * 1024) {
                toast.error(`File too large: ${file.name} (Max ${maxSize}MB)`);
                continue;
            }
            validFiles.push(file);
        }

        if (validFiles.length === 0) return;

        if (!multiple && validFiles.length > 1) {
            toast.error("Multiple files not allowed for this field");
            return;
        }

        const filesToUpload = multiple ? validFiles : [validFiles[0]];

        try {
            setUploading(true);
            setProgress(0);

            const newUrls = [];
            let completed = 0;

            for (const file of filesToUpload) {
                try {
                    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
                    const filePath = `documents/${fileName}`;

                    const { error } = await supabase.storage
                        .from('listing-documents')
                        .upload(filePath, file, {
                            cacheControl: '3600',
                            upsert: false
                        });

                    if (error) throw error;

                    const { data: { publicUrl } } = supabase.storage
                        .from('listing-documents')
                        .getPublicUrl(filePath);

                    newUrls.push(publicUrl);
                } catch (innerError) {
                    console.error('Error uploading specific file:', file.name, innerError);
                    toast.error(`Failed to upload ${file.name}`);
                }

                completed++;
                setProgress(Math.round((completed / filesToUpload.length) * 100));
            }

            if (newUrls.length > 0) {
                // Update State
                let finalUrls;
                if (multiple) {
                    finalUrls = [...fileUrls, ...newUrls];
                } else {
                    finalUrls = [newUrls[0]];
                }

                setFileUrls(finalUrls);
                // Return array if multiple, string otherwise
                onChange(multiple ? finalUrls : finalUrls[0]);

                toast.success(`Successfully uploaded ${newUrls.length} document(s)!`);
            }
        } catch (error) {
            console.error('Error in upload process:', error);
            toast.error('Upload process failed');
        } finally {
            setUploading(false);
            setProgress(0);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = (indexToDelete) => {
        const newUrls = fileUrls.filter((_, index) => index !== indexToDelete);
        setFileUrls(newUrls);
        onChange(multiple ? newUrls : (newUrls[0] || ''));
    };

    const getFileIcon = (url) => {
        if (url.toLowerCase().endsWith('.pdf')) return <PictureAsPdf color="error" />;
        if (url.toLowerCase().endsWith('.doc') || url.toLowerCase().endsWith('.docx')) return <Description color="primary" />;
        return <InsertDriveFile color="action" />;
    };

    const getFileName = (url) => {
        try {
            return decodeURIComponent(url.split('/').pop().split('-').slice(2).join('-') || 'Document');
        } catch (e) {
            return 'Document';
        }
    };

    return (
        <Box>
            <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                multiple={multiple}
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileSelect}
            />

            <Stack spacing={2}>
                {fileUrls.map((url, index) => (
                    <Card key={index} variant="outlined" sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                        {getFileIcon(url)}
                        <Box sx={{ flex: 1, overflow: 'hidden' }}>
                            <Link href={url} target="_blank" rel="noopener noreferrer" underline="hover" color="text.primary" variant="body2" sx={{ fontWeight: 500 }}>
                                {getFileName(url)}
                            </Link>
                        </Box>
                        <IconButton
                            onClick={() => handleDelete(index)}
                            size="small"
                        >
                            <Delete fontSize="small" />
                        </IconButton>
                    </Card>
                ))}

                {(multiple || fileUrls.length === 0) && (
                    <Button
                        variant="outlined"
                        startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
                        onClick={() => !uploading && fileInputRef.current.click()}
                        disabled={uploading}
                        fullWidth
                        sx={{ borderStyle: 'dashed', py: 2, height: 'auto' }}
                    >
                        {uploading ? `Uploading... ${progress}%` : (multiple ? "Add Documents" : "Upload Document")}
                    </Button>
                )}
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Supported formats: PDF, DOC, DOCX. Max size: {maxSize}MB.
            </Typography>
        </Box>
    );
};

// Helper for circular progress
function CircularProgress(props) {
    return (
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <Typography variant="caption" component="div" color="text.secondary">{`${Math.round(props.value)}%`}</Typography>
        </Box>
    );
}

export default FileUploader;
