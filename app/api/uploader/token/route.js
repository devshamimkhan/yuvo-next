import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { signUploaderToken } from '@/lib/uploader-jwt';

const TOKEN_TTL_SECONDS = 60 * 60;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const secret = process.env.UPLOADER_JWT_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'Set UPLOADER_JWT_SECRET (or NEXTAUTH_SECRET) in environment' },
      { status: 500 }
    );
  }

  const token = signUploaderToken(
    {
      sub: session.user.id,
      role: session.user.role,
      name: session.user.name,
      email: session.user.email,
    },
    secret,
    TOKEN_TTL_SECONDS
  );

  return NextResponse.json({
    token,
    expiresIn: TOKEN_TTL_SECONDS,
  });
}
