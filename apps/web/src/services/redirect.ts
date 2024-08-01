'use server';

import { redirect } from 'next/navigation';

// Redirect Function that can be used by Client-Side Code
export async function navigate(data: string) {
  redirect(data);
}
