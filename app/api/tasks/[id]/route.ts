import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const { status } = body

  if (!status) return NextResponse.json({ error: 'status required' }, { status: 400 })

  const { data, error } = await supabase
    .from('compliance_tasks')
    .update({ status })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}