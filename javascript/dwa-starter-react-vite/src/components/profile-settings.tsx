import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Typography } from "./ui/typography";
import { useWeb5 } from "@/web5";
import { profile } from "@/web5/protocols";
import { drlReadProtocolJson, drlReadProtocolUrl } from "@/web5/drls";
import { toastError, toastSuccess } from "@/lib/utils";
import { Loader2Icon, UserIcon } from "lucide-react";
import { Label } from "./ui/label";

export const ProfileSettings = () => {
  const { dwn, did } = useWeb5();
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [hasProfileName, setHasProfileName] = useState(false);
  const [avatarFileInput, setAvatarInput] = useState<File | undefined>();
  const [avatarLoadError, setAvatarLoadError] = useState<string | undefined>();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (did) {
      loadProfile();
    }
  }, [did]);

  if (!dwn || !did) {
    return <>Web5 not initialized</>;
  }

  const loadProfile = async () => {
    try {
      const profileRecord = await drlReadProtocolJson(did, profile.uri, "name");
      // console.info({ profileRecord }); // TODO: remove
      setDisplayName(profileRecord?.displayName);
      setHasProfileName(true);
    } catch (e) {
      console.info("fail to load profile, it's ok if it's not found", e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    setAvatarInput(file);
    setIsUpdated(true);
  };

  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (displayName === e.target.value) {
      return;
    }
    setDisplayName(e.target.value);
    setIsUpdated(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await dwn.records.create({
        data: {
          displayName,
        },
        message: {
          published: true,
          recipient: did,
          schema: profile.schemas.name,
          dataFormat: "application/json",
          protocol: profile.uri,
          protocolPath: "name",
        },
      });

      console.info({ res });
      res.record?.send();

      await setProfileImage();

      setIsUpdated(false);
      toastSuccess("Profile updated");
    } catch (e) {
      console.error(e);
      toastError("There was a problem saving your profile info", e);
    }

    setIsLoading(false);
  };

  const setProfileImage = async () => {
    const file = avatarFileInput;
    if (!file) {
      return;
    }

    let record;
    const blob = file ? new Blob([file], { type: file.type }) : undefined;
    try {
      if (blob) {
        record = await createAvatarImage(blob);
      }
    } catch (e) {
      console.log(e);
      toastError("There was a problem saving your profile image", e);
    }
    return record;
  };

  const createAvatarImage = async (blob: Blob) => {
    const { record, status } = await dwn.records.create({
      data: blob,
      message: {
        published: true,
        recipient: did,
        dataFormat: blob.type,
        protocol: profile.uri,
        protocolPath: "avatar",
      },
    });

    console.info({ record, status });
    record?.send();

    return record;
  };

  return (
    <>
      <Typography variant="h2" className="my-4">
        My Profile Settings
      </Typography>
      <form onSubmit={handleSubmit}>
        <div className="flex gap-4 items-center m-4">
          <div className="relative w-32 h-32">
            {avatarFileInput ? (
              <img
                src={URL.createObjectURL(avatarFileInput)}
                alt="Avatar"
                className="rounded-full w-full h-full object-cover cursor-pointer"
                onClick={() => avatarInputRef.current?.click()}
              />
            ) : hasProfileName && !avatarLoadError ? (
              <img
                src={drlReadProtocolUrl(did, profile.uri, "avatar")}
                alt="Avatar"
                onError={(e) => setAvatarLoadError(e.type)}
                className="rounded-full w-full h-full object-cover cursor-pointer"
                onClick={() => avatarInputRef.current?.click()}
              />
            ) : (
              <div
                className="rounded-full w-full h-full object-cover cursor-pointer"
                onClick={() => avatarInputRef.current?.click()}
              >
                <UserIcon className="w-full h-full" />
              </div>
            )}
            <Input
              type="file"
              id="avatar"
              className="hidden"
              ref={avatarInputRef}
              onChange={handleFileChange}
            />
          </div>
          <div>
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              placeholder="John Smith"
              value={displayName}
              required
              onChange={handleDisplayNameChange}
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="text-right">
          <Button type="submit" disabled={!isUpdated || isLoading}>
            Save{" "}
            {isLoading ? (
              <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
          </Button>
        </div>
      </form>
    </>
  );
};
