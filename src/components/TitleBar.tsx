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
  <div>
    {/* App Title */}
    <div>
      <div>
        <div></div>
        <span>FicherApp</span>
      </div>

      {/* Window Controls */}
      <div>
        {/* Minimize Button */}
        <button onClick={handleMinimize} title="Minimizar">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
          </svg>
        </button>

        {/* Maximize/Restore Button */}
        <button onClick={handleMaximize} title={isMaximized ? "Restaurar" : "Maximizar"}>
          {isMaximized ? (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 5a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 10a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1h-5a1 1 0-1-1v-5z"
              />
            </svg>
          ) : (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          )}
        </button>

        {/* Close Button */}
        <button onClick={handleClose} title="Cerrar">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
);

});
