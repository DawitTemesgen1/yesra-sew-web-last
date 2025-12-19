import React, { useEffect, useState } from 'react';
import { Box, LinearProgress } from '@mui/material';

const RouteLoader = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((oldProgress) => {
                if (oldProgress === 100) {
                    return 0;
                }
                const diff = Math.random() * 10;
                return Math.min(oldProgress + diff, 90);
            });
        }, 200);

        return () => {
            clearInterval(timer);
        };
    }, []);

    return (
        <Box sx={{ width: '100%', position: 'fixed', top: 0, left: 0, zIndex: 9999 }}>
            <LinearProgress
                variant="determinate"
                value={progress}
                color="secondary"
                sx={{ height: 3, bgcolor: 'transparent' }}
            />
        </Box>
    );
};

export default RouteLoader;
