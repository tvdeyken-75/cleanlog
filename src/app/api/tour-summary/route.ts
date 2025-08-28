
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // In a real application, you would process the data here:
    // - Save it to a database (e.g., Firestore)
    // - Send it to another API
    // - Trigger a workflow
    
    console.log("Received tour summary data:", JSON.stringify(data, null, 2));

    // For now, we just return a success message.
    return NextResponse.json({ message: "Tour summary received successfully." }, { status: 200 });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ message: "Error processing request." }, { status: 500 });
  }
}
