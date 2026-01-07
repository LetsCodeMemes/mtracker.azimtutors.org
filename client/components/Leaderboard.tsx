import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Trophy, Medal, User, Loader2, Info } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

interface LeaderboardEntry {
  username: string;
  first_name: string;
  last_name: string;
  total_points: number;
  level: number;
}

export function Leaderboard() {
  const { user, setUser, token } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPublic, setIsPublic] = useState(user?.is_leaderboard_public ?? true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/gamification/leaderboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const togglePublic = async (checked: boolean) => {
    try {
      const response = await fetch("/api/gamification/leaderboard/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPublic: checked }),
      });

      if (response.ok) {
        setIsPublic(checked);
        if (user) {
          setUser({ ...user, is_leaderboard_public: checked }, token || undefined);
        }
        toast.success(checked ? "You are now on the leaderboard!" : "You have opted out of the leaderboard.");
        fetchLeaderboard();
      }
    } catch (err) {
      toast.error("Failed to update preference.");
    }
  };

  if (loading) {
    return (
      <Card className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-primary/20">
      <div className="bg-primary/5 p-6 border-b border-primary/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="h-6 w-6 text-amber-500" />
              Azim Tutors Leaderboard
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Top students tracking their way to A* success
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-background p-2 rounded-lg border border-border shadow-sm">
            <Label htmlFor="leaderboard-toggle" className="text-xs font-semibold">
              Show me on leaderboard
            </Label>
            <Switch
              id="leaderboard-toggle"
              checked={isPublic}
              onCheckedChange={togglePublic}
            />
          </div>
        </div>
      </div>

      <div className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">Level</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {entries.map((entry, index) => {
                const isCurrentUser = entry.username === user?.username;
                const rank = index + 1;

                return (
                  <tr
                    key={entry.username || `${entry.first_name}-${entry.last_name}-${index}`}
                    className={`${isCurrentUser ? "bg-primary/5 font-semibold" : "hover:bg-muted/50"} transition-colors`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {rank === 1 ? (
                          <Medal className="h-5 w-5 text-amber-500 mr-2" />
                        ) : rank === 2 ? (
                          <Medal className="h-5 w-5 text-slate-400 mr-2" />
                        ) : rank === 3 ? (
                          <Medal className="h-5 w-5 text-amber-700 mr-2" />
                        ) : (
                          <span className="w-5 mr-2 text-center text-muted-foreground text-sm">{rank}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {entry.username || `${entry.first_name} ${entry.last_name.charAt(0)}.`}
                            {isCurrentUser && <span className="ml-2 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full uppercase tracking-tighter">You</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Lvl {entry.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-primary">
                      {entry.total_points.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {entries.length === 0 && (
          <div className="p-12 text-center">
            <Info className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No users have opted in to the leaderboard yet.</p>
          </div>
        )}
      </div>
    </Card>
  );
}
