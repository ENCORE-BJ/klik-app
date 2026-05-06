import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { amount, phone, businessName } = await req.json();

  // This is where you'd call the Safaricom Daraja API
  // For now, we'll log the transaction as an 'Economic Event'
  console.log(`Initiating M-Pesa STK Push: ${amount} KES to ${phone} for ${businessName}`);

  return NextResponse.json({ message: "STK Push Initiated. Check your phone." });
}