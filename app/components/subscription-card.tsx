import { GlowEffect } from '@/components/ui/glow-effect';

export default function LaunchCard() {
    return (
        <div className='relative h-44 w-64 mb-8'>
            <GlowEffect
                colors={['#0894FF', '#C959DD', '#FF2E54', '#FF9004']}
                mode='static'
                blur='softest'
            />
            <div className='relative h-44 w-64 rounded-lg bg-white p-2'>
                <h2>Launch Plan</h2>
            </div>
        </div>
    );
}