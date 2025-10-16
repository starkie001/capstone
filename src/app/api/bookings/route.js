export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }
    const userId = String(session.user?.id);
    const body = await req.json();
    
    // Determine status
    let status = "pending";
    if (body.groupType === "Member") status = "confirmed";
    
    // Create booking object
    const bookingData = {
      userId,
      role: session.user?.role || "Guest",
      groupName: body.groupName,
      groupType: body.groupType,
      groupSize: body.groupSize,
      interests: body.interests,
      otherInfo: body.otherInfo,
      date: body.date,
      status,
    };
    
    const booking = await bookingController.createBooking(bookingData);
    
    // TODO: Email members and admin if not Member type
    return Response.json({ success: true, booking });
  } catch (error) {
    console.error('Error in POST /api/bookings:', error);
    return new Response(error.message || "Internal Server Error", { status: 500 });
  }
}
export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }
    const userId = String(session.user?.id);
    const url = new URL(req.url);
    const bookingId = url.searchParams.get("id");
    
    if (!bookingId) return new Response("Missing booking id", { status: 400 });
    
    const booking = await bookingController.getBookingById(bookingId);
    if (!booking) return new Response("Booking not found", { status: 404 });
    
    // Only allow if user is host, lead host, member, or admin
    const allowed = ["member", "leader", "admin"].includes(session.user?.role);
    if (!allowed) return new Response("Forbidden", { status: 403 });
    
    // Mark as confirmed for this user
    const confirmed = booking.confirmed || [];
    if (!confirmed.includes(userId)) {
      confirmed.push(userId);
      await bookingController.updateBooking(bookingId, { confirmed });
    }
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error in PATCH /api/bookings:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { BookingController } from "@/lib/controllers/BookingController";

const bookingController = new BookingController();

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }
    const userId = String(session.user?.id);
    const role = session.user?.role;
    
    let bookings;
    if (role === "admin") {
      bookings = await bookingController.getAllBookings();
    } else {
      bookings = await bookingController.getBookingsByUserId(userId);
    }
    
    return Response.json(bookings);
  } catch (error) {
    console.error('Error in GET /api/bookings:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }
    const userId = String(session.user?.id);
    const url = new URL(req.url);
    const bookingId = url.searchParams.get("id");
    
    if (!bookingId) return new Response("Missing booking id", { status: 400 });
    
    const booking = await bookingController.getBookingById(bookingId);
    if (!booking) return new Response("Booking not found", { status: 404 });
    
    // Only allow deletion if admin or the booking owner
    if (session.user.role !== "admin" && booking.userId !== userId) {
      return new Response("Forbidden", { status: 403 });
    }
    
    await bookingController.deleteBooking(bookingId);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/bookings:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
