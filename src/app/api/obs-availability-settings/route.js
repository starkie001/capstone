import { NextResponse } from "next/server";
import { SettingsController } from "@/lib/controllers/SettingsController";

const settingsController = new SettingsController();

export async function GET() {
  try {
    const setting = await settingsController.getSettingByKey('obs-availability-settings');
    
    // Default settings if not found
    const defaultSettings = { bookingsActive: true, requirements: [] };
    const settings = setting ? setting.value : defaultSettings;
    
    return NextResponse.json(settings);
  } catch (err) {
    console.error('Error in GET /api/obs-availability-settings:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    
    await settingsController.createOrUpdateSetting(
      'obs-availability-settings',
      body,
      'Observatory availability settings including bookings status and requirements'
    );
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error in POST /api/obs-availability-settings:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
