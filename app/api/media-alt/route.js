import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  
  // Return empty alt text so the UI doesn't crash
  return NextResponse.json({ altText: '', url });
}

export async function PUT(request) {
  // Mock successful save for alt text
  return NextResponse.json({ success: true });
}
