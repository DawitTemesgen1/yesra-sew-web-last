import React, { useState, useRef } from 'react';
import {
    Box, Typography, IconButton, LinearProgress, Card, CardMedia, alpha
} from '@mui/material';
import { CloudUpload, Delete } from '@mui/icons-material';
import { supabase } from '../services/api';
import toast from 'react-hot-toast';

const ImageUploader = ({ value, onChange, maxSize = 50, multiple = false }) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    // Ensure value is always an array for consistent handling internally, strictly for preview
    const initialPreviews = Array.isArray(value) ? value : (value ? [value] : []);
    const [previewUrls, setPreviewUrls] = useState(initialPreviews);
    const fileInputRef = useRef(null);

    const compressImage = async (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Calculate new dimensions (max 1024px width for better mobile performance)
                    let width = img.width;
                    let height = img.height;
                    const maxWidth = 1024; // Reduced from 1200 for stability

                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    // Draw and compress
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            // Clear canvas to free memory
                            ctx.clearRect(0, 0, width, height);
                            canvas.width = 0;
                            canvas.height = 0;

                            resolve(new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                            }));
                        },
                        'image/jpeg',
                        0.80 // Reduced to 80% quality for smaller payloads
                    );
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    const handleFileSelect = async (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        // Validation
        const validFiles = [];
        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                toast.error(`Invalid file type: ${file.name}`);
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
                    // Small delay to allow UI update and GC
                    await new Promise(r => setTimeout(r, 100));

                    // Compress image before upload
                    const compressedFile = await compressImage(file);

                    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
                    const filePath = `images/${fileName}`;

                    const { error } = await supabase.storage
                        .from('listing-images')
                        .upload(filePath, compressedFile, {
                            cacheControl: '3600',
                            upsert: false
                        });

                    if (error) throw error;

                    const { data: { publicUrl } } = supabase.storage
                        .from('listing-images')
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
                    finalUrls = [...previewUrls, ...newUrls];
                } else {
                    finalUrls = [newUrls[0]];
                }

                setPreviewUrls(finalUrls);
                // Return array if multiple, string otherwise to maintain backward compatibility
                onChange(multiple ? finalUrls : finalUrls[0]);

                toast.success(`Successfully uploaded ${newUrls.length} image(s)!`);
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
        const newUrls = previewUrls.filter((_, index) => index !== indexToDelete);
        setPreviewUrls(newUrls);
        onChange(multiple ? newUrls : (newUrls[0] || ''));
    };

    return (
        <Box>
            <input
                type="file"
                accept="image/*"
                multiple={multiple}
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileSelect}
            />

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {previewUrls.map((url, index) => (
                    <Card key={index} sx={{ position: 'relative', width: 150, height: 150 }}>
                        <CardMedia
                            component="img"
                            src={url}
                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <IconButton
                            onClick={() => handleDelete(index)}
                            sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                bgcolor: 'rgba(255,255,255,0.8)',
                                '&:hover': { bgcolor: 'white' },
                                padding: '4px'
                            }}
                            size="small"
                        >
                            <Delete color="error" fontSize="small" />
                        </IconButton>
                    </Card>
                ))}

                {(multiple || previewUrls.length === 0) && (
                    <Box
                        sx={{
                            width: 150,
                            height: 150,
                            border: '2px dashed',
                            borderColor: 'divider',
                            borderRadius: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            bgcolor: alpha('#000', 0.02),
                            '&:hover': {
                                bgcolor: alpha('#000', 0.05),
                                borderColor: 'primary.main'
                            }
                        }}
                        onClick={() => !uploading && fileInputRef.current.click()}
                    >
                        {uploading ? (
                            <Box sx={{ width: '80%', textAlign: 'center' }}>
                                <LinearProgress variant="determinate" value={progress} />
                                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>{progress}%</Typography>
                            </Box>
                        ) : (
                            <>
                                <CloudUpload sx={{ fontSize: 32, color: 'text.secondary', mb: 1 }} />
                                <Typography variant="caption" color="text.secondary" align="center">
                                    {multiple ? "Add Photos" : "Upload Photo"}
                                </Typography>
                            </>
                        )}
                    </Box>
                )}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Max size: {maxSize}MB. {multiple ? 'You can upload up to 5 images.' : ''}
            </Typography>
        </Box>
    );
};

export default ImageUploader;

