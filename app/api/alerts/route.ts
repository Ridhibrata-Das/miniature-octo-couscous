import { NextResponse } from 'next/server';
import { sendSMSAlert } from '@/lib/twilio';

export async function POST(request: Request) {
  try {
    const { soilMoisture } = await request.json();

    if (soilMoisture > 80) {
      await sendSMSAlert("Plant is drowning, please remove water");
    } else if (soilMoisture < 20) {
      await sendSMSAlert("Please water the plants");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in alerts API:', error);
    return NextResponse.json({ error: 'Failed to process alert' }, { status: 500 });
  }
}
