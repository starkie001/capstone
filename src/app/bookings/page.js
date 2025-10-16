"use client";
import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";

function BookingsContent() {
	const { data: session } = useSession();
	const searchParams = useSearchParams();
	const showConfirmation = searchParams.get("saved") === "1";
	const [bookings, setBookings] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const router = useRouter();

	useEffect(() => {
		async function fetchBookings() {
			setLoading(true);
			try {
				const res = await fetch("/api/bookings");
				if (!res.ok) throw new Error("Failed to fetch bookings");
				const data = await res.json();
				setBookings(data);
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		}
		fetchBookings();
	}, []);

	async function handleDelete(id) {
		if (!window.confirm("Are you sure you want to delete this booking?")) return;
		try {
			await fetch(`/api/bookings?id=${id}`, { method: "DELETE" });
			setBookings(bookings => bookings.filter(b => b.id !== id));
		} catch {}
	}

	async function handleConfirm(id) {
		try {
			await fetch(`/api/bookings?id=${id}`, { method: "PATCH" });
			setBookings(bookings => bookings.map(b => b.id === id ? { ...b, confirmed: true } : b));
			alert("Availability confirmed for booking " + id);
		} catch {
			alert("Failed to confirm availability.");
		}
	}

	function shouldShowConfirmButton(booking) {
		// Only show for non-Member bookings
		return (
			session && ["member", "leader", "admin"].includes(session.user?.role) && booking.groupType !== "Member"
		);
	}

	return (
		<div className="container mt-5">
			<h2>Current Bookings</h2>
			{showConfirmation && (
				<div className="alert alert-success">Hosting availability saved successfully!</div>
			)}
			{error && <div className="alert alert-danger">{error}</div>}
			{loading ? (
				<div>Loading...</div>
			) : bookings.length === 0 ? (
				<div className="alert alert-info">No current bookings.</div>
			) : (
				<table className="table table-bordered mt-3">
					<thead>
						<tr>
							<th>Role</th>
							<th>Group Name</th>
							<th>Date</th>
							<th>Time</th>
							<th>Status</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{bookings.map(b => (
							<tr key={b.id}>
								<td>{b.role || "Guest"}</td>
								<td>{b.groupName || "-"}</td>
								<td>{b.date || "-"}</td>
								<td>{b.time || "-"}</td>
								<td>{b.status || "-"}</td>
								<td>
									<button className="btn btn-danger btn-sm me-2" onClick={() => handleDelete(b.id)}>Delete</button>
									{shouldShowConfirmButton(b) && (
										<button className="btn btn-success btn-sm" onClick={() => handleConfirm(b.id)}>Confirm Availability</button>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
			<div className="mt-4">
				<button className="btn btn-primary" onClick={() => router.push("/bookings/new")}>New Booking</button>
			</div>
		</div>
	);
}

export default function BookingsPage() {
	return (
		<Suspense fallback={<div className="container mt-5"><p>Loading...</p></div>}>
			<BookingsContent />
		</Suspense>
	);
}
