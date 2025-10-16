import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { SettingsController } from "@/lib/controllers/SettingsController";

const settingsController = new SettingsController();

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }
    const userId = String(session.user?.id);
    
    const availabilities = await settingsController.getAvailability('hosting', userId);
    const userAvailability = availabilities.length > 0 ? availabilities[0] : {};
    
    return Response.json(userAvailability);
  } catch (error) {
    console.error('Error in GET /api/hosting-availability:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }
    const userId = String(session.user?.id);
    const body = await req.json();
    
    await settingsController.updateHostingAvailability(
      userId,
      body.dates,
      session.user?.role
    );
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/hosting-availability:', error);
    return new Response(error.message || "Internal Server Error", { status: 500 });
  }
}
