"use client";

import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { UserTelegram } from "@/lib/types";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

declare global {
  interface Window {
    onTelegramAuth: (user: any) => void;
  }
}

export function Settings() {
  const telegramBotName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME;
  const { toast } = useToast();
  const {
    settings,
    updateSettings,
    linkTelegram,
    unlinkTelegram,
    telegramUser,
  } = useSettingsStore();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [telegramUserState, setTelegramUserState] =
    useState<UserTelegram | null>(null);
  const telegramRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!telegramRef.current) return;

    window.onTelegramAuth = async function (user) {
      linkTelegram(user);
    };

    // Prevent re-adding the script on client navigation
    if (telegramRef.current.querySelector("script")) return;

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", telegramBotName!);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    script.setAttribute("data-theme", "dark");
    script.setAttribute("data-userpic", "false");
    script.async = true;

    telegramRef.current.appendChild(script);
  }, []);

  useEffect(() => {
    setTelegramUserState(telegramUser);
  }, [telegramUser]);

  const handleSaveTelegramSettings = () => {
    updateSettings({
      ...settings,
    });

    toast({
      title: "Settings saved",
      description: "Your notification settings have been updated.",
    });
  };

  const handleToggleSetting = (key: string, value: boolean) => {
    updateSettings({
      ...settings,
      [key]: value,
    });

    toast({
      title: "Setting updated",
      description: `${key} has been ${value ? "enabled" : "disabled"}.`,
    });
  };

  const handleUnlinkTelegram = () => {
    unlinkTelegram();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </div>

      <div className="space-y-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize how DayTask looks and feels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show confetti on completion</Label>
                <p className="text-sm text-muted-foreground">
                  Show a confetti animation when all tasks are completed
                </p>
              </div>
              <Switch
                checked={settings.showConfetti}
                onCheckedChange={(checked) =>
                  handleToggleSetting("showConfetti", checked)
                }
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Telegram Notifications</CardTitle>
            <CardDescription>
              Configure Telegram bot for task reminders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Telegram notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send task reminders via Telegram
                </p>
              </div>
              <Switch
                checked={settings.enableTelegramNotifications}
                onCheckedChange={(checked) =>
                  handleToggleSetting("enableTelegramNotifications", checked)
                }
              />
            </div>
            <div className="flex justify-center">
              {!isAuthenticated ? (
                <Button
                  type="button"
                  className=""
                  variant="default"
                  onClick={() => router.push("/login")}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Login to receive Telegram Reminders
                </Button>
              ) : telegramUserState == null ? (
                <div ref={telegramRef} id="telegram-button" className=""></div>
              ) : (
                <Button
                  type="button"
                  className=""
                  onClick={handleUnlinkTelegram}
                >
                  Unlink Telegram Account
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Browser Notifications</CardTitle>
            <CardDescription>
              Configure browser notifications for task reminders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable browser notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Show browser notifications for task reminders
                </p>
              </div>
              <Switch
                checked={settings.enableBrowserNotifications}
                onCheckedChange={(checked) =>
                  handleToggleSetting("enableBrowserNotifications", checked)
                }
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Manage your task data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 items-center flex flex-col">
            <div className="flex flex-col items-center w-36 gap-2 mt-3">
              <Button variant="destructive">Clear All Data</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
