"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const GROUP_TYPES = ["Family", "School", "Club", "Business", "Member", "Other"];
const INTERESTS = ["Stars", "Moon", "Planets", "Galaxies", "Nebula", "Presentation"];

function formatDateLocal(date) {
  // Returns YYYY-MM-DD in local time
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function CreateBookingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [groupName, setGroupName] = useState("");
  const [groupType, setGroupType] = useState("");
  const [groupSize, setGroupSize] = useState("");
  const [interests, setInterests] = useState([]);
  const [otherInfo, setOtherInfo] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [error, setError] = useState("");

  const todayStr = formatDateLocal(new Date());

  // Only allow Member, Host, Admin to select Member group type
  const allowedMemberTypes = session && ["member", "leader", "admin"].includes(session.user?.role);
  const groupTypeOptions = allowedMemberTypes ? GROUP_TYPES : GROUP_TYPES.filter(t => t !== "Member");

  // Fetch available dates when group size or group type changes
  useEffect(() => {
    async function fetchDates() {
      setLoadingDates(true);
      setAvailableDates([]);
      if (!groupSize || !groupType) return;
      try {
        // API should return available dates for group size/type
        const res = await fetch(`/api/bookings/available-dates?groupSize=${groupSize}&groupType=${groupType}`);
        if (!res.ok) throw new Error("Failed to fetch available dates");
        const data = await res.json();
        setAvailableDates(data.dates || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingDates(false);
      }
    }
    fetchDates();
  }, [groupSize, groupType]);

  function handleInterestChange(interest) {
    setInterests(prev => prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]);
  }

  function isBookEnabled() {
    return (
      groupName.trim() &&
      groupType &&
      groupSize &&
      interests.length > 0 &&
      selectedDate
    );
  }

  async function handleBook() {
    if (!isBookEnabled()) return;
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupName,
          groupType,
          groupSize: Number(groupSize),
          interests,
          otherInfo,
          date: selectedDate,
        }),
      });
      if (!res.ok) throw new Error("Failed to create booking");
      router.replace("/bookings?saved=1");
    } catch (err) {
      setError(err.message);
    }
  }

  function handleCancel() {
    router.replace("/bookings");
  }

  return (
    <div className="container mt-5" style={{ maxWidth: 900 }}>
      <h2>Create Booking</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row">
        <div className="col-md-6">
          <div className="mb-3">
            <label>Group Name</label>
            <input className="form-control" value={groupName} onChange={e => setGroupName(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label>Group Type</label>
            <select className="form-select" value={groupType} onChange={e => setGroupType(e.target.value)} required>
              <option value="">Select...</option>
              {groupTypeOptions.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label>Group Size</label>
            <input type="number" min={1} className="form-control" value={groupSize} onChange={e => setGroupSize(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label>Interested in Seeing:</label>
            <div>
              {INTERESTS.map(interest => (
                <label key={interest} className="me-3">
                  <input
                    type="checkbox"
                    checked={interests.includes(interest)}
                    onChange={() => handleInterestChange(interest)}
                  /> {interest}
                </label>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <label>Other Info</label>
            <textarea className="form-control" value={otherInfo} onChange={e => setOtherInfo(e.target.value)} />
          </div>
          <div className="mt-4">
            <button className="btn btn-secondary me-2" onClick={handleCancel}>Cancel</button>
            <button className="btn btn-primary" onClick={handleBook} disabled={!isBookEnabled()}>Book</button>
          </div>
        </div>
        <div className="col-md-6">
          <h5>Available Dates</h5>
          {loadingDates ? (
            <div>Loading dates...</div>
          ) : (
            <div>
              <Calendar
                value={selectedDate ? new Date(selectedDate) : null}
                onClickDay={date => {
                  const d = formatDateLocal(date);
                  if (availableDates.includes(d) && d > todayStr) setSelectedDate(d);
                }}
                tileDisabled={({ date }) => {
                  const d = formatDateLocal(date);
                  return !availableDates.includes(d) || d <= todayStr;
                }}
                tileClassName={({ date, view }) => {
                  if (view === "month") {
                    const d = formatDateLocal(date);
                    if (d <= todayStr) return "disabled-date";
                    if (!availableDates.includes(d)) return "disabled-date";
                    if (selectedDate === d) return "selected-date";
                    return "available-date";
                  }
                }}
              />
              <style jsx>{`
                .available-date {
                  background: #fff !important;
                  color: #000 !important;
                  border: 1px solid #eee !important;
                }
                .selected-date {
                  background: #2196f3 !important;
                  color: #fff !important;
                }
                .disabled-date {
                  background: #ccc !important;
                  color: #888 !important;
                }
              `}</style>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
