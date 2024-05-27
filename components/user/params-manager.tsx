import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from "../button/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../common/dialog";
import { Input } from "../common/searchbar";
import { Label } from "../common/label";
import axios from 'axios';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ru', name: 'Russian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ar', name: 'Arabic' },
];

export function ParamsManager() {
  const { data: session, status, update } = useSession();
  const [name, setName] = useState<string>("");
  const [language, setLanguage] = useState<string>("en");
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name ?? "");
      setEmail(session.user.email ?? "");
      setLanguage(session.user.language ?? "en");
    }
  }, [session]);

  const handleSave = async () => {
    try {
      const response = await axios.post('/api/profile', {
        name,
        language,
      });
      if (response.status === 200) {
        setMessage("Profile updated successfully!");

        // Update session with new user data
        await update({
          ...(session || {}),
          user: {
            ...(session?.user || {}),
            name,
            language,
          },
        });

      } else {
        setMessage("Failed to update profile.");
      }
    } catch (error: any) {
      console.error('An error occurred while updating the profile:', error);
      setMessage("An error occurred while updating the profile.");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4 p-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="name" className="text-left">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="email" className="text-left">Email</Label>
            <Input id="email" value={email} readOnly className="col-span-3 bg-gray-100 cursor-not-allowed" />
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="language" className="text-left">Language</Label>
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
        <DialogFooter>
          <Button type="button" onClick={handleSave}>Save changes</Button>
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
