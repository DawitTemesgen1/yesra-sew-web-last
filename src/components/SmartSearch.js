// Simple Search Component (Placeholder until full implementation)
import React, { useState } from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';

const SmartSearch = ({ onSearch, placeholder = "Search...", enableNavigation = false, category = 'all' }) => {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setQuery(e.target.value);
        if (onSearch) {
            onSearch(e.target.value);
        }
    };

    const handleClick = () => {
        if (enableNavigation) {
            navigate(`/search?category=${category}`);
        }
    };

    return (
        <div onClick={handleClick} style={{ cursor: enableNavigation ? 'pointer' : 'default' }}>
            <TextField
                fullWidth
                value={query}
                onChange={handleChange}
                placeholder={placeholder}
                // If navigation is enabled, make input readOnly to prevent keyboard on mobile before nav
                inputProps={{ readOnly: enableNavigation }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search />
                        </InputAdornment>
                    ),
                    sx: {
                        cursor: enableNavigation ? 'pointer' : 'text'
                    }
                }}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        bgcolor: 'background.paper',
                        pointerEvents: enableNavigation ? 'none' : 'auto' // ensure click goes to div
                    }
                }}
            />
        </div>
    );
};

export default SmartSearch;
