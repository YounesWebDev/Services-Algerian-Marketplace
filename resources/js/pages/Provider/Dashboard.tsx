import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import React from 'react'

export default function Dashboard() {
    return (
        <AppLayout>
            <Head title='Provider Dashboard' />
            <div className='p-6'>Provider Dashboard</div>
        </AppLayout>
    )
}
