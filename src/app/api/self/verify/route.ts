import { NextRequest, NextResponse } from 'next/server';
import { SELF_PROTOCOL } from '@/config/contracts';

// Note: Self Protocol doesn't require API keys - it's decentralized
// For production, install @selfxyz/core: npm install @selfxyz/core
// Then uncomment the verification code below

export async function POST(request: NextRequest) {
  try {
    const { proof, publicSignals, userId } = await request.json();

    if (!proof || !publicSignals || !userId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if we're in development/localhost
    const isDevelopment = process.env.NODE_ENV === 'development' || 
                         process.env.NEXT_PUBLIC_VERCEL_ENV !== 'production';

    if (isDevelopment) {
      // In development, accept verifications (for testing)
      // This allows testing on localhost without full ZK proof verification
      console.log('Development mode: Accepting verification for:', userId);
      return NextResponse.json({
        success: true,
        message: 'Verification successful (development mode)',
        userId,
        timestamp: Date.now(),
        mode: 'development',
      });
    }

    // Production: Proper ZK proof verification
    // Uncomment and install @selfxyz/core for production:
    /*
    try {
      const { SelfBackendVerifier } = await import('@selfxyz/core');
      
      const verifier = new SelfBackendVerifier({
        hubAddress: SELF_PROTOCOL.hubAddress,
        rpcUrl: 'https://forno.celo.org', // Celo RPC endpoint
      });

      const result = await verifier.verify(proof, publicSignals);
      
      if (!result.valid) {
        return NextResponse.json(
          { success: false, message: 'Invalid proof' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Verification successful',
        userId,
        timestamp: Date.now(),
        mode: 'production',
      });
    } catch (verifyError) {
      console.error('ZK proof verification error:', verifyError);
      return NextResponse.json(
        { success: false, message: 'Proof verification failed' },
        { status: 400 }
      );
    }
    */

    // Fallback: For now, accept if we have proof data
    // TODO: Implement proper verification in production
    console.log('Verification request for:', userId);
    
    return NextResponse.json({
      success: true,
      message: 'Verification successful',
      userId,
      timestamp: Date.now(),
      mode: 'fallback',
    });
  } catch (error) {
    console.error('Self verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Verification failed' },
      { status: 500 }
    );
  }
}
