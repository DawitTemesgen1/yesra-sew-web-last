import React, { useState, useRef } from 'react';
import {
    Box, Typography, Button, IconButton, LinearProgress, Stack,
    Card, CardMedia, alpha
} from '@mui/material';
import { CloudUpload, Delete, PlayArrow, Pause } from '@mui/icons-material';
import { supabase } from '../services/api';
import toast from 'react-hot-toast';

const VideoUploader = ({ value, onChange, maxSize = 50, maxDuration = 60 }) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [previewUrl, setPreviewUrl] = useState(value || '');
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate type
        if (!file.type.startsWith('video/')) {
            toast.error('Please upload a valid video file');
            return;
        }

        // Validate size (MB)
        if (file.size > maxSize * 1024 * 1024) {
            toast.error(`Video must be smaller than ${maxSize}MB`);
            return;
        }

        // Upload to Supabase
        try {
            setUploading(true);
            setProgress(0);

            const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
            const filePath = `videos/${fileName}`;

            const { data, error } = await supabase.storage
                .from('listing-videos')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                    onUploadProgress: (progressEvent) => {
                        const percent = (progressEvent.loaded / progressEvent.total) * 100;
                        setProgress(Math.round(percent));
                    }
                });

            if (error) throw error;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('listing-videos')
                .getPublicUrl(filePath);

            setPreviewUrl(publicUrl);
            onChange(publicUrl);
            toast.success('Video uploaded successfully!');
        } catch (error) {
            console.error('Error uploading video:', error);
            toast.error('Failed to upload video');
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    const handleDelete = () => {
        setPreviewUrl('');
        onChange('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <Box>
            <input
                type="file"
                accept="video/*"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileSelect}
            />

            {!previewUrl ? (
                <Box
                    sx={{
                        border: '2px dashed',
                        borderColor: 'divider',
                        borderRadius: 2,
                        p: 4,
                        textAlign: 'center',
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
                        <Box>
                            <Typography variant="body2" gutterBottom>
                                Uploading Video... {progress}%
                            </Typography>
                            <LinearProgress variant="determinate" value={progress} />
                        </Box>
                    ) : (
                        <>
                            <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                            <Typography variant="subtitle1" fontWeight="bold">
                                Click to Upload Video
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                MP4, WebM up to {maxSize}MB
                            </Typography>
                        </>
                    )}
                </Box>
            ) : (
                <Card sx={{ position: 'relative', maxWidth: 400 }}>
                    <CardMedia
                        component="video"
                        ref={videoRef}
                        src={previewUrl}
                        sx={{ height: 240, bgcolor: 'black' }}
                        onEnded={() => setIsPlaying(false)}
                    />

                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'rgba(0,0,0,0.3)',
                            opacity: isPlaying ? 0 : 1,
                            transition: 'opacity 0.2s',
                            '&:hover': { opacity: 1 }
                        }}
                    >
                        <IconButton
                            onClick={togglePlay}
                            sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
                        >
                            {isPlaying ? <Pause /> : <PlayArrow />}
                        </IconButton>
                    </Box>

                    <IconButton
                        onClick={handleDelete}
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'rgba(255,255,255,0.8)',
                            '&:hover': { bgcolor: 'white' }
                        }}
                        size="small"
                    >
                        <Delete color="error" />
                    </IconButton>
                </Card>
            )}
        </Box>
    );
};

export default VideoUploader;
