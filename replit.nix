{ pkgs }: {
  deps = [
    # --- Frontend: Next.js & TypeScript ---
    pkgs.nodejs_20
    pkgs.nodePackages.typescript-language-server
    pkgs.yarn

    # --- Backend: FastAPI & AI (Python 3.11) ---
    pkgs.python311
    pkgs.python311Packages.pip
    pkgs.python311Packages.uvicorn

    # --- Audio Engine (Critical for Voice-to-Action) ---
    # This allows Whisper/Llama to decode Laxmi's voice recordings
    pkgs.ffmpeg-full

    # --- Database: MongoDB Connectivity ---
    # Includes tools for data migration and system-level DNS support
    pkgs.mongodb-tools
    pkgs.openssl 

    # --- AI Performance Tools ---
    # Helps with faster local processing if you use small on-device models
    pkgs.libiconv
    pkgs.gcc
  ];

  env = {
    # Ensures Python finds the installed Nix libraries correctly
    PYTHONPATH = ".:./.pythonlibs";
  };
}