import { NextResponse } from "next/server";
import { SettingsController } from "@/lib/controllers/SettingsController";

const settingsController = new SettingsController();

export async function GET() {
  try {
    const availabilities = await settingsController.getObsAvailability();
    const openDates = availabilities.length > 0 ? availabilities[0]?.dates || [] : [];
    
    return NextResponse.json({ openDates });
  } catch (err) {
    console.error('Error in GET /api/obs-availability:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { openDates } = await req.json();
    
    // Store as obs availability with a system user ID
    await settingsController.updateObsAvailability('system', openDates, 'admin');
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error in POST /api/obs-availability:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}