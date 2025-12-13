import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * Farcaster Mini App Webhook
 * Receives notifications from Farcaster about user interactions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log webhook events for debugging
    console.log('Farcaster webhook received:', {
      timestamp: new Date().toISOString(),
      event: body.event,
      user: body.user,
    });

    // Handle different webhook events
    switch (body.event) {
      case 'frame.added':
        // User added the Mini App
        console.log('User added CeloRemit Mini App:', body.user);
        break;
      
      case 'frame.removed':
        // User removed the Mini App
        console.log('User removed CeloRemit Mini App:', body.user);
        break;
      
      case 'notifications.enabled':
        // User enabled notifications
        console.log('Notifications enabled:', body.user);
        break;
      
      case 'notifications.disabled':
        // User disabled notifications
        console.log('Notifications disabled:', body.user);
        break;

      default:
        console.log('Unknown webhook event:', body.event);
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('Webhook error:', error);
    
    // Return 200 even on error to prevent Farcaster from retrying
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 200 }
    );
  }
}

// Handle GET requests (for webhook verification)
export async function GET() {
  return NextResponse.json({
    name: 'CeloRemit',
    description: 'AI-powered remittance platform webhook',
    status: 'active',
  });
}

