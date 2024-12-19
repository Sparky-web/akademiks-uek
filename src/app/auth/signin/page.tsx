"use client"
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import LoginCard from '~/components/custom/auth/login-card'

export default function AuthScreen({ onLogin }: { onLogin: (type: 'student' | 'teacher') => void }) {

    return (
        <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
            <LoginCard />
        </div>
    )
}