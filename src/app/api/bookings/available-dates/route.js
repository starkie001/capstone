import { BookingController } from "@/lib/controllers/BookingController";
import { SettingsController } from "@/lib/controllers/SettingsController";

const bookingController = new BookingController();
const settingsController = new SettingsController();

export async function GET(req) {
  try {
    // /api/bookings/available-dates?groupSize=...&groupType=...
    const url = new URL(req.url);
    const groupSize = parseInt(url.searchParams.get("groupSize"), 10);
    const groupType = url.searchParams.get("groupType");
    
    if (!groupSize || !groupType) return Response.json({ dates: [] });

    // Load open nights from settings
    const obsAvailability = await settingsController.getObsAvailability();
    const openDates = obsAvailability.length > 0 ? obsAvailability[0]?.dates || [] : [];

    // Load settings/requirements
    const obsSettings = await settingsController.getSettingByKey('obs-availability-settings');
    const requirements = obsSettings?.value?.requirements || [];

    // Load bookings
    const allBookings = await bookingController.getAllBookings();

    // For Member group type, all open nights are available except those already booked (pending/confirmed)
    const unavailableDates = allBookings
      .filter(b => ["pending", "confirmed"].includes(b.status))
      .map(b => b.date);

    if (groupType === "Member") {
      const available = openDates.filter(d => !unavailableDates.includes(d));
      return Response.json({ dates: available });
    }

    // Find requirement row for group size
    const reqRow = requirements.find(r => groupSize >= r.groupMin && groupSize <= r.groupMax);
    if (!reqRow) return Response.json({ dates: [] });

    // For other group types, exclude dates already booked (pending/confirmed)
    const available = openDates.filter(d => !unavailableDates.includes(d));
    // TODO: Filter available by host/lead host availability
    return Response.json({ dates: available });
  } catch (error) {
    console.error('Error in GET /api/bookings/available-dates:', error);
    return Response.json({ dates: [], error: error.message }, { status: 500 });
  }
}
