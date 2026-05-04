'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2 } from 'lucide-react';

interface Settings {
  id: string;
  referralBonus: number;
  minWithdrawal: number;
  jazzCashNumber: string;
  siteName: string;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => setSettings(data))
      .catch(() => {});
  }, []);

  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      setSettings(data);
      toast({ title: 'Settings saved!', description: 'Your changes have been applied.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to save settings', variant: 'destructive' });
    }
    setSaving(false);
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Site Settings</CardTitle>
          <CardDescription className="text-gray-500">Configure your EarnPro platform settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-gray-300">Site Name</Label>
            <Input
              value={settings.siteName}
              onChange={e => setSettings({ ...settings, siteName: e.target.value })}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Referral Bonus (PKR)</Label>
            <Input
              type="number"
              value={settings.referralBonus}
              onChange={e => setSettings({ ...settings, referralBonus: parseInt(e.target.value) || 0 })}
              className="bg-gray-800 border-gray-700 text-white"
            />
            <p className="text-gray-600 text-sm">Amount given to referrer for each new signup</p>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Minimum Withdrawal (PKR)</Label>
            <Input
              type="number"
              value={settings.minWithdrawal}
              onChange={e => setSettings({ ...settings, minWithdrawal: parseInt(e.target.value) || 0 })}
              className="bg-gray-800 border-gray-700 text-white"
            />
            <p className="text-gray-600 text-sm">Minimum balance required to request withdrawal</p>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">JazzCash Number</Label>
            <Input
              value={settings.jazzCashNumber}
              onChange={e => setSettings({ ...settings, jazzCashNumber: e.target.value })}
              className="bg-gray-800 border-gray-700 text-white"
            />
            <p className="text-gray-600 text-sm">Default JazzCash number for payments</p>
          </div>
          <Button onClick={saveSettings} disabled={saving} className="bg-emerald-500 hover:bg-emerald-600 text-white">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
