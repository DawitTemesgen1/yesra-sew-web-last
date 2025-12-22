// Gamification & Rewards Component
import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, Typography, Box, Chip, Button, Grid,
  LinearProgress, Avatar, Dialog, DialogTitle, DialogContent,
  DialogActions, List, ListItem, ListItemText, ListItemIcon,
  Badge, Alert, Tooltip
} from '@mui/material';
import {
  EmojiEvents, Star, TrendingUp, LocalFireDepartment, WorkspacePremium,
  MilitaryTech, CardGiftcard, Leaderboard, Speed, CheckCircle
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import apiService from '../services/api';
import toast from 'react-hot-toast';

const GamificationRewards = ({ userId }) => {
  const [userStats, setUserStats] = useState({});
  const [achievements, setAchievements] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGamificationData();
  }, [userId]);

  const fetchGamificationData = async () => {
    try {
      const [statsRes, achievementsRes, rewardsRes, leaderboardRes] = await Promise.all([
        apiService.getUserGamificationStats(),
        apiService.getUserAchievements(),
        apiService.getAvailableRewards(),
        apiService.getLeaderboard()
      ]);

      setUserStats(statsRes.data || {});
      setAchievements(achievementsRes.data || []);
      setRewards(rewardsRes.data || []);
      setLeaderboard(leaderboardRes.data || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = async (rewardId) => {
    try {
      await apiService.claimReward(rewardId);
      toast.success('Reward claimed successfully!');
      fetchGamificationData();
    } catch (error) {
      toast.error('Failed to claim reward');
    }
  };

  const getUserLevel = () => {
    const points = userStats.total_points || 0;
    if (points >= 1000) return { level: 'Expert', color: 'secondary', icon: <WorkspacePremium /> };
    if (points >= 500) return { level: 'Advanced', color: 'warning', icon: <MilitaryTech /> };
    if (points >= 200) return { level: 'Regular', color: 'info', icon: <Star /> };
    return { level: 'Beginner', color: 'primary', icon: <EmojiEvents /> };
  };

  const userLevel = getUserLevel();
  const progressToNextLevel = userStats.points_to_next_level 
    ? (userStats.current_level_points / userStats.points_to_next_level) * 100
    : 100;

  if (loading) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <EmojiEvents color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Your Achievements
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Leaderboard />}
            onClick={() => setDialogOpen(true)}
            size="small"
          >
            Leaderboard
          </Button>
        </Box>

        {/* User Level & Progress */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: `${userLevel.color}.main`, mr: 2 }}>
              {userLevel.icon}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" color={userLevel.color}>
                {userLevel.level} Level
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {userStats.total_points || 0} Points
              </Typography>
            </Box>
            <Chip
              label={`#${userStats.rank || 'N/A'}`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>

          <LinearProgress
            variant="determinate"
            value={progressToNextLevel}
            sx={{ mb: 1, height: 8, borderRadius: 4 }}
          />
          <Typography variant="caption" color="text.secondary">
            {userStats.points_to_next_level - userStats.current_level_points || 0} points to next level
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'primary.light', borderRadius: 1 }}>
              <Typography variant="h6" color="primary">
                {userStats.listings_posted || 0}
              </Typography>
              <Typography variant="caption">Listings</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
              <Typography variant="h6" color="success.main">
                {userStats.sales_completed || 0}
              </Typography>
              <Typography variant="caption">Sales</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'warning.light', borderRadius: 1 }}>
              <Typography variant="h6" color="warning.main">
                {userStats.reviews_received || 0}
              </Typography>
              <Typography variant="caption">Reviews</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
              <Typography variant="h6" color="info.main">
                {userStats.days_active || 0}
              </Typography>
              <Typography variant="caption">Days Active</Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Recent Achievements */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
            <MilitaryTech sx={{ mr: 1 }} />
            Recent Achievements
          </Typography>

          {achievements.length === 0 ? (
            <Alert severity="info">
              <Typography variant="body2">
                Complete actions to unlock achievements and earn rewards!
              </Typography>
            </Alert>
          ) : (
            <Grid container spacing={1}>
              {achievements.slice(0, 4).map((achievement, index) => (
                <Grid item xs={6} sm={3} key={achievement.id}>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Tooltip title={achievement.description}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Avatar
                          sx={{
                            bgcolor: 'success.main',
                            width: 48,
                            height: 48,
                            mx: 'auto',
                            mb: 1
                          }}
                        >
                          {achievement.icon || <CheckCircle />}
                        </Avatar>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          {achievement.name}
                        </Typography>
                        <Typography variant="caption" color="success.main">
                          +{achievement.points} pts
                        </Typography>
                      </Box>
                    </Tooltip>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Available Rewards */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
            <CardGiftcard sx={{ mr: 1 }} />
            Available Rewards
          </Typography>

          <List sx={{ maxHeight: 200, overflow: 'auto' }}>
            {rewards.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary="No rewards available"
                  secondary="Earn more points to unlock rewards"
                />
              </ListItem>
            ) : (
              rewards.slice(0, 3).map((reward) => (
                <ListItem key={reward.id}>
                  <ListItemIcon>
                    <CardGiftcard color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={reward.name}
                    secondary={`${reward.points_required} points`}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleClaimReward(reward.id)}
                    disabled={(userStats.total_points || 0) < reward.points_required}
                  >
                    Claim
                  </Button>
                </ListItem>
              ))
            )}
          </List>
        </Box>

        {/* Leaderboard Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Leaderboard sx={{ mr: 1 }} />
              Community Leaderboard
            </Box>
          </DialogTitle>
          <DialogContent>
            <List>
              {leaderboard.map((user, index) => (
                <ListItem key={user.id}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: index < 3 ? 'warning.main' : 'primary.main' }}>
                      {index < 3 ? (
                        index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'
                      ) : (
                        user.rank || index + 1
                      )}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={user.name}
                    secondary={`${user.total_points} points`}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Level {user.level}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default GamificationRewards;

