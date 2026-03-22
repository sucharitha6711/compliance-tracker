import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const clientId = searchParams.get('client_id')
  const status = searchParams.get('status')
  const category = searchParams.get('category')

  if (!clientId) return NextResponse.json({ error: 'client_id required' }, { status: 400 })

  let query = supabase
    .from('compliance_tasks')
    .select('*')
    .eq('client_id', clientId)
    .order('due_date')

  if (status && status !== 'All') query = query.eq('status', status)
  if (category && category !== 'All') query = query.eq('category', category)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { client_id, title, description, category, due_date, priority } = body

  if (!client_id || !title || !category || !due_date) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('compliance_tasks')
    .insert([{ client_id, title, description, category, due_date, priority: priority || 'Medium', status: 'Pending' }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}