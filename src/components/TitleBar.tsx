import React from "react";

export default React.memo(() => {
  const [isMaximized, setIsMaximized] = React.useState(false);

  React.useEffect(() => {
    const checkMaximized = async () => {
      const maximized = await window.electron.windowIsMaximized();
      setIsMaximized(maximized);
    };
    checkMaximized();

    // Check periodically (window can be maximized by double-clicking title bar)
    const interval = setInterval(checkMaximized, 500);
    return () => clearInterval(interval);
  }, []);

  const handleMinimize = () => {
    window.electron.windowMinimize();
  };

  const handleMaximize = () => {
    window.electron.windowMaximize();
    setIsMaximized((prev) => !prev);
  };

  const handleClose = () => {
    window.electron.windowClose();
  };

  return (
    <div
      className="flex items-center justify-between glass-strong px-4 py-2.5 border-b border-white/10 select-none backdrop-blur-xl"
      style={{ WebkitAppRegion: "drag" as any }}
    >
      {/* App Title */}
      <div
        className="flex items-center gap-2.5 px-3"
        style={{ WebkitAppRegion: "drag" as any }}
      >
        <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-blue-300 to-blue-500 shadow-lg ring-2 ring-blue-400/30"></div>
        <span className="text-white font-semibold text-sm tracking-wide">
          FicherApp
        </span>
      </div>

      {/* Window Controls */}
      <div
        className="flex items-center gap-1"
        style={{ WebkitAppRegion: "no-drag" as any }}
      >
        {/* Minimize Button */}
        <button
          onClick={handleMinimize}
          className="w-9 h-9 flex items-center justify-center rounded-lg glass-blue hover:bg-blue-500/50 hover:scale-110 active:scale-95 transition-all duration-200 group border border-white/20 hover:border-white/40"
          title="Minimizar"
        >
          <svg
            className="w-4 h-4 text-white opacity-70 group-hover:opacity-100 transition-opacity"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
          </svg>
        </button>

        {/* Maximize/Restore Button */}
        <button
          onClick={handleMaximize}
          className="w-9 h-9 flex items-center justify-center rounded-lg glass-blue hover:bg-blue-500/50 hover:scale-110 active:scale-95 transition-all duration-200 group border border-white/20 hover:border-white/40"
          title={isMaximized ? "Restaurar" : "Maximizar"}
        >
          {isMaximized ? (
            <svg
              className="w-3.5 h-3.5 text-white opacity-70 group-hover:opacity-100 transition-opacity"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              {" "}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 5a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 10a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1h-5a1 1 0 01-1-1v-5z"
              />{" "}
            </svg>
          ) : (
            // Icono de VENTANA (modo ventana flotante)
            <svg
              className="w-3.5 h-3.5 text-white opacity-70 group-hover:opacity-100 transition-opacity"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          )}
        </button>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-500/30 hover:bg-red-500/60 backdrop-blur-md border border-red-400/40 hover:border-red-400/60 hover:scale-110 active:scale-95 transition-all duration-200 group"
          title="Cerrar"
        >
          <svg
            className="w-4 h-4 text-white opacity-80 group-hover:opacity-100 transition-opacity"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
});
