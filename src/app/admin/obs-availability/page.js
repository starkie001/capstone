"use client";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

// Helper to convert Date to yyyy-mm-dd
function formatDate(date) {
	return date.toISOString().split("T")[0];
}

function formatDateLocal(date) {
  // Returns YYYY-MM-DD in local time
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function ObsAvailabilityPage() {
	const router = useRouter();
	const { data: session, status } = useSession();
	const [openDates, setOpenDates] = useState([]); // Array of yyyy-mm-dd strings
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState(null);

	// Access control: Only admin can access
	useEffect(() => {
		if (status === "loading") return;
		if (!session) {
			router.replace("/auth/signin");
			return;
		}
		if (session.user?.role !== "admin") {
			router.replace("/access-denied");
			return;
		}
	}, [session, status, router]);

	// Fetch existing open dates from backend
	useEffect(() => {
		async function fetchAvailability() {
			setLoading(true);
			try {
				const res = await fetch("/api/obs-availability");
				if (!res.ok) throw new Error("Failed to fetch availability");
				const data = await res.json();
				setOpenDates(data.openDates || []);
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		}
		fetchAvailability();
	}, []);

	const todayStr = formatDateLocal(new Date());

	function handleDateClick(date) {
		const d = formatDateLocal(date);
		if (d <= todayStr) return;
		setOpenDates((prev) =>
			prev.includes(d)
				? prev.filter((x) => x !== d)
				: [...prev, d]
		);
	}

	function tileClassName({ date, view }) {
		if (view === "month") {
			const d = formatDateLocal(date);
			if (d <= todayStr) return "closed-date";
			return openDates.includes(d)
				? "open-date"
				: "closed-date";
		}
	}

	async function handleSave() {
		setSaving(true);
		setError(null);
		// Validation: At least one date must be open
		if (openDates.length === 0) {
			setError("Please select at least one open date.");
			setSaving(false);
			return;
		}
		try {
			const res = await fetch("/api/obs-availability", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ openDates }),
			});
			if (!res.ok) throw new Error("Failed to save availability");
			alert("Availability saved!");
			// Optionally, refresh or redirect
			// router.refresh();
		} catch (err) {
			setError(err.message);
		} finally {
			setSaving(false);
		}
	}

		// Right panel state
		const [bookingsActive, setBookingsActive] = useState(true);
			const [requirements, setRequirements] = useState([
				{ groupMin: 1, groupMax: 10, leadHosts: 1, hosts: 2 },
				{ groupMin: 11, groupMax: 20, leadHosts: 2, hosts: 3 },
			]);
			const [savingSettings, setSavingSettings] = useState(false);
			const [settingsError, setSettingsError] = useState("");

		// Fetch settings from backend
		useEffect(() => {
			async function fetchSettings() {
				try {
					const res = await fetch("/api/obs-availability-settings");
					if (res.ok) {
						const data = await res.json();
						setBookingsActive(data.bookingsActive);
						setRequirements(data.requirements);
					}
				} catch {}
			}
			fetchSettings();
		}, []);

		function handleRequirementChange(idx, field, value) {
				setRequirements(reqs =>
					reqs.map((r, i) => i === idx ? { ...r, [field]: value } : r)
				);
		}

		async function handleSaveSettings() {
				setSettingsError("");
				// Validation
				for (let i = 0; i < requirements.length; i++) {
					const r = requirements[i];
					if (r.groupMin >= r.groupMax) {
						setSettingsError(`Row ${i + 1}: Group Min must be less than Group Max.`);
						return;
					}
					if (r.groupMin < 1 || r.groupMax < 1 || r.leadHosts < 0 || r.hosts < 0) {
						setSettingsError(`Row ${i + 1}: All values must be positive.`);
						return;
					}
				}
				setSavingSettings(true);
				try {
					await fetch("/api/obs-availability-settings", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ bookingsActive, requirements }),
					});
					alert("Settings saved!");
				} catch (err) {
					setSettingsError("Error saving settings");
				} finally {
					setSavingSettings(false);
				}
		}

		return (
			<div className="container mt-5 d-flex flex-wrap">
				{/* Left: Calendar */}
				<div style={{ flex: 1, minWidth: 320 }}>
					<h2>Observatory Availability</h2>
					<p>Select nights the observatory can be open for bookings. Grey = closed, Green = open.</p>
					{error && <div className="alert alert-danger">{error}</div>}
					{loading ? (
						<div>Loading...</div>
					) : (
						<>
							<Calendar
								onClickDay={handleDateClick}
								tileClassName={tileClassName}
							/>
							<button className="btn btn-primary mt-3" onClick={handleSave} disabled={saving}>
								{saving ? "Saving..." : "Save"}
							</button>
						</>
					)}
				</div>
				{/* Right: Settings */}
				<div style={{ flex: 1, minWidth: 320, marginLeft: "2rem" }}>
					<h3>Booking Settings</h3>
					<div className="mb-3">
						<label>
							<input
								type="checkbox"
								checked={bookingsActive}
								onChange={e => setBookingsActive(e.target.checked)}
							/>{" "}
							Bookings Active
						</label>
					</div>
					<h4>Lead Hosts & Hosts Required</h4>
								<table className="table table-bordered requirements-table">
									<thead>
										<tr>
											<th>Group Min</th>
											<th>Group Max</th>
											<th>Lead Hosts</th>
											<th>Hosts</th>
											<th style={{ width: '110px' }}>Remove Row</th>
										</tr>
									</thead>
									<tbody>
									{requirements.map((r, idx) => (
										<tr key={idx}>
											<td>
												<input type="number" value={r.groupMin}
													onChange={e => handleRequirementChange(idx, "groupMin", Number(e.target.value))} />
											</td>
											<td>
												<input type="number" value={r.groupMax}
													onChange={e => handleRequirementChange(idx, "groupMax", Number(e.target.value))} />
											</td>
											<td>
												<input type="number" value={r.leadHosts}
													onChange={e => handleRequirementChange(idx, "leadHosts", Number(e.target.value))} />
											</td>
											<td>
												<input type="number" value={r.hosts}
													onChange={e => handleRequirementChange(idx, "hosts", Number(e.target.value))} />
											</td>
															<td style={{ width: '110px', textAlign: 'center' }}>
																<button className="btn btn-danger btn-sm" onClick={() => setRequirements(reqs => reqs.filter((_, i) => i !== idx))} disabled={requirements.length === 1}>Remove</button>
															</td>
										</tr>
									))}
								</tbody>
					</table>
							<button className="btn btn-secondary me-2" onClick={() => setRequirements(reqs => [...reqs, { groupMin: 1, groupMax: 10, leadHosts: 1, hosts: 2 }])}>
								Add Row
							</button>
							<button className="btn btn-success" onClick={handleSaveSettings} disabled={savingSettings}>
								{savingSettings ? "Saving..." : "Save"}
							</button>
							{settingsError && <div className="alert alert-danger mt-2">{settingsError}</div>}
				</div>
								<style jsx>{`
									.table input {
										width: 60px;
									}
									.requirements-table th, .requirements-table td {
										vertical-align: middle;
									}
									.requirements-table th:last-child, .requirements-table td:last-child {
										width: 110px;
									}
									.closed-date {
										background: #ccc !important;
									}
									.open-date {
										background: #4caf50 !important;
										color: white !important;
									}
								`}</style>
			</div>
		);
}
