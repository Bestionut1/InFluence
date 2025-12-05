import { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAvatar } from '../hooks/useAvatar';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Edit2, Save, X, LogOut, User, Upload, FileText, Shield, 
  Download, Trash2, Clock, LogIn, Bell, CheckCircle 
} from 'lucide-react';
import { AppHeader } from '../components/layout/AppHeader';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../hooks/useTranslation';

export const UserProfile = () => {
  const { user, logout } = useAuth();
  const { avatar, setAvatar } = useAvatar();
  const navigate = useNavigate();
  const t = useTranslation();
  const { language, setLanguage } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const savedDisplayName = localStorage.getItem('user-display-name') || user?.displayName || '';
  const [displayName, setDisplayName] = useState(savedDisplayName);
  const [editData, setEditData] = useState({
    displayName: savedDisplayName,
  });
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  
  const handleEdit = () => {
    setEditData({ displayName: displayName });
    setIsEditMode(true);
  };

  const handleSave = () => {
    localStorage.setItem('user-display-name', editData.displayName);
    setDisplayName(editData.displayName);
    setIsEditMode(false);
    showSuccessMessage('Profile updated successfully!');
  };

  const handleCancel = () => {
    setEditData({ displayName: displayName });
    setIsEditMode(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const avatarData = reader.result as string;
        setAvatar(avatarData);
        showSuccessMessage('Avatar updated successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEmailPreferences = (enabled: boolean) => {
    setEmailNotifications(enabled);
    showSuccessMessage(`Email notifications ${enabled ? 'enabled' : 'disabled'}`);
  };

  const showSuccessMessage = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="h-screen bg-bg-dark flex flex-col overflow-hidden page-enter">
      <AppHeader showLogo showUserMenu sticky={false} />

      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="px-6 py-2 bg-teal-900/30 border-b border-teal-700 text-teal-300 flex items-center gap-2 text-sm"
        >
          <CheckCircle className="w-4 h-4" />
          {successMessage}
        </motion.div>
      )}

      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Profile Header - Compact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card>
              <CardBody className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={handleAvatarClick}
                      className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0 border-2 border-primary-400/50 hover:border-primary-300 transition-all relative group"
                      title="Click to change avatar"
                    >
                      {avatar ? (
                        <img src={avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User className="w-7 h-7 text-white" />
                      )}
                      <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="w-4 h-4 text-white" />
                      </div>
                    </motion.button>
                    <input
                      id="avatar-upload"
                      name="avatar-upload"
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    
                    <div className="flex-1 min-w-0">
                      {!isEditMode ? (
                        <>
                          <h2 className="text-lg font-bold text-white truncate">{displayName}</h2>
                          <p className="text-slate-400 text-sm truncate">{user?.email}</p>
                        </>
                      ) : (
                        <Input
                          label="Display Name"
                          value={editData.displayName}
                          onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                          placeholder="Your Name"
                        />
                      )}
                    </div>
                  </div>

                  {/* Edit/Save/Cancel Buttons */}
                  <div className="flex gap-2">
                    {!isEditMode ? (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Edit2 className="w-4 h-4" />}
                        onClick={handleEdit}
                      >
                        Edit
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="tertiary"
                          size="sm"
                          icon={<Save className="w-4 h-4" />}
                          onClick={handleSave}
                        >
                          Save
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          icon={<X className="w-4 h-4" />}
                          onClick={handleCancel}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Settings Grid - 3 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            {/* Profile Picture */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Upload className="w-4 h-4 text-primary-400" />
                    Picture
                  </h3>
                </CardHeader>
                <CardBody className="space-y-2 p-3">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full justify-center text-xs"
                    onClick={handleAvatarClick}
                  >
                    Upload
                  </Button>
                  {user?.photoURL && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full justify-center text-xs"
                      onClick={() => {
                        setAvatar(user.photoURL!);
                        showSuccessMessage('Using Google profile picture');
                      }}
                    >
                      Use Google
                    </Button>
                  )}
                </CardBody>
              </Card>
            </motion.div>

            {/* Email Preferences */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-primary-400" />
                    Notifications
                  </h3>
                </CardHeader>
                <CardBody className="p-3">
                  <div className="flex gap-2">
                    <Button
                      variant={emailNotifications ? 'primary' : 'outline'}
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => handleEmailPreferences(true)}
                    >
                      On
                    </Button>
                    <Button
                      variant={!emailNotifications ? 'danger' : 'outline'}
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => handleEmailPreferences(false)}
                    >
                      Off
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            {/* Language Preferences */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card>
                <CardHeader>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-primary-400" />
                    {t.common.language}
                  </h3>
                </CardHeader>
                <CardBody className="p-3">
                  <div className="flex gap-2">
                    <Button
                      variant={language === 'en' ? 'primary' : 'outline'}
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => {
                        setLanguage('en');
                        showSuccessMessage('Language changed to English');
                      }}
                    >
                      {t.common.english}
                    </Button>
                    <Button
                      variant={language === 'ro' ? 'primary' : 'outline'}
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => {
                        setLanguage('ro');
                        showSuccessMessage('Limba schimbată la Română');
                      }}
                    >
                      {t.common.romanian}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            {/* Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary-400" />
                    Activity
                  </h3>
                </CardHeader>
                <CardBody className="p-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <LogIn className="w-3 h-3 text-teal-400" />
                    Last login: Just now
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </div>

          {/* Bottom Actions - 2 Columns */}
          <div className="grid grid-cols-2 gap-4">
            {/* Privacy & Data */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary-400" />
                    Security
                  </h3>
                </CardHeader>
                <CardBody className="space-y-2 p-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full justify-center text-xs"
                    icon={<Download className="w-3 h-3" />}
                  >
                    Download Data
                  </Button>
                  <a href="/privacy-policy" className="block">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-center text-xs"
                      icon={<FileText className="w-3 h-3" />}
                    >
                      Privacy
                    </Button>
                  </a>
                </CardBody>
              </Card>
            </motion.div>

            {/* Account Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <LogOut className="w-4 h-4 text-primary-400" />
                    Account
                  </h3>
                </CardHeader>
                <CardBody className="space-y-2 p-3">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full justify-center text-xs"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="w-full justify-center text-xs"
                    icon={<Trash2 className="w-3 h-3" />}
                  >
                    Delete
                  </Button>
                </CardBody>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};