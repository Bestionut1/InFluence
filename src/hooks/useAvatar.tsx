import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

const AVATAR_STORAGE_KEY = 'user-avatar';

export const useAvatar = () => {
  const { user } = useAuth();
  const [avatar, setAvatarState] = useState<string | null>(null);

  useEffect(() => {
    // Load avatar from localStorage first
    const savedAvatar = localStorage.getItem(AVATAR_STORAGE_KEY);
    if (savedAvatar) {
      setAvatarState(savedAvatar);
    } else if (user?.photoURL) {
      // Fall back to Google profile picture
      setAvatarState(user.photoURL);
    }
  }, [user?.photoURL]);

  const setAvatar = (avatarUrl: string | null) => {
    if (avatarUrl) {
      localStorage.setItem(AVATAR_STORAGE_KEY, avatarUrl);
      setAvatarState(avatarUrl);
    } else {
      localStorage.removeItem(AVATAR_STORAGE_KEY);
      setAvatarState(user?.photoURL || null);
    }
  };

  const clearCustomAvatar = () => {
    localStorage.removeItem(AVATAR_STORAGE_KEY);
    setAvatarState(user?.photoURL || null);
  };

  return { avatar, setAvatar, clearCustomAvatar };
};
