import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left blue panel */}
      <div className="hidden md:flex w-[45%] bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 flex-col justify-between p-10 relative overflow-hidden">
        {/* Background decorative lines */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute border border-white/30 rounded-full"
              style={{
                width: `${(i + 1) * 120}px`,
                height: `${(i + 1) * 120}px`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <span className="text-white font-bold text-xl">CyberEduShare</span>
        </div>

        {/* Bottom text */}
        <div className="relative z-10">
          <h2 className="text-white font-bold text-2xl leading-snug mb-3">
            Personalized<br />cybersecurity learning
          </h2>
          <p className="text-white/70 text-sm leading-relaxed">
            A collaborative platform for students, faculty and security professionals to learn, share and grow.
          </p>
        </div>
      </div>

      {/* Right white panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}