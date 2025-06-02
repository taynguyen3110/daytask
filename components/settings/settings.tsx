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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useSettingsStore } from "@/lib/stores/settings-store";

declare global {
  interface Window {
    onTelegramAuth: (user: any) => void;
  }
}

export function Settings() {
  const { toast } = useToast();
  const { settings, updateSettings, linkTelegram } = useSettingsStore();
  const [telegramToken, setTelegramToken] = useState(
    settings.telegramToken || ""
  );
  const [telegramChatId, setTelegramChatId] = useState(
    settings.telegramChatId || ""
  );
  const telegramRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!telegramRef.current) return;

    window.onTelegramAuth = async function (user) {
      console.log("Telegram user:", user);
      linkTelegram(user);
    };

    // Prevent re-adding the script on client navigation
    if (telegramRef.current.querySelector("script")) return;

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", "DayTask_bot");
    script.setAttribute("data-size", "large");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    script.setAttribute("data-theme", "dark");
    script.setAttribute("data-userpic", "false");
    script.async = true;

    telegramRef.current.appendChild(script);
  }, []);

  const handleSaveTelegramSettings = () => {
    updateSettings({
      ...settings,
      telegramToken,
      telegramChatId,
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </div>

      <Tabs defaultValue="notifications">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
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
                  <Label>Auto-suggest due dates</Label>
                  <p className="text-sm text-muted-foreground">
                    Suggest "Probably due in 1 day?" for tasks without due dates
                  </p>
                </div>
                <Switch
                  checked={settings.autoSuggestDueDates}
                  onCheckedChange={(checked) =>
                    handleToggleSetting("autoSuggestDueDates", checked)
                  }
                />
              </div>

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
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Telegram Notifications</CardTitle>
              <CardDescription>
                Configure Telegram bot for task reminders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="telegram-token">Telegram Bot Token</Label>
                <Input
                  id="telegram-token"
                  value={telegramToken}
                  onChange={(e) => setTelegramToken(e.target.value)}
                  placeholder="Enter your Telegram bot token"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="telegram-chat-id">Telegram Chat ID</Label>
                <Input
                  id="telegram-chat-id"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  placeholder="Enter your Telegram chat ID"
                />
              </div>

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

              {/* <a
                href={`https://t.me/DayTask_bot?start`}
                target="_blank"
                rel="noopener noreferrer"
              > */}
              <div ref={telegramRef} id="telegram-button" className=""></div>
              {/* <Button type="button" className="w-full">
                  Link Telegram Account
                </Button> */}
              {/* </a> */}
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
        </TabsContent>

        <TabsContent value="data" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Manage your task data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 items-center flex flex-col">
              <div className="flex items-center justify-between w-full">
                <div className="space-y-0.5">
                  <Label>Enable offline mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Store tasks locally for offline access
                  </p>
                </div>
                <Switch
                  checked={settings.enableOfflineMode}
                  onCheckedChange={(checked) =>
                    handleToggleSetting("enableOfflineMode", checked)
                  }
                />
              </div>

              <div className="flex flex-col items-center w-36 gap-2 mt-3">
                <Button variant="destructive">Clear All Data</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
