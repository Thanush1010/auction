import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Settings, ArrowRight, RotateCcw, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Configuration() {
  const navigate = useNavigate();
  const [config, setConfig] = useState({
    num_teams: 8,
    purse_amount: 100,
    slots_per_team: 25,
  });
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await axios.get(`${API}/config`);
      if (response.data) {
        setConfig({
          num_teams: response.data.num_teams || 8,
          purse_amount: response.data.purse_amount || 100,
          slots_per_team: response.data.slots_per_team || 25,
        });
        setIsConfigured(response.data.is_configured || false);
      }
    } catch (error) {
      console.error("Error fetching config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (config.num_teams < 2 || config.num_teams > 20) {
      toast.error("Number of teams must be between 2 and 20");
      return;
    }
    if (config.purse_amount <= 0) {
      toast.error("Purse amount must be greater than 0");
      return;
    }
    if (config.slots_per_team < 1 || config.slots_per_team > 50) {
      toast.error("Slots per team must be between 1 and 50");
      return;
    }

    setSaving(true);
    try {
      await axios.post(`${API}/config`, config);
      toast.success("Configuration saved successfully!");
      setIsConfigured(true);
      navigate("/teams");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      await axios.delete(`${API}/config/reset`);
      setConfig({ num_teams: 8, purse_amount: 100, slots_per_team: 25 });
      setIsConfigured(false);
      toast.success("Auction reset successfully!");
    } catch (error) {
      toast.error("Failed to reset auction");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-[#007AFF] flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white" style={{ fontFamily: 'Barlow Condensed' }}>
              AUCTION CONFIGURATION
            </h1>
            <p className="text-sm text-[#A3A3A3] tracking-wider uppercase">Step 1: Setup auction parameters</p>
          </div>
        </div>
      </div>

      {/* Config Form */}
      <div className="bg-[#141414] border border-white/10 p-8">
        <div className="space-y-6">
          {/* Number of Teams */}
          <div className="space-y-2">
            <Label htmlFor="num_teams" className="text-xs tracking-widest uppercase text-[#A3A3A3]">
              Number of Teams
            </Label>
            <Input
              id="num_teams"
              data-testid="input-num-teams"
              type="number"
              min={2}
              max={20}
              value={config.num_teams}
              onChange={(e) => setConfig({ ...config, num_teams: parseInt(e.target.value) || 2 })}
              className="bg-[#0A0A0A] border-white/10 text-white text-2xl font-bold h-14 focus:border-[#007AFF]"
              style={{ fontFamily: 'Barlow Condensed' }}
            />
            <p className="text-xs text-[#A3A3A3]">Minimum 2, Maximum 20 teams</p>
          </div>

          {/* Purse Amount */}
          <div className="space-y-2">
            <Label htmlFor="purse_amount" className="text-xs tracking-widest uppercase text-[#A3A3A3]">
              Purse Amount (in Crores)
            </Label>
            <div className="relative">
              <Input
                id="purse_amount"
                data-testid="input-purse-amount"
                type="number"
                min={1}
                step={0.1}
                value={config.purse_amount}
                onChange={(e) => setConfig({ ...config, purse_amount: parseFloat(e.target.value) || 1 })}
                className="bg-[#0A0A0A] border-white/10 text-white text-2xl font-bold h-14 pr-16 focus:border-[#007AFF]"
                style={{ fontFamily: 'Barlow Condensed' }}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A3A3A3] font-bold">CR</span>
            </div>
            <p className="text-xs text-[#A3A3A3]">Budget allocated to each team</p>
          </div>

          {/* Slots per Team */}
          <div className="space-y-2">
            <Label htmlFor="slots_per_team" className="text-xs tracking-widest uppercase text-[#A3A3A3]">
              Slots per Team
            </Label>
            <Input
              id="slots_per_team"
              data-testid="input-slots-per-team"
              type="number"
              min={1}
              max={50}
              value={config.slots_per_team}
              onChange={(e) => setConfig({ ...config, slots_per_team: parseInt(e.target.value) || 1 })}
              className="bg-[#0A0A0A] border-white/10 text-white text-2xl font-bold h-14 focus:border-[#007AFF]"
              style={{ fontFamily: 'Barlow Condensed' }}
            />
            <p className="text-xs text-[#A3A3A3]">Maximum players each team can acquire</p>
          </div>
        </div>

        {/* Summary Box */}
        <div className="mt-8 p-4 bg-[#1F1F1F] border border-white/10">
          <p className="text-xs tracking-widest uppercase text-[#A3A3A3] mb-3">Configuration Summary</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-3xl font-black text-white" style={{ fontFamily: 'Barlow Condensed' }}>{config.num_teams}</p>
              <p className="text-xs text-[#A3A3A3]">Teams</p>
            </div>
            <div>
              <p className="text-3xl font-black text-[#007AFF]" style={{ fontFamily: 'Barlow Condensed' }}>{config.purse_amount} CR</p>
              <p className="text-xs text-[#A3A3A3]">Per Team</p>
            </div>
            <div>
              <p className="text-3xl font-black text-white" style={{ fontFamily: 'Barlow Condensed' }}>{config.slots_per_team}</p>
              <p className="text-xs text-[#A3A3A3]">Slots Each</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                data-testid="btn-reset-auction"
                className="border-[#FF3B30]/50 text-[#FF3B30] hover:bg-[#FF3B30]/10 hover:text-[#FF3B30]"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Auction
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#141414] border-white/10">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-white">
                  <AlertTriangle className="w-5 h-5 text-[#FF3B30]" />
                  Reset Entire Auction?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-[#A3A3A3]">
                  This will delete all teams, players, and configuration data. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-[#1F1F1F] border-white/10 text-white hover:bg-white/10">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleReset}
                  data-testid="btn-confirm-reset"
                  className="bg-[#FF3B30] text-white hover:bg-[#FF3B30]/80"
                >
                  Yes, Reset Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            onClick={handleSave}
            data-testid="btn-save-config"
            disabled={saving}
            className="bg-[#007AFF] text-white hover:bg-[#3395FF] px-8 h-12 text-lg font-bold tracking-wider uppercase"
            style={{ fontFamily: 'Barlow Condensed' }}
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {isConfigured ? "Update & Continue" : "Save & Continue"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
