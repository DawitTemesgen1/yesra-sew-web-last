import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, TextField, Button,
  FormControlLabel, Switch, Box as MuiBox, Alert
} from '@mui/material';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

const SystemSettingsScreen = ({ t, systemSettings }) => {
  const [localSettings, setLocalSettings] = useState({
    site_maintenance: false,
    maintenance_message: "Site is under maintenance. Please check back later.",
    allow_registrations: true,
    require_email_verification: false,
    allow_social_login: true,
    require_admin_approval: false,
    allow_featured_listings: true,
    max_listings_per_user: 10,
    site_name: "YesraSew",
    site_description: "Quality Gold Marketplace for Ethiopia",
    contact_email: "info@yesrasew.com",
    phone_number: "+251 911 234 567",
    enable_caching: true,
    enable_compression: true,
    debug_mode: false,
    cache_timeout: 3600,
    enable_two_factor: true,
    force_ssl: true,
    enable_captcha: false,
    session_timeout: 30,
    // Social Media
    social_facebook: "",
    social_tiktok: "",
    social_instagram: "",
    social_linkedin: "",
    social_telegram: "",
    social_youtube: "",
    show_social_footer: true,
    // Mobile App
    mobile_ios: "",
    mobile_android: "",
    show_app_footer: true,
    // Legal
    privacy_policy: "",
    terms_conditions: ""
  });

  const [loading, setLoading] = useState(false);
  const [changedKeys, setChangedKeys] = useState(new Set());

  // Use the prop if passed from AdminDashboard
  useEffect(() => {
    if (systemSettings && Object.keys(systemSettings).length > 0) {
      // Merge incoming settings with defaults
      setLocalSettings(prev => ({
        ...prev,
        ...systemSettings
      }));
    }
  }, [systemSettings]);

  // Fallback: Fetch directly if not provided via props
  useEffect(() => {
    if (!systemSettings || Object.keys(systemSettings).length === 0) {
      const loadFresh = async () => {
        const data = await adminService.getSystemSettings();
        if (data) setLocalSettings(prev => ({ ...prev, ...data }));
      };
      loadFresh();
    }
  }, []);

  const handleChange = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
    // Mark as changed so we only save what's necessary
    setChangedKeys(prev => new Set(prev).add(key));
  };

  const handleSave = async () => {
    if (changedKeys.size === 0) {
      toast.success('No changes to save');
      return;
    }

    try {
      setLoading(true);
      // Only update keys that actually changed to avoid massive DB calls
      const updatePromises = Array.from(changedKeys).map(key =>
        adminService.updateSystemSetting(key, localSettings[key])
      );

      await Promise.all(updatePromises);
      setChangedKeys(new Set()); // Reset tracking after successful save
      toast.success(t('settingsSaved') || 'Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(t('settingsSaveError') || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('generalSettings')}
              </Typography>
              <MuiBox sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <MuiBox>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('siteMaintenance')}
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={localSettings.site_maintenance}
                        onChange={(e) => handleChange('site_maintenance', e.target.checked)}
                      />
                    }
                    label={t('siteOnline')}
                  />
                  <MuiBox sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label={t('maintenanceMessage')}
                      multiline
                      rows={2}
                      value={localSettings.maintenance_message}
                      onChange={(e) => handleChange('maintenance_message', e.target.value)}
                    />
                  </MuiBox>
                </MuiBox>

                <MuiBox>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('userRegistration')}
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={localSettings.allow_registrations}
                        onChange={(e) => handleChange('allow_registrations', e.target.checked)}
                      />
                    }
                    label={t('allowNewRegistrations')}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={localSettings.require_email_verification}
                        onChange={(e) => handleChange('require_email_verification', e.target.checked)}
                      />
                    }
                    label={t('requireEmailVerification')}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={localSettings.allow_social_login}
                        onChange={(e) => handleChange('allow_social_login', e.target.checked)}
                      />
                    }
                    label={t('allowSocialLogin')}
                  />
                </MuiBox>

                <MuiBox>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('listingSettings')}
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={localSettings.require_admin_approval}
                        onChange={(e) => handleChange('require_admin_approval', e.target.checked)}
                      />
                    }
                    label={t('requireAdminApproval')}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={localSettings.allow_featured_listings}
                        onChange={(e) => handleChange('allow_featured_listings', e.target.checked)}
                      />
                    }
                    label={t('allowFeaturedListings')}
                  />
                  <MuiBox sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label={t('maxListingsPerUser')}
                      type="number"
                      value={localSettings.max_listings_per_user}
                      onChange={(e) => handleChange('max_listings_per_user', parseInt(e.target.value))}
                    />
                  </MuiBox>
                </MuiBox>

                <MuiBox>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('siteInformation')}
                  </Typography>
                  <TextField
                    fullWidth
                    label={t('siteName')}
                    value={localSettings.site_name}
                    onChange={(e) => handleChange('site_name', e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label={t('siteDescription')}
                    value={localSettings.site_description}
                    onChange={(e) => handleChange('site_description', e.target.value)}
                  />
                  <TextField
                    fullWidth
                    label={t('contactEmail')}
                    type="email"
                    value={localSettings.contact_email}
                    onChange={(e) => handleChange('contact_email', e.target.value)}
                    sx={{ mt: 2 }}
                  />
                  <TextField
                    fullWidth
                    label={t('phoneNumber')}
                    value={localSettings.phone_number}
                    onChange={(e) => handleChange('phone_number', e.target.value)}
                    sx={{ mt: 2 }}
                  />
                </MuiBox>

                <MuiBox sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
                  <Typography variant="subtitle2" gutterBottom>Social Media & Links</Typography>
                  <FormControlLabel control={<Switch checked={localSettings.show_social_footer} onChange={(e) => handleChange('show_social_footer', e.target.checked)} />} label="Show Social Links in Footer" />
                  {localSettings.show_social_footer && (
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={12} sm={6}><TextField fullWidth label="Facebook URL" value={localSettings.social_facebook} onChange={(e) => handleChange('social_facebook', e.target.value)} size="small" /></Grid>
                      <Grid item xs={12} sm={6}><TextField fullWidth label="TikTok URL" value={localSettings.social_tiktok} onChange={(e) => handleChange('social_tiktok', e.target.value)} size="small" /></Grid>
                      <Grid item xs={12} sm={6}><TextField fullWidth label="Instagram URL" value={localSettings.social_instagram} onChange={(e) => handleChange('social_instagram', e.target.value)} size="small" /></Grid>
                      <Grid item xs={12} sm={6}><TextField fullWidth label="LinkedIn URL" value={localSettings.social_linkedin} onChange={(e) => handleChange('social_linkedin', e.target.value)} size="small" /></Grid>
                      <Grid item xs={12} sm={6}><TextField fullWidth label="Telegram URL" value={localSettings.social_telegram} onChange={(e) => handleChange('social_telegram', e.target.value)} size="small" /></Grid>
                      <Grid item xs={12} sm={6}><TextField fullWidth label="YouTube URL" value={localSettings.social_youtube} onChange={(e) => handleChange('social_youtube', e.target.value)} size="small" /></Grid>
                    </Grid>
                  )}
                </MuiBox>

                <MuiBox sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
                  <Typography variant="subtitle2" gutterBottom>Mobile Apps</Typography>
                  <FormControlLabel control={<Switch checked={localSettings.show_app_footer} onChange={(e) => handleChange('show_app_footer', e.target.checked)} />} label="Show App Links in Footer" />
                  {localSettings.show_app_footer && (
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={12}><TextField fullWidth label="iOS App Store URL" value={localSettings.mobile_ios} onChange={(e) => handleChange('mobile_ios', e.target.value)} size="small" /></Grid>
                      <Grid item xs={12}><TextField fullWidth label="Android Play Store URL" value={localSettings.mobile_android} onChange={(e) => handleChange('mobile_android', e.target.value)} size="small" /></Grid>
                    </Grid>
                  )}
                </MuiBox>

                <MuiBox sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider', mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>Legal Documents</Typography>
                  <TextField fullWidth multiline rows={4} label="Privacy Policy" value={localSettings.privacy_policy} onChange={(e) => handleChange('privacy_policy', e.target.value)} sx={{ mb: 2 }} />
                  <TextField fullWidth multiline rows={4} label="Terms & Conditions" value={localSettings.terms_conditions} onChange={(e) => handleChange('terms_conditions', e.target.value)} />
                </MuiBox>

                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? t('saving') || 'Saving...' : t('saveSettings')}
                </Button>
              </MuiBox>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('systemInfo')}
              </Typography>
              <MuiBox sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <MuiBox>
                  <Typography variant="body2" color="text.secondary">
                    {t('serverStatus')}
                  </Typography>
                  <Typography variant="body2" component="span" sx={{ ml: 1, color: 'success.main', fontWeight: 'bold' }}>
                    Online
                  </Typography>
                </MuiBox>
                <MuiBox>
                  <Typography variant="body2" color="text.secondary">
                    {t('databaseStatus')}
                  </Typography>
                  <Typography variant="body2" component="span" sx={{ ml: 1, color: 'success.main', fontWeight: 'bold' }}>
                    Connected
                  </Typography>
                </MuiBox>
                <MuiBox>
                  <Typography variant="body2" color="text.secondary">
                    {t('lastBackup')}
                  </Typography>
                  <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                    2 hours ago
                  </Typography>
                </MuiBox>
                <MuiBox>
                  <Typography variant="body2" color="text.secondary">
                    {t('storageUsed')}
                  </Typography>
                  <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                    2.3 GB / 10 GB
                  </Typography>
                </MuiBox>
                <MuiBox>
                  <Typography variant="body2" color="text.secondary">
                    {t('systemVersion')}
                  </Typography>
                  <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                    v2.1.0
                  </Typography>
                </MuiBox>
                <MuiBox>
                  <Typography variant="body2" color="text.secondary">
                    {t('uptime')}
                  </Typography>
                  <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                    45 days, 12 hours
                  </Typography>
                </MuiBox>
              </MuiBox>
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('performanceSettings')}
              </Typography>
              <MuiBox sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={localSettings.enable_caching}
                      onChange={(e) => handleChange('enable_caching', e.target.checked)}
                    />
                  }
                  label={t('enableCaching')}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={localSettings.enable_compression}
                      onChange={(e) => handleChange('enable_compression', e.target.checked)}
                    />
                  }
                  label={t('enableCompression')}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={localSettings.debug_mode}
                      onChange={(e) => handleChange('debug_mode', e.target.checked)}
                    />
                  }
                  label={t('debugMode')}
                />
                <MuiBox sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label={t('cacheTimeout')}
                    type="number"
                    value={localSettings.cache_timeout}
                    onChange={(e) => handleChange('cache_timeout', parseInt(e.target.value))}
                    helperText={t('seconds')}
                  />
                </MuiBox>
              </MuiBox>
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('securitySettings')}
              </Typography>
              <MuiBox sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={localSettings.enable_two_factor}
                      onChange={(e) => handleChange('enable_two_factor', e.target.checked)}
                    />
                  }
                  label={t('enableTwoFactor')}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={localSettings.force_ssl}
                      onChange={(e) => handleChange('force_ssl', e.target.checked)}
                    />
                  }
                  label={t('forceSSL')}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={localSettings.enable_captcha}
                      onChange={(e) => handleChange('enable_captcha', e.target.checked)}
                    />
                  }
                  label={t('enableCaptcha')}
                />
                <MuiBox sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label={t('sessionTimeout')}
                    type="number"
                    value={localSettings.session_timeout}
                    onChange={(e) => handleChange('session_timeout', parseInt(e.target.value))}
                    helperText={t('minutes')}
                  />
                </MuiBox>
              </MuiBox>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SystemSettingsScreen;
