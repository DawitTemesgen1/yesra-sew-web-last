import React, { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    IconButton,
    Box,
    Typography,
    Fade,
    useTheme,
    useMediaQuery,
    Zoom
} from '@mui/material';
import {
    Close,
    ZoomIn,
    ZoomOut,
    ChevronLeft,
    ChevronRight,
    ZoomOutMap,
    Download
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { alpha } from '@mui/material/styles';

const ImageViewer = ({ open, images, initialIndex = 0, onClose }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [showControls, setShowControls] = useState(true);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Reset state when image changes
    useEffect(() => {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
        setImageLoaded(false);
    }, [currentIndex]);

    // Update index when initialIndex changes
    useEffect(() => {
        setCurrentIndex(initialIndex);
    }, [initialIndex]);

    // Keyboard navigation
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                    handlePrevious();
                    break;
                case 'ArrowRight':
                    handleNext();
                    break;
                case 'Escape':
                    onClose();
                    break;
                case '+':
                case '=':
                    handleZoomIn();
                    break;
                case '-':
                    handleZoomOut();
                    break;
                case '0':
                    handleResetZoom();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, currentIndex, zoom]);

    // Auto-hide controls
    useEffect(() => {
        if (!open) return;

        let timeout;
        const resetTimeout = () => {
            setShowControls(true);
            clearTimeout(timeout);
            timeout = setTimeout(() => setShowControls(false), 3000);
        };

        resetTimeout();
        window.addEventListener('mousemove', resetTimeout);
        window.addEventListener('touchstart', resetTimeout);

        return () => {
            clearTimeout(timeout);
            window.removeEventListener('mousemove', resetTimeout);
            window.removeEventListener('touchstart', resetTimeout);
        };
    }, [open]);

    const handleNext = useCallback(() => {
        if (images.length > 1) {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }
    }, [images.length]);

    const handlePrevious = useCallback(() => {
        if (images.length > 1) {
            setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        }
    }, [images.length]);

    const handleZoomIn = () => {
        setZoom((prev) => Math.min(prev + 0.5, 5));
    };

    const handleZoomOut = () => {
        setZoom((prev) => Math.max(prev - 0.5, 1));
        if (zoom <= 1.5) {
            setPosition({ x: 0, y: 0 });
        }
    };

    const handleResetZoom = () => {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
    };

    const handleDownload = async () => {
        try {
            const response = await fetch(images[currentIndex]);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `image-${currentIndex + 1}.jpg`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    // Mouse drag handlers
    const handleMouseDown = (e) => {
        if (zoom > 1) {
            setIsDragging(true);
            setDragStart({
                x: e.clientX - position.x,
                y: e.clientY - position.y
            });
        }
    };

    const handleMouseMove = (e) => {
        if (isDragging && zoom > 1) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Touch handlers for mobile
    const handleTouchStart = (e) => {
        if (e.touches.length === 2) {
            // Pinch to zoom - store initial distance
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
            setDragStart({ ...dragStart, pinchDistance: distance });
        } else if (zoom > 1 && e.touches.length === 1) {
            // Pan when zoomed
            setIsDragging(true);
            setDragStart({
                x: e.touches[0].clientX - position.x,
                y: e.touches[0].clientY - position.y,
                touchStartX: e.touches[0].clientX
            });
        } else if (zoom === 1 && e.touches.length === 1) {
            // Swipe to navigate
            setDragStart({
                touchStartX: e.touches[0].clientX,
                touchStartY: e.touches[0].clientY,
                swipeStartTime: Date.now()
            });
        }
    };

    const handleTouchMove = (e) => {
        if (e.touches.length === 2) {
            // Pinch to zoom
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );

            if (dragStart.pinchDistance) {
                const scale = distance / dragStart.pinchDistance;
                const newZoom = Math.max(1, Math.min(5, zoom * scale));
                setZoom(newZoom);
                setDragStart({ ...dragStart, pinchDistance: distance });
            }
        } else if (isDragging && zoom > 1 && e.touches.length === 1) {
            // Pan when zoomed
            setPosition({
                x: e.touches[0].clientX - dragStart.x,
                y: e.touches[0].clientY - dragStart.y
            });
        }
    };

    const handleTouchEnd = (e) => {
        if (e.changedTouches.length === 1 && zoom === 1 && dragStart.touchStartX) {
            // Swipe gesture detection
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const deltaX = touchEndX - dragStart.touchStartX;
            const deltaY = Math.abs(touchEndY - dragStart.touchStartY);
            const swipeDuration = Date.now() - dragStart.swipeStartTime;

            // Swipe threshold: 50px horizontal movement, less than 100px vertical, within 300ms
            if (Math.abs(deltaX) > 50 && deltaY < 100 && swipeDuration < 300) {
                if (deltaX > 0) {
                    handlePrevious(); // Swipe right
                } else {
                    handleNext(); // Swipe left
                }
            }
        }

        setIsDragging(false);
        setDragStart({});
    };

    if (!images || images.length === 0) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={false}
            fullScreen
            PaperProps={{
                sx: {
                    bgcolor: 'rgba(0, 0, 0, 0.95)',
                    backgroundImage: 'none'
                }
            }}
            TransitionComponent={Fade}
            transitionDuration={300}
        >
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    height: '100vh',
                    overflow: 'hidden',
                    cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Top Controls Bar */}
                <Fade in={showControls}>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            zIndex: 2,
                            background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)',
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                            {currentIndex + 1} / {images.length}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                                onClick={handleDownload}
                                sx={{
                                    color: 'white',
                                    bgcolor: alpha('#fff', 0.1),
                                    '&:hover': { bgcolor: alpha('#fff', 0.2) }
                                }}
                            >
                                <Download />
                            </IconButton>
                            <IconButton
                                onClick={onClose}
                                sx={{
                                    color: 'white',
                                    bgcolor: alpha('#fff', 0.1),
                                    '&:hover': { bgcolor: alpha('#fff', 0.2) }
                                }}
                            >
                                <Close />
                            </IconButton>
                        </Box>
                    </Box>
                </Fade>

                {/* Main Image Container */}
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: isMobile ? 2 : 8
                    }}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                            style={{
                                position: 'relative',
                                maxWidth: '100%',
                                maxHeight: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Box
                                component="img"
                                src={images[currentIndex]}
                                alt={`Image ${currentIndex + 1}`}
                                onLoad={() => setImageLoaded(true)}
                                sx={{
                                    maxWidth: zoom === 1 ? '100%' : 'none',
                                    maxHeight: zoom === 1 ? '100%' : 'none',
                                    width: zoom > 1 ? `${zoom * 100}%` : 'auto',
                                    height: 'auto',
                                    objectFit: 'contain',
                                    transform: `translate(${position.x}px, ${position.y}px)`,
                                    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                                    userSelect: 'none',
                                    pointerEvents: 'none'
                                }}
                            />
                        </motion.div>
                    </AnimatePresence>

                    {!imageLoaded && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)'
                            }}
                        >
                            <Typography variant="h6" sx={{ color: 'white' }}>
                                Loading...
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        <Fade in={showControls}>
                            <IconButton
                                onClick={handlePrevious}
                                sx={{
                                    position: 'absolute',
                                    left: isMobile ? 8 : 24,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    zIndex: 2,
                                    bgcolor: alpha('#fff', 0.1),
                                    color: 'white',
                                    width: isMobile ? 40 : 56,
                                    height: isMobile ? 40 : 56,
                                    '&:hover': {
                                        bgcolor: alpha('#fff', 0.2),
                                        transform: 'translateY(-50%) scale(1.1)'
                                    },
                                    transition: 'all 0.2s'
                                }}
                            >
                                <ChevronLeft fontSize={isMobile ? 'medium' : 'large'} />
                            </IconButton>
                        </Fade>

                        <Fade in={showControls}>
                            <IconButton
                                onClick={handleNext}
                                sx={{
                                    position: 'absolute',
                                    right: isMobile ? 8 : 24,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    zIndex: 2,
                                    bgcolor: alpha('#fff', 0.1),
                                    color: 'white',
                                    width: isMobile ? 40 : 56,
                                    height: isMobile ? 40 : 56,
                                    '&:hover': {
                                        bgcolor: alpha('#fff', 0.2),
                                        transform: 'translateY(-50%) scale(1.1)'
                                    },
                                    transition: 'all 0.2s'
                                }}
                            >
                                <ChevronRight fontSize={isMobile ? 'medium' : 'large'} />
                            </IconButton>
                        </Fade>
                    </>
                )}

                {/* Bottom Controls - Zoom */}
                <Fade in={showControls}>
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            zIndex: 2,
                            background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, transparent 100%)',
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1
                        }}
                    >
                        <IconButton
                            onClick={handleZoomOut}
                            disabled={zoom <= 1}
                            sx={{
                                color: 'white',
                                bgcolor: alpha('#fff', 0.1),
                                '&:hover': { bgcolor: alpha('#fff', 0.2) },
                                '&:disabled': { opacity: 0.3 }
                            }}
                        >
                            <ZoomOut />
                        </IconButton>

                        <Typography
                            variant="body1"
                            sx={{
                                color: 'white',
                                minWidth: 60,
                                textAlign: 'center',
                                fontWeight: 600
                            }}
                        >
                            {Math.round(zoom * 100)}%
                        </Typography>

                        <IconButton
                            onClick={handleZoomIn}
                            disabled={zoom >= 5}
                            sx={{
                                color: 'white',
                                bgcolor: alpha('#fff', 0.1),
                                '&:hover': { bgcolor: alpha('#fff', 0.2) },
                                '&:disabled': { opacity: 0.3 }
                            }}
                        >
                            <ZoomIn />
                        </IconButton>

                        <IconButton
                            onClick={handleResetZoom}
                            disabled={zoom === 1}
                            sx={{
                                color: 'white',
                                bgcolor: alpha('#fff', 0.1),
                                '&:hover': { bgcolor: alpha('#fff', 0.2) },
                                '&:disabled': { opacity: 0.3 },
                                ml: 1
                            }}
                        >
                            <ZoomOutMap />
                        </IconButton>
                    </Box>
                </Fade>

                {/* Thumbnail Strip */}
                {images.length > 1 && !isMobile && (
                    <Fade in={showControls}>
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 80,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                zIndex: 2,
                                display: 'flex',
                                gap: 1,
                                p: 1,
                                bgcolor: alpha('#000', 0.5),
                                borderRadius: 2,
                                maxWidth: '80%',
                                overflowX: 'auto',
                                '&::-webkit-scrollbar': {
                                    height: 4
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    bgcolor: alpha('#fff', 0.3),
                                    borderRadius: 2
                                }
                            }}
                        >
                            {images.map((img, idx) => (
                                <Box
                                    key={idx}
                                    component="img"
                                    src={img}
                                    onClick={() => setCurrentIndex(idx)}
                                    sx={{
                                        width: 60,
                                        height: 60,
                                        objectFit: 'cover',
                                        borderRadius: 1,
                                        cursor: 'pointer',
                                        border: currentIndex === idx ? '2px solid white' : '2px solid transparent',
                                        opacity: currentIndex === idx ? 1 : 0.6,
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            opacity: 1,
                                            transform: 'scale(1.1)'
                                        }
                                    }}
                                />
                            ))}
                        </Box>
                    </Fade>
                )}
            </Box>
        </Dialog>
    );
};

export default ImageViewer;
