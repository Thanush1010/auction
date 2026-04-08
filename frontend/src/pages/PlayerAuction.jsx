import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  UserPlus,
  Plus,
  Gavel,
  XCircle,
  RotateCcw,
  Trash2,
  Filter,
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ROLES = ["Batsman", "Bowler", "All-rounder", "Wicketkeeper"];

const roleColors = {
  Batsman: "border-[#FF9500] text-[#FF9500]",
  Bowler: "border-[#5856D6] text-[#5856D6]",
  "All-rounder": "border-[#34C759] text-[#34C759]",
  Wicketkeeper: "border-[#FF2D55] text-[#FF2D55]",
};

export default function PlayerAuction() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [filter, setFilter] = useState({ role: "all", status: "all" });

  const [newPlayer, setNewPlayer] = useState({
    name: "",
    role: "",
    base_price: "",
  });
  const [sellData, setSellData] = useState({
    team_id: "",
    sale_price: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [playersRes, teamsRes] = await Promise.all([
        axios.get(`${API}/players`),
        axios.get(`${API}/teams`),
      ]);
      setPlayers(playersRes.data);
      setTeams(teamsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlayer = async () => {
    if (!newPlayer.name.trim()) {
      toast.error("Player name is required");
      return;
    }
    if (!newPlayer.role) {
      toast.error("Please select a role");
      return;
    }
    if (!newPlayer.base_price || parseFloat(newPlayer.base_price) <= 0) {
      toast.error("Base price must be greater than 0");
      return;
    }

    setSaving(true);
    try {
      const response = await axios.post(`${API}/players`, {
        ...newPlayer,
        base_price: parseFloat(newPlayer.base_price),
      });
      setPlayers([...players, response.data]);
      setNewPlayer({ name: "", role: "", base_price: "" });
      setDialogOpen(false);
      toast.success("Player added successfully!");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to add player");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenSellDialog = (player) => {
    setSelectedPlayer(player);
    setSellData({ team_id: "", sale_price: player.base_price.toString() });
    setSellDialogOpen(true);
  };

  const handleSellPlayer = async () => {
    if (!sellData.team_id) {
      toast.error("Please select a team");
      return;
    }
    if (!sellData.sale_price || parseFloat(sellData.sale_price) <= 0) {
      toast.error("Sale price must be greater than 0");
      return;
    }

    setSaving(true);
    try {
      const response = await axios.post(
        `${API}/players/${selectedPlayer.id}/sell`,
        {
          team_id: sellData.team_id,
          sale_price: parseFloat(sellData.sale_price),
        }
      );
      setPlayers(
        players.map((p) => (p.id === selectedPlayer.id ? response.data : p))
      );
      // Refresh teams to get updated purse
      const teamsRes = await axios.get(`${API}/teams`);
      setTeams(teamsRes.data);
      setSellDialogOpen(false);
      toast.success(`${selectedPlayer.name} sold successfully!`);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to sell player");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkUnsold = async (player) => {
    try {
      const response = await axios.post(`${API}/players/${player.id}/unsold`);
      setPlayers(players.map((p) => (p.id === player.id ? response.data : p)));
      toast.success(`${player.name} marked as unsold`);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to mark unsold");
    }
  };

  const handleResetPlayer = async (player) => {
    try {
      const response = await axios.post(`${API}/players/${player.id}/reset`);
      setPlayers(players.map((p) => (p.id === player.id ? response.data : p)));
      // Refresh teams if player was sold
      if (player.status === "sold") {
        const teamsRes = await axios.get(`${API}/teams`);
        setTeams(teamsRes.data);
      }
      toast.success(`${player.name} reset to pending`);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to reset player");
    }
  };

  const handleDeletePlayer = async (player) => {
    try {
      await axios.delete(`${API}/players/${player.id}`);
      setPlayers(players.filter((p) => p.id !== player.id));
      // Refresh teams if player was sold
      if (player.status === "sold") {
        const teamsRes = await axios.get(`${API}/teams`);
        setTeams(teamsRes.data);
      }
      toast.success("Player deleted successfully!");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to delete player");
    }
  };

  const filteredPlayers = players.filter((player) => {
    if (filter.role !== "all" && player.role !== filter.role) return false;
    if (filter.status !== "all" && player.status !== filter.status) return false;
    return true;
  });

  const pendingPlayers = filteredPlayers.filter((p) => p.status === "pending");
  const soldPlayers = filteredPlayers.filter((p) => p.status === "sold");
  const unsoldPlayers = filteredPlayers.filter((p) => p.status === "unsold");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#007AFF] flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1
              className="text-3xl font-black tracking-tight text-white"
              style={{ fontFamily: "Barlow Condensed" }}
            >
              PLAYER AUCTION
            </h1>
            <p className="text-sm text-[#A3A3A3] tracking-wider uppercase">
              {players.length} players • {soldPlayers.length} sold •{" "}
              {unsoldPlayers.length} unsold
            </p>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              data-testid="btn-add-player"
              className="bg-[#007AFF] text-white hover:bg-[#3395FF] font-bold tracking-wider uppercase"
              style={{ fontFamily: "Barlow Condensed" }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Player
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#141414] border-white/10">
            <DialogHeader>
              <DialogTitle
                className="text-xl font-black text-white tracking-tight"
                style={{ fontFamily: "Barlow Condensed" }}
              >
                ADD NEW PLAYER
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-xs tracking-widest uppercase text-[#A3A3A3]">
                  Player Name
                </Label>
                <Input
                  data-testid="input-player-name"
                  placeholder="Enter player name"
                  value={newPlayer.name}
                  onChange={(e) =>
                    setNewPlayer({ ...newPlayer, name: e.target.value })
                  }
                  className="bg-[#0A0A0A] border-white/10 text-white focus:border-[#007AFF]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs tracking-widest uppercase text-[#A3A3A3]">
                  Role
                </Label>
                <Select
                  value={newPlayer.role}
                  onValueChange={(value) =>
                    setNewPlayer({ ...newPlayer, role: value })
                  }
                >
                  <SelectTrigger
                    data-testid="select-player-role"
                    className="bg-[#0A0A0A] border-white/10 text-white"
                  >
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141414] border-white/10">
                    {ROLES.map((role) => (
                      <SelectItem key={role} value={role} className="text-white">
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs tracking-widest uppercase text-[#A3A3A3]">
                  Base Price (in Lakhs)
                </Label>
                <Input
                  data-testid="input-base-price"
                  type="number"
                  placeholder="e.g., 50"
                  value={newPlayer.base_price}
                  onChange={(e) =>
                    setNewPlayer({ ...newPlayer, base_price: e.target.value })
                  }
                  className="bg-[#0A0A0A] border-white/10 text-white focus:border-[#007AFF]"
                />
              </div>
              <Button
                onClick={handleAddPlayer}
                data-testid="btn-confirm-add-player"
                disabled={saving}
                className="w-full bg-[#007AFF] text-white hover:bg-[#3395FF] font-bold tracking-wider uppercase"
                style={{ fontFamily: "Barlow Condensed" }}
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Add Player"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-[#141414] border border-white/10">
        <Filter className="w-5 h-5 text-[#A3A3A3]" />
        <div className="flex items-center gap-2">
          <Label className="text-xs tracking-widest uppercase text-[#A3A3A3]">
            Role:
          </Label>
          <Select
            value={filter.role}
            onValueChange={(value) => setFilter({ ...filter, role: value })}
          >
            <SelectTrigger
              data-testid="filter-role"
              className="w-[150px] bg-[#0A0A0A] border-white/10 text-white"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#141414] border-white/10">
              <SelectItem value="all" className="text-white">
                All Roles
              </SelectItem>
              {ROLES.map((role) => (
                <SelectItem key={role} value={role} className="text-white">
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs tracking-widest uppercase text-[#A3A3A3]">
            Status:
          </Label>
          <Select
            value={filter.status}
            onValueChange={(value) => setFilter({ ...filter, status: value })}
          >
            <SelectTrigger
              data-testid="filter-status"
              className="w-[150px] bg-[#0A0A0A] border-white/10 text-white"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#141414] border-white/10">
              <SelectItem value="all" className="text-white">
                All Status
              </SelectItem>
              <SelectItem value="pending" className="text-white">
                Pending
              </SelectItem>
              <SelectItem value="sold" className="text-white">
                Sold
              </SelectItem>
              <SelectItem value="unsold" className="text-white">
                Unsold
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Players Table */}
      {filteredPlayers.length === 0 ? (
        <div className="empty-state bg-[#141414] border border-white/10 py-16">
          <UserPlus className="w-16 h-16 text-[#A3A3A3] mb-4" />
          <h3
            className="text-xl font-bold text-white mb-2"
            style={{ fontFamily: "Barlow Condensed" }}
          >
            NO PLAYERS FOUND
          </h3>
          <p className="text-[#A3A3A3] mb-6">
            {players.length === 0
              ? "Add players to start the auction"
              : "No players match the current filters"}
          </p>
          {players.length === 0 && (
            <Button
              onClick={() => setDialogOpen(true)}
              data-testid="btn-add-first-player"
              className="bg-[#007AFF] text-white hover:bg-[#3395FF]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Player
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-[#141414] border border-white/10 overflow-hidden">
          <table className="auction-table">
            <thead>
              <tr>
                <th>Player</th>
                <th>Role</th>
                <th>Base Price</th>
                <th>Status</th>
                <th>Sale Price</th>
                <th>Team</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map((player, index) => (
                <tr
                  key={player.id}
                  data-testid={`player-row-${index}`}
                  className={`
                    ${player.status === "sold" ? "animate-flash-success" : ""}
                    ${player.status === "unsold" ? "animate-flash-danger" : ""}
                  `}
                >
                  <td>
                    <span
                      className="font-bold text-white"
                      style={{ fontFamily: "Barlow Condensed" }}
                    >
                      {player.name}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`role-badge ${roleColors[player.role] || ""}`}
                    >
                      {player.role}
                    </span>
                  </td>
                  <td>
                    <span className="text-[#A3A3A3]">{player.base_price} L</span>
                  </td>
                  <td>
                    <span
                      className={`
                        px-2 py-1 text-xs font-bold uppercase tracking-wider
                        ${player.status === "pending" ? "text-[#A3A3A3]" : ""}
                        ${player.status === "sold" ? "text-[#34C759]" : ""}
                        ${player.status === "unsold" ? "text-[#FF3B30]" : ""}
                      `}
                    >
                      {player.status}
                    </span>
                  </td>
                  <td>
                    {player.sale_price ? (
                      <span
                        className="font-bold text-[#34C759]"
                        style={{ fontFamily: "Barlow Condensed" }}
                      >
                        {player.sale_price} L
                      </span>
                    ) : (
                      <span className="text-[#A3A3A3]">-</span>
                    )}
                  </td>
                  <td>
                    {player.team_name ? (
                      <span className="text-white">{player.team_name}</span>
                    ) : (
                      <span className="text-[#A3A3A3]">-</span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-2">
                      {player.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleOpenSellDialog(player)}
                            data-testid={`btn-sell-${index}`}
                            className="bg-[#34C759] hover:bg-[#34C759]/80 text-white"
                          >
                            <Gavel className="w-4 h-4 mr-1" />
                            Sell
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkUnsold(player)}
                            data-testid={`btn-unsold-${index}`}
                            className="border-[#FF3B30]/50 text-[#FF3B30] hover:bg-[#FF3B30]/10"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Unsold
                          </Button>
                        </>
                      )}
                      {(player.status === "sold" ||
                        player.status === "unsold") && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResetPlayer(player)}
                          data-testid={`btn-reset-${index}`}
                          className="border-white/10 text-white hover:bg-white/10"
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Reset
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeletePlayer(player)}
                        data-testid={`btn-delete-player-${index}`}
                        className="text-[#FF3B30] hover:bg-[#FF3B30]/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sell Dialog */}
      <Dialog open={sellDialogOpen} onOpenChange={setSellDialogOpen}>
        <DialogContent className="bg-[#141414] border-white/10">
          <DialogHeader>
            <DialogTitle
              className="text-xl font-black text-white tracking-tight"
              style={{ fontFamily: "Barlow Condensed" }}
            >
              SELL PLAYER
            </DialogTitle>
          </DialogHeader>
          {selectedPlayer && (
            <div className="space-y-4 pt-4">
              <div className="p-4 bg-[#1F1F1F] border border-white/10">
                <h3
                  className="text-2xl font-black text-white mb-1"
                  style={{ fontFamily: "Barlow Condensed" }}
                >
                  {selectedPlayer.name}
                </h3>
                <div className="flex items-center gap-3">
                  <span className={`role-badge ${roleColors[selectedPlayer.role]}`}>
                    {selectedPlayer.role}
                  </span>
                  <span className="text-[#A3A3A3]">
                    Base: {selectedPlayer.base_price} L
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs tracking-widest uppercase text-[#A3A3A3]">
                  Select Team
                </Label>
                <Select
                  value={sellData.team_id}
                  onValueChange={(value) =>
                    setSellData({ ...sellData, team_id: value })
                  }
                >
                  <SelectTrigger
                    data-testid="select-sell-team"
                    className="bg-[#0A0A0A] border-white/10 text-white"
                  >
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141414] border-white/10">
                    {teams.map((team) => (
                      <SelectItem
                        key={team.id}
                        value={team.id}
                        className="text-white"
                        disabled={team.slots_filled >= team.total_slots}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{team.name}</span>
                          <span className="text-xs text-[#A3A3A3] ml-2">
                            {team.purse_remaining?.toFixed(1)} Cr •{" "}
                            {team.slots_filled}/{team.total_slots} slots
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs tracking-widest uppercase text-[#A3A3A3]">
                  Sale Price (in Lakhs)
                </Label>
                <Input
                  data-testid="input-sale-price"
                  type="number"
                  value={sellData.sale_price}
                  onChange={(e) =>
                    setSellData({ ...sellData, sale_price: e.target.value })
                  }
                  className="bg-[#0A0A0A] border-white/10 text-white focus:border-[#007AFF] text-xl font-bold"
                  style={{ fontFamily: "Barlow Condensed" }}
                />
                <p className="text-xs text-[#A3A3A3]">
                  Minimum: {selectedPlayer.base_price} L (Base Price)
                </p>
              </div>

              <Button
                onClick={handleSellPlayer}
                data-testid="btn-confirm-sell"
                disabled={saving}
                className="w-full bg-[#34C759] text-white hover:bg-[#34C759]/80 font-bold tracking-wider uppercase h-12"
                style={{ fontFamily: "Barlow Condensed" }}
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Gavel className="w-5 h-5 mr-2" />
                    Confirm Sale
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
