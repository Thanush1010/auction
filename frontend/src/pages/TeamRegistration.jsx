import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Users, Plus, Trash2, ArrowRight, Edit2, Check, X, ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function TeamRegistration() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: "", logo_url: "" });
  const [saving, setSaving] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [editData, setEditData] = useState({ name: "", logo_url: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [configRes, teamsRes] = await Promise.all([
        axios.get(`${API}/config`),
        axios.get(`${API}/teams`),
      ]);
      setConfig(configRes.data);
      setTeams(teamsRes.data);

      if (!configRes.data?.is_configured) {
        toast.error("Please configure auction settings first");
        navigate("/config");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeam = async () => {
    if (!newTeam.name.trim()) {
      toast.error("Team name is required");
      return;
    }

    setSaving(true);
    try {
      const response = await axios.post(`${API}/teams`, newTeam);
      setTeams([...teams, response.data]);
      setNewTeam({ name: "", logo_url: "" });
      setDialogOpen(false);
      toast.success("Team added successfully!");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to add team");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    try {
      await axios.delete(`${API}/teams/${teamId}`);
      setTeams(teams.filter((t) => t.id !== teamId));
      toast.success("Team deleted successfully!");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to delete team");
    }
  };

  const handleStartEdit = (team) => {
    setEditingTeam(team.id);
    setEditData({ name: team.name, logo_url: team.logo_url || "" });
  };

  const handleSaveEdit = async (teamId) => {
    if (!editData.name.trim()) {
      toast.error("Team name is required");
      return;
    }

    try {
      const response = await axios.put(`${API}/teams/${teamId}`, editData);
      setTeams(teams.map((t) => (t.id === teamId ? response.data : t)));
      setEditingTeam(null);
      toast.success("Team updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to update team");
    }
  };

  const handleCancelEdit = () => {
    setEditingTeam(null);
    setEditData({ name: "", logo_url: "" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const remainingSlots = config ? config.num_teams - teams.length : 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#007AFF] flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white" style={{ fontFamily: 'Barlow Condensed' }}>
              TEAM REGISTRATION
            </h1>
            <p className="text-sm text-[#A3A3A3] tracking-wider uppercase">
              Step 2: Register {config?.num_teams} teams • {remainingSlots} slots remaining
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                data-testid="btn-add-team"
                disabled={teams.length >= (config?.num_teams || 0)}
                className="bg-[#007AFF] text-white hover:bg-[#3395FF] font-bold tracking-wider uppercase"
                style={{ fontFamily: 'Barlow Condensed' }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Team
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#141414] border-white/10">
              <DialogHeader>
                <DialogTitle className="text-xl font-black text-white tracking-tight" style={{ fontFamily: 'Barlow Condensed' }}>
                  ADD NEW TEAM
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="text-xs tracking-widest uppercase text-[#A3A3A3]">Team Name</Label>
                  <Input
                    data-testid="input-team-name"
                    placeholder="Enter team name"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                    className="bg-[#0A0A0A] border-white/10 text-white focus:border-[#007AFF]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs tracking-widest uppercase text-[#A3A3A3]">Logo URL (Optional)</Label>
                  <Input
                    data-testid="input-team-logo"
                    placeholder="https://example.com/logo.png"
                    value={newTeam.logo_url}
                    onChange={(e) => setNewTeam({ ...newTeam, logo_url: e.target.value })}
                    className="bg-[#0A0A0A] border-white/10 text-white focus:border-[#007AFF]"
                  />
                </div>
                <Button
                  onClick={handleAddTeam}
                  data-testid="btn-confirm-add-team"
                  disabled={saving}
                  className="w-full bg-[#007AFF] text-white hover:bg-[#3395FF] font-bold tracking-wider uppercase"
                  style={{ fontFamily: 'Barlow Condensed' }}
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Add Team"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {teams.length > 0 && (
            <Button
              onClick={() => navigate("/auction")}
              data-testid="btn-proceed-auction"
              className="bg-[#34C759] text-white hover:bg-[#34C759]/80 font-bold tracking-wider uppercase"
              style={{ fontFamily: 'Barlow Condensed' }}
            >
              Proceed to Auction
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>

      {/* Teams Grid */}
      {teams.length === 0 ? (
        <div className="empty-state bg-[#141414] border border-white/10 py-16">
          <Users className="w-16 h-16 text-[#A3A3A3] mb-4" />
          <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Barlow Condensed' }}>
            NO TEAMS REGISTERED
          </h3>
          <p className="text-[#A3A3A3] mb-6">Add teams to start the auction process</p>
          <Button
            onClick={() => setDialogOpen(true)}
            data-testid="btn-add-first-team"
            className="bg-[#007AFF] text-white hover:bg-[#3395FF]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add First Team
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {teams.map((team, index) => (
            <div
              key={team.id}
              data-testid={`team-card-${index}`}
              className="team-card p-4"
            >
              {editingTeam === team.id ? (
                <div className="space-y-3">
                  <Input
                    data-testid="input-edit-team-name"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="bg-[#0A0A0A] border-white/10 text-white focus:border-[#007AFF]"
                    placeholder="Team name"
                  />
                  <Input
                    data-testid="input-edit-team-logo"
                    value={editData.logo_url}
                    onChange={(e) => setEditData({ ...editData, logo_url: e.target.value })}
                    className="bg-[#0A0A0A] border-white/10 text-white focus:border-[#007AFF]"
                    placeholder="Logo URL"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSaveEdit(team.id)}
                      data-testid="btn-save-edit"
                      className="flex-1 bg-[#34C759] hover:bg-[#34C759]/80"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      data-testid="btn-cancel-edit"
                      className="flex-1 border-white/10 hover:bg-white/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-3 mb-4">
                    {team.logo_url ? (
                      <img
                        src={team.logo_url}
                        alt={team.name}
                        className="w-16 h-16 object-cover bg-[#1F1F1F]"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-16 h-16 bg-[#1F1F1F] flex items-center justify-center ${team.logo_url ? 'hidden' : ''}`}
                    >
                      <ImageIcon className="w-8 h-8 text-[#A3A3A3]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className="text-lg font-bold text-white truncate"
                        style={{ fontFamily: 'Barlow Condensed' }}
                      >
                        {team.name}
                      </h3>
                      <p className="text-xs text-[#A3A3A3] tracking-wider uppercase">
                        Team #{index + 1}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-[#1F1F1F] p-3">
                      <p className="text-2xl font-black text-[#007AFF]" style={{ fontFamily: 'Barlow Condensed' }}>
                        {team.purse_remaining?.toFixed(1)} CR
                      </p>
                      <p className="text-xs text-[#A3A3A3] tracking-wider uppercase">Purse</p>
                    </div>
                    <div className="bg-[#1F1F1F] p-3">
                      <p className="text-2xl font-black text-white" style={{ fontFamily: 'Barlow Condensed' }}>
                        {team.slots_filled}/{team.total_slots}
                      </p>
                      <p className="text-xs text-[#A3A3A3] tracking-wider uppercase">Slots</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStartEdit(team)}
                      data-testid={`btn-edit-team-${index}`}
                      className="flex-1 border-white/10 text-white hover:bg-white/10"
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteTeam(team.id)}
                      data-testid={`btn-delete-team-${index}`}
                      className="border-[#FF3B30]/50 text-[#FF3B30] hover:bg-[#FF3B30]/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Placeholder cards for remaining slots */}
          {Array.from({ length: remainingSlots }).map((_, index) => (
            <div
              key={`placeholder-${index}`}
              className="border border-dashed border-white/20 p-4 flex flex-col items-center justify-center min-h-[200px] cursor-pointer hover:border-[#007AFF]/50 transition-all"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="w-8 h-8 text-[#A3A3A3] mb-2" />
              <p className="text-sm text-[#A3A3A3]">Add Team {teams.length + index + 1}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
