import { ProfileSettings } from "@/components/profile-settings";
import { Typography } from "@/components/ui/typography";

/**
 * Settings page: manages the user's settings
 */
export const SettingsPage = () => {
  return (
    <div>
      <Typography variant="h1">Settings</Typography>
      <ProfileSettings />
    </div>
  );
};
