import { useState, useEffect } from 'react';

function useTickUpdate(interval = 1000) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick(prevTick => prevTick + 1);
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return tick;
}

export default useTickUpdate