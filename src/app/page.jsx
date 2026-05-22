'use client'
import { useState } from 'react'
import Landing from '@/components/Landing'
import RouteSkies from '@/components/RouteSkies'

export default function Home() {
  const [page, setPage] = useState('landing')
  return page === 'app'
    ? <RouteSkies onBack={() => setPage('landing')} />
    : <Landing onLaunchApp={() => setPage('app')} />
}
