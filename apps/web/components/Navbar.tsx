import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Code2, User } from "lucide-react";

export const Navbar = async () => {
  const { userId } = await auth();

  return (
    <nav className="bg-[#0A1929] border-b border-[#1E2A3A] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="relative">
              <Code2 className="w-8 h-8 text-[#3B82F6] group-hover:scale-110 transition-transform duration-200" />
              <div className="absolute -inset-1 bg-[#3B82F6]/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-[#9CA3AF] bg-clip-text text-transparent">
              AlgoArena
            </span>
          </div>

          {/* Navigation Links - Optional: Add if you have other pages */}
          <div className="hidden md:flex items-center gap-6">
            <a
              href="/"
              className="text-sm text-[#9CA3AF] hover:text-white transition-colors duration-200"
            >
              Problems
            </a>
            <a
              href="/contests"
              className="text-sm text-[#9CA3AF] hover:text-white transition-colors duration-200"
            >
              Contests
            </a>
            <a
              href="/discuss"
              className="text-sm text-[#9CA3AF] hover:text-white transition-colors duration-200"
            >
              Discuss
            </a>
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="flex items-center gap-3">
            <Show when="signed-in">
              <div className="flex items-center gap-3">
                {/* Profile Link */}
                <a
                  href={`/profile/${userId}`}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#1E2A3A] rounded-lg border border-[#374151] hover:border-[#3B82F6] transition-colors duration-200"
                >
                  <User className="w-4 h-4 text-[#3B82F6]" />
                  <span className="text-xs font-medium text-[#9CA3AF]">
                    Profile
                  </span>
                </a>

                {/* User Button with custom styling */}
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox:
                        "w-9 h-9 border-2 border-[#374151] hover:border-[#3B82F6] transition-colors duration-200 rounded-full",
                      userButtonPopoverCard:
                        "bg-[#1E2A3A] border border-[#374151] shadow-xl",
                      userButtonPopoverActions: "text-white",
                      userButtonPopoverActionButton:
                        "text-[#9CA3AF] hover:text-white hover:bg-[#374151]",
                      userButtonPopoverFooter: "hidden",
                    },
                  }}
                />
              </div>
            </Show>

            <Show when="signed-out">
              <div className="flex items-center gap-3">
                <SignInButton>
                  <button className="px-4 py-2 text-sm font-medium text-[#9CA3AF] hover:text-white transition-colors duration-200">
                    Sign in
                  </button>
                </SignInButton>

                <SignUpButton>
                  <button className="px-4 py-2 text-sm font-medium bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-all duration-200 shadow-lg shadow-[#3B82F6]/20">
                    Sign up
                  </button>
                </SignUpButton>
              </div>
            </Show>
          </div>
        </div>
      </div>
    </nav>
  );
};
