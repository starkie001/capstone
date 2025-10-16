"use client";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

function formatDateLocal(date) {
  // Returns YYYY-MM-DD in local time
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function HostingAvailabilityPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [openDates, setOpenDates] = useState([]); // Dates admin has opened
  const [selectedDates, setSelectedDates] = useState([]); // Member's selection
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [frequencyWeek, setFrequencyWeek] = useState(1);
  const [frequencyMonth, setFrequencyMonth] = useState(4);
  const [saving, setSaving] = useState(false);

  const todayStr = formatDateLocal(new Date());

  // Access control: Only members, lead hosts, admin
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace("/auth/signin");
      return;
    }
    const role = session.user?.role;
    if (!["member", "leader", "admin"].includes(role)) {
      router.replace("/access-denied");
      return;
    }
  }, [session, status, router]);

  // Fetch open nights from backend
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch open nights
        const resOpen = await fetch("/api/obs-availability");
        if (!resOpen.ok) throw new Error("Failed to fetch open nights");
        const dataOpen = await resOpen.json();
        setOpenDates(dataOpen.openDates || []);

        // Fetch user's saved hosting availability
        const resUser = await fetch("/api/hosting-availability");
        if (resUser.ok) {
          const userData = await resUser.json();
          setSelectedDates(userData.dates || []);
          if (userData.frequencyWeek) setFrequencyWeek(userData.frequencyWeek);
          if (userData.frequencyMonth) setFrequencyMonth(userData.frequencyMonth);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  function handleDateClick(date) {
    const d = formatDateLocal(date);
    if (!openDates.includes(d) || d <= todayStr) return;
    setSelectedDates(prev => {
      if (prev.includes(d)) {
        return prev.filter(x => x !== d);
      } else {
        return [...prev, d];
      }
    });
  }

  function tileClassName({ date, view }) {
    if (view === "month") {
      const d = formatDateLocal(date);
      if (d <= todayStr) return "closed-date";
      if (!openDates.includes(d)) return "closed-date";
      if (selectedDates.includes(d)) return "selected-date";
      return "open-date";
    }
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    // Validation: At least one date, positive frequency
    if (selectedDates.length === 0) {
      setError("Please select at least one date you are available to host.");
      setSaving(false);
      return;
    }
    if (frequencyWeek < 1 || frequencyMonth < 1) {
      setError("Frequency must be at least 1 per week and 1 per month.");
      setSaving(false);
      return;
    }
    try {
      // Save to backend (implement /api/hosting-availability)
      await fetch("/api/hosting-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dates: selectedDates, frequencyWeek, frequencyMonth }),
      });
      router.replace("/bookings?saved=1");
    } catch (err) {
      setError("Error saving availability");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    router.replace("/bookings");
  }

  return (
    <div className="container mt-5" style={{ maxWidth: 700 }}>
      <h2>Hosting Availability</h2>
      <p>Select the nights you are available to host from the observatory open nights. Only green dates are available.</p>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <Calendar
            key={selectedDates.join("-")}
            onClickDay={handleDateClick}
            tileClassName={tileClassName}
          />
          <div className="mt-4">
            <label>Frequency per week:
              <input type="number" min={1} value={frequencyWeek} onChange={e => setFrequencyWeek(Number(e.target.value))} style={{ width: 60, marginLeft: 8 }} />
            </label>
            <br />
            <label>Frequency per month:
              <input type="number" min={1} value={frequencyMonth} onChange={e => setFrequencyMonth(Number(e.target.value))} style={{ width: 60, marginLeft: 8 }} />
            </label>
          </div>
          <div className="mt-4">
            <button className="btn btn-primary me-2" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button className="btn btn-secondary" onClick={handleCancel} disabled={saving}>
              Cancel
            </button>
          </div>
        </>
      )}
      <style jsx>{`
        .closed-date {
          background: #ccc !important;
        }
        .open-date {
          background: #4caf50 !important;
          color: white !important;
        }
        .selected-date {
          background: #2196f3 !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
}
