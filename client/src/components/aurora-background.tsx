interface AuroraBackgroundProps {
  opacity?: number;
  speed?: 'slow' | 'medium' | 'fast';
  showGrain?: boolean;
}

export function AuroraBackground({
  opacity = 0.6,
  speed = 'medium',
  showGrain = true,
}: AuroraBackgroundProps) {
  const speedMap = {
    slow: '40s',
    medium: '25s',
    fast: '12s',
  };

  return (
    <div className="aurora-container" style={{ opacity }}>
      <div className="aurora-base" />
      <div className="aurora-layers">
        <div 
          className="aurora-blob aurora-blob-1" 
          style={{ animationDuration: speedMap[speed] }} 
        />
        <div 
          className="aurora-blob aurora-blob-2" 
          style={{ animationDuration: speedMap[speed] }} 
        />
        <div 
          className="aurora-blob aurora-blob-3" 
          style={{ animationDuration: speedMap[speed] }} 
        />
        <div 
          className="aurora-blob aurora-blob-4" 
          style={{ animationDuration: speedMap[speed] }} 
        />
      </div>
      <div className="aurora-overlay" />
      {showGrain && (
        <div className="aurora-grain">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <filter id="noiseFilter">
              <feTurbulence 
                type="fractalNoise" 
                baseFrequency="0.65" 
                numOctaves="3" 
                stitchTiles="stitch" 
              />
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)" />
          </svg>
        </div>
      )}
    </div>
  );
}
