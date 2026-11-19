import { useEffect, useState } from "react";
import { Link } from "react-router";
import { FiArrowUpRight } from "react-icons/fi";
import UserMenu from "../components/dashboard/UserMenu";
import CreateRoom from "../components/dashboard/CreateRoom";
import RoomsView from "../components/dashboard/RoomsView";
import { API_URL } from "../lib/api-url.js";

export default function Dashboard() {
  const [data, setData] = useState({
    email: "",
    ownedRooms: [],
    roomInvites: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchDashboard() {
    try {
      const response = await fetch(`${API_URL}/api/dashboard`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("We couldn't load your designs. Please try again.");
      }

      const result = await response.json();
      setData(result);
      setError("");
    } catch (err) {
      setError(err.message || "We couldn't load your designs.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#f7f8fa]">
        <p className="text-sm text-gray-500">Loading your workspace…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-[#f7f8fa] text-gray-900">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-200 bg-white p-5 sm:flex">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <img src="/figma-logo.svg" alt="" className="h-7 w-7" />
          <span className="text-sm font-semibold tracking-tight">SketchPad</span>
        </Link>
        <div className="mt-10">
          <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">
            Workspace
          </p>
          <Link
            to="/dashboard"
            className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2.5 text-sm font-medium text-blue-700"
          >
            Your designs
            <FiArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-auto border-t border-gray-100 pt-4">
          <UserMenu email={data.email} />
        </div>
      </aside>
      <main className="min-w-0 flex-1">
        <header className="flex min-h-[72px] items-center justify-between border-b border-gray-200 bg-white px-5 sm:px-9">
          <div className="flex items-center gap-3">
            <img
              src="/figma-logo.svg"
              alt=""
              className="h-7 w-7 sm:hidden"
            />
            <div>
              <p className="text-sm font-semibold">Your designs</p>
              <p className="mt-0.5 text-xs text-gray-500">
                Pick up where you left off
              </p>
            </div>
          </div>
          <div className="sm:hidden">
            <UserMenu email={data.email} />
          </div>
          <CreateRoom onRoomCreated={fetchDashboard} />
        </header>
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-9 sm:py-10">
          {error && (
            <div
              role="alert"
              className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <span>{error}</span>
              <button
                onClick={fetchDashboard}
                className="ml-4 font-medium underline underline-offset-2"
              >
                Try again
              </button>
            </div>
          )}
          <div className="mb-7">
            <h1 className="text-xl font-semibold tracking-tight">Recent files</h1>
            <p className="mt-1 text-sm text-gray-500">
              Your canvases, all in one place.
            </p>
          </div>
          <RoomsView
            ownedRooms={data.ownedRooms}
            roomInvites={data.roomInvites}
            onUpdate={fetchDashboard}
          />
        </div>
      </main>
    </div>
  );
}
