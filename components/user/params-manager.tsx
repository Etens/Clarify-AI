"use client";

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Button } from "../button/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../common/dialog";
import { Input } from "../common/searchbar";
import { Label } from "../common/label";
import axios from 'axios';
import { useI18n } from '@/locales/client'; 

const languages = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'French' },
];

const generateAvatarUrl = (seed: string) => {
  const eyesOptions = ["bulging", "dizzy", "eva", "frame1", "frame2", "glow", "happy", "hearts", "robocop", "round", "roundFrame01", "roundFrame02", "sensor", "shade01"];
  const mouthOptions = ["bite", "diagram", "grill01", "grill02", "grill03", "smile01", "smile02", "square01", "square02"];
  const randomEyes = eyesOptions[Math.floor(Math.random() * eyesOptions.length)];
  const randomMouth = mouthOptions[Math.floor(Math.random() * mouthOptions.length)];

  return `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${seed}&scale=50&radius=0&eyes=${randomEyes}&mouth=${randomMouth}`;
};

export function ParamsManager() {
  const { data: session, update } = useSession();
  const t = useI18n(); 
  const [name, setName] = useState<string>("");
  const [language, setLanguage] = useState<string>("en");
  const [email, setEmail] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [themePreference, setThemePreference] = useState<boolean>(false);
  const [createdAt, setCreatedAt] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (session?.user) {
      console.log("Session user data:", session.user);
      setName(session.user.name ?? "");
      setEmail(session.user.email ?? "");
      setLanguage(session.user.language ?? "en");
      setProfileImage(session.user.image ?? generateAvatarUrl(session.user.email ?? ""));
      setUsername(session.user.email?.split('@')[0] ?? "");
      setThemePreference(session.user.themePreference ?? false);
      setCreatedAt(new Date(session.user.createdAt ?? "").toLocaleDateString());
    }
  }, [session]);

  const handleSave = async () => {
    console.log("Saving with language:", language);
    try {
      const response = await axios.post('/api/auth/account', { name, language, profileImage, themePreference });
      console.log("API response:", response);
      if (response.status === 200) {
        setMessage(t('account.updated'));

        await update({
          ...session,
          trigger: "update",
          user: {
            ...(session?.user ?? {}),
            name,
            language,
            image: profileImage,
            themePreference,
          },
        });
      } else {
        setMessage(t('account.updateFailed'));
        console.error("Failed to update account");
      }
    } catch (error) {
      console.error('An error occurred while updating the account:', error);
      setMessage(t('account.error'));
    }
  };

  const generateAvatar = () => {
    const seed = `${name}-${username}`;
    setProfileImage(generateAvatarUrl(seed));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">{t('account.title')}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('account.title')}</DialogTitle>
          <DialogDescription>{t('account.description')}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4 p-4">
          <div className="flex flex-col items-center space-y-2">
            <img src={profileImage} alt="Profile" className="w-24 h-24 rounded-full" />
            <Button onClick={generateAvatar} size="sm">Generate Avatar</Button>
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="name" className="text-left">{t('account.displayName')}</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="username" className="text-left">{t('account.username')}</Label>
            <Input id="username" value={username} readOnly className="col-span-3 bg-gray-100 cursor-not-allowed" />
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="email" className="text-left">{t('account.email')}</Label>
            <Input id="email" value={email} readOnly className="col-span-3 bg-gray-100 cursor-not-allowed" />
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="createdAt" className="text-left">{t('account.createdAt')}</Label>
            <Input id="createdAt" value={createdAt} readOnly className="col-span-3 bg-gray-100 cursor-not-allowed" />
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="themePreference" className="text-left">{t('account.darkMode')}</Label>
            <input
              type="checkbox"
              id="themePreference"
              checked={themePreference}
              onChange={() => setThemePreference(!themePreference)}
              className="toggle-checkbox"
            />
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="language" className="text-left">{t('account.language')}</Label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="col-span-3 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Button
          onClick={() => signOut()}
          variant="destructive"
        >
          {t('account.logout')}
        </Button>
        <DialogFooter>
          <Button type="button" onClick={handleSave}>{t('account.save')}</Button>
        </DialogFooter>
        {message && (
          <div className={`p-4 mt-4 rounded ${message.includes("successfully") ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
            {message}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
