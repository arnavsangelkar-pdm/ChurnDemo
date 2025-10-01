"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAppStore } from "@/lib/store"
import { Settings, RotateCcw, DollarSign, AlertTriangle, Activity } from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
  const { isLiveMode, setLiveMode } = useAppStore()
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [resetting, setResetting] = useState(false)

  // Settings state
  const [settings, setSettings] = useState({
    currency: "USD",
    riskThreshold: 70,
    emailNotifications: true,
    realTimeMode: isLiveMode,
    autoRefresh: true,
    refreshInterval: 30,
    dataRetention: 90,
    maxCustomers: 1000
  })

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    
    if (key === 'realTimeMode') {
      setLiveMode(value)
    }
  }

  const handleResetDemoData = async () => {
    try {
      setResetting(true)
      
      // Simulate reset delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Reset settings to defaults
      setSettings({
        currency: "USD",
        riskThreshold: 70,
        emailNotifications: true,
        realTimeMode: true,
        autoRefresh: true,
        refreshInterval: 30,
        dataRetention: 90,
        maxCustomers: 1000
      })
      
      setLiveMode(true)
      setIsResetDialogOpen(false)
      toast.success("Demo data reset successfully")
    } catch (error) {
      toast.error("Failed to reset demo data")
      console.error("Error resetting demo data:", error)
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure your retention platform preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>General</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={settings.currency} onValueChange={(value) => handleSettingChange('currency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="CAD">CAD (C$)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="riskThreshold">Risk Threshold</Label>
              <div className="space-y-2">
                <Slider
                  value={[settings.riskThreshold]}
                  onValueChange={(value) => handleSettingChange('riskThreshold', value[0])}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Low Risk (0)</span>
                  <span className="font-medium">{settings.riskThreshold}</span>
                  <span>High Risk (100)</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxCustomers">Max Customers to Display</Label>
              <Input
                id="maxCustomers"
                type="number"
                min="100"
                max="10000"
                value={settings.maxCustomers}
                onChange={(e) => handleSettingChange('maxCustomers', parseInt(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Real-time Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Real-time Updates</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="realTimeMode">Real-time Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Enable live updates and activity feed
                </p>
              </div>
              <Switch
                id="realTimeMode"
                checked={settings.realTimeMode}
                onCheckedChange={(checked) => handleSettingChange('realTimeMode', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoRefresh">Auto Refresh</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically refresh data
                </p>
              </div>
              <Switch
                id="autoRefresh"
                checked={settings.autoRefresh}
                onCheckedChange={(checked) => handleSettingChange('autoRefresh', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="refreshInterval">Refresh Interval (seconds)</Label>
              <div className="space-y-2">
                <Slider
                  value={[settings.refreshInterval]}
                  onValueChange={(value) => handleSettingChange('refreshInterval', value[0])}
                  max={300}
                  min={10}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>10s</span>
                  <span className="font-medium">{settings.refreshInterval}s</span>
                  <span>5m</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email alerts for high-risk customers
                </p>
              </div>
              <Switch
                id="emailNotifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Data Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="dataRetention">Data Retention (days)</Label>
              <Input
                id="dataRetention"
                type="number"
                min="30"
                max="365"
                value={settings.dataRetention}
                onChange={(e) => handleSettingChange('dataRetention', parseInt(e.target.value))}
              />
            </div>

            <div className="pt-4 border-t">
              <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Demo Data
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reset Demo Data</DialogTitle>
                    <DialogDescription>
                      This will reset all demo data to its initial state. This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleResetDemoData}
                      disabled={resetting}
                    >
                      {resetting ? "Resetting..." : "Reset Data"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Settings */}
      <div className="flex justify-end">
        <Button onClick={() => toast.success("Settings saved successfully")}>
          Save Settings
        </Button>
      </div>
    </div>
  )
}
