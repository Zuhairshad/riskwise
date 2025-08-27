
import React from 'react';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative min-h-screen bg-background text-foreground">
            {/* Background elements */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-background">
                <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div>
                <div className="absolute bottom-0 right-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div>
            </div>

            {/* Centering Container */}
            <main className="min-h-screen grid place-items-center p-4">
                <div className="w-full max-w-md">
                 {children}
                </div>
            </main>
            
            {/* Footer */}
            <footer className="fixed bottom-0 w-full py-4 text-center text-xs text-muted-foreground">
                <p>Design by Uzair Ahmad</p>
            </footer>
        </div>
    );
}
