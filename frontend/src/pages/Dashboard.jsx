import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  LayoutDashboard,
  Download,
  Users,
  DollarSign,
  TrendingUp,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const roleColors = {
  Batsman: "border-[#FF9500] text-[#FF9500] bg-[#FF9500]/10",
  Bowler: "border-[#5856D6] text-[#5856D6] bg-[#5856D6]/10",
  "All-rounder": "border-[#34C759] text-[#34C759] bg-[#34C759]/10",
  Wicketkeeper: "border-[#FF2D55] text-[#FF2D55] bg-[#FF2D55]/10",
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTeam, setExpandedTeam] = useState(null);
  const [roleFilter, setRoleFilter] = useState("all");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchData();
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, teamsRes, playersRes] = await Promise.all([
        axios.get(`${API}/stats`),
        axios.get(`${API}/teams`),
        axios.get(`${API}/players?status=sold`),
      ]);
      setStats(statsRes.data);
      setTeams(teamsRes.data);
      setPlayers(playersRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await axios.get(`${API}/export/excel`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "cricket_auction_export.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Export downloaded successfully!");
    } catch (error) {
      toast.error("Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  const getTeamPlayers = (teamId) => {
    let teamPlayers = players.filter((p) => p.team_id === teamId);
    if (roleFilter !== "all") {
      teamPlayers = teamPlayers.filter((p) => p.role === roleFilter);
    }
    return teamPlayers;
  };

  const getRoleCount = (teamId, role) => {
    return players.filter((p) => p.team_id === teamId && p.role === role).length;
  };

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
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1
                className="text-3xl font-black tracking-tight text-white"
                style={{ fontFamily: "Barlow Condensed" }}
              >
                LIVE DASHBOARD
              </h1>
              <span className="flex items-center gap-1 px-2 py-1 bg-[#34C759]/20 text-[#34C759] text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 bg-[#34C759] rounded-full pulse-live" />
                Live
              </span>
            </div>
            <p className="text-sm text-[#A3A3A3] tracking-wider uppercase">
              Real-time auction overview
            </p>
          </div>
        </div>

        <Button
          onClick={handleExport}
          data-testid="btn-export-excel"
          disabled={exporting || teams.length === 0}
          className="bg-[#007AFF] text-white hover:bg-[#3395FF] font-bold tracking-wider uppercase"
          style={{ fontFamily: "Barlow Condensed" }}
        >
          {exporting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </>
          )}
        </Button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#141414] border border-white/10 p-4">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-[#007AFF]" />
              <span className="text-xs tracking-widest uppercase text-[#A3A3A3]">
                Teams
              </span>
            </div>
            <p
              className="text-4xl font-black text-white"
              style={{ fontFamily: "Barlow Condensed" }}
            >
              {stats.teams_count}
            </p>
          </div>

          <div className="bg-[#141414] border border-white/10 p-4">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-[#34C759]" />
              <span className="text-xs tracking-widest uppercase text-[#A3A3A3]">
                Players Sold
              </span>
            </div>
            <p
              className="text-4xl font-black text-[#34C759]"
              style={{ fontFamily: "Barlow Condensed" }}
            >
              {stats.sold_players}
              <span className="text-lg text-[#A3A3A3]">/{stats.total_players}</span>
            </p>
          </div>

          <div className="bg-[#141414] border border-white/10 p-4">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-[#FF9500]" />
              <span className="text-xs tracking-widest uppercase text-[#A3A3A3]">
                Total Spent
              </span>
            </div>
            <p
              className="text-4xl font-black text-[#FF9500]"
              style={{ fontFamily: "Barlow Condensed" }}
            >
              {stats.total_spent} PTS
            </p>
          </div>

          <div className="bg-[#141414] border border-white/10 p-4">
            <div className="flex items-center gap-3 mb-2">
              <Filter className="w-5 h-5 text-[#A3A3A3]" />
              <span className="text-xs tracking-widest uppercase text-[#A3A3A3]">
                Pending
              </span>
            </div>
            <p
              className="text-4xl font-black text-white"
              style={{ fontFamily: "Barlow Condensed" }}
            >
              {stats.pending_players}
            </p>
          </div>
        </div>
      )}

      {/* Role Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-2 mb-6">
          {Object.entries(stats.role_stats).map(([role, data]) => (
            <div
              key={role}
              className={`p-3 border ${roleColors[role]} bg-opacity-10`}
            >
              <p
                className="text-sm font-bold uppercase tracking-wider"
                style={{ fontFamily: "Barlow Condensed" }}
              >
                {role}
              </p>
              <p className="text-xs text-[#A3A3A3]">
                {data.sold}/{data.total} sold
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-3 mb-4">
        <Filter className="w-5 h-5 text-[#A3A3A3]" />
        <span className="text-xs tracking-widest uppercase text-[#A3A3A3]">
          Filter by Role:
        </span>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger
            data-testid="filter-dashboard-role"
            className="w-[150px] bg-[#141414] border-white/10 text-white"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#141414] border-white/10">
            <SelectItem value="all" className="text-white">
              All Roles
            </SelectItem>
            <SelectItem value="Batsman" className="text-white">
              Batsman
            </SelectItem>
            <SelectItem value="Bowler" className="text-white">
              Bowler
            </SelectItem>
            <SelectItem value="All-rounder" className="text-white">
              All-rounder
            </SelectItem>
            <SelectItem value="Wicketkeeper" className="text-white">
              Wicketkeeper
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Team Cards */}
      {teams.length === 0 ? (
        <div className="empty-state bg-[#141414] border border-white/10 py-16">
          <Users className="w-16 h-16 text-[#A3A3A3] mb-4" />
          <h3
            className="text-xl font-bold text-white mb-2"
            style={{ fontFamily: "Barlow Condensed" }}
          >
            NO TEAMS REGISTERED
          </h3>
          <p className="text-[#A3A3A3]">Register teams to see dashboard data</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {teams.map((team, index) => {
            const teamPlayers = getTeamPlayers(team.id);
            const isExpanded = expandedTeam === team.id;
            const pursePercent =
              stats?.config?.purse_amount > 0
                ? (team.purse_remaining / stats.config.purse_amount) * 100
                : 0;

            return (
              <div
                key={team.id}
                data-testid={`dashboard-team-card-${index}`}
                className="bg-[#141414] border border-white/10 overflow-hidden"
              >
                {/* Team Header */}
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <h3
                      className="text-xl font-black text-white truncate"
                      style={{ fontFamily: "Barlow Condensed" }}
                    >
                      {team.name}
                    </h3>
                    <span className="text-xs text-[#A3A3A3] font-mono">
                      #{index + 1}
                    </span>
                  </div>

                  {/* Purse Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[#A3A3A3]">Purse</span>
                      <span
                        className="text-lg font-bold text-[#007AFF]"
                        style={{ fontFamily: "Barlow Condensed" }}
                      >
                        {team.purse_remaining} PTS
                      </span>
                    </div>
                    <div className="purse-bar">
                      <div
                        className="purse-bar-fill"
                        style={{
                          width: `${pursePercent}%`,
                          backgroundColor:
                            pursePercent > 50
                              ? "#34C759"
                              : pursePercent > 20
                              ? "#FF9500"
                              : "#FF3B30",
                        }}
                      />
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#1F1F1F] p-2 text-center">
                      <p
                        className="text-lg font-bold text-white"
                        style={{ fontFamily: "Barlow Condensed" }}
                      >
                        {team.slots_filled}/{team.total_slots}
                      </p>
                      <p className="text-xs text-[#A3A3A3]">Slots</p>
                    </div>
                    <div className="bg-[#1F1F1F] p-2 text-center">
                      <p
                        className="text-lg font-bold text-[#FF9500]"
                        style={{ fontFamily: "Barlow Condensed" }}
                      >
                        {team.total_spent} PTS
                      </p>
                      <p className="text-xs text-[#A3A3A3]">Spent</p>
                    </div>
                  </div>

                  {/* Role Breakdown */}
                  <div className="flex gap-1 mt-3">
                    {["Batsman", "Bowler", "All-rounder", "Wicketkeeper"].map(
                      (role) => {
                        const count = getRoleCount(team.id, role);
                        return count > 0 ? (
                          <span
                            key={role}
                            className={`px-2 py-1 text-xs font-bold border ${roleColors[role]}`}
                            title={role}
                          >
                            {role.charAt(0)}:{count}
                          </span>
                        ) : null;
                      }
                    )}
                  </div>
                </div>

                {/* Players List Toggle */}
                <button
                  onClick={() =>
                    setExpandedTeam(isExpanded ? null : team.id)
                  }
                  data-testid={`btn-toggle-team-${index}`}
                  className="w-full p-2 flex items-center justify-between text-[#A3A3A3] hover:bg-white/5 transition-all"
                >
                  <span className="text-xs tracking-widest uppercase">
                    {teamPlayers.length} Players
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {/* Expanded Players List */}
                {isExpanded && (
                  <div className="border-t border-white/10 max-h-64 overflow-y-auto">
                    {teamPlayers.length === 0 ? (
                      <p className="p-4 text-center text-sm text-[#A3A3A3]">
                        No players{roleFilter !== "all" ? ` (${roleFilter})` : ""}
                      </p>
                    ) : (
                      teamPlayers.map((player, pIndex) => (
                        <div
                          key={player.id}
                          data-testid={`team-player-${index}-${pIndex}`}
                          className="p-3 border-b border-white/5 hover:bg-white/5"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p
                                className="font-bold text-white"
                                style={{ fontFamily: "Barlow Condensed" }}
                              >
                                {player.name}
                              </p>
                              <span
                                className={`text-xs ${
                                  roleColors[player.role]?.split(" ")[1] || ""
                                }`}
                              >
                                {player.role}
                              </span>
                            </div>
                            <p
                              className="text-lg font-bold text-[#34C759]"
                              style={{ fontFamily: "Barlow Condensed" }}
                            >
                              {player.sale_price} PTS
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
