/**
 * Utility per gestire event listeners passivi
 * Migliora le performance su mobile
 */

import React from 'react';

export const addPassiveEventListener = (
  element: Element | Window | Document,
  event: string,
  handler: EventListener,
  options?: boolean | AddEventListenerOptions
) => {
  const passiveOptions = typeof options === 'boolean' 
    ? { passive: true, capture: options }
    : { passive: true, ...options };

  element.addEventListener(event, handler, passiveOptions);
  
  return () => {
    element.removeEventListener(event, handler, passiveOptions);
  };
};

export const addTouchEventListener = (
  element: Element | Window | Document,
  event: 'touchstart' | 'touchmove' | 'touchend' | 'touchcancel',
  handler: EventListener,
  options?: AddEventListenerOptions
) => {
  return addPassiveEventListener(element, event, handler, {
    passive: true,
    ...options
  });
};

// Hook React per event listeners passivi
export const usePassiveEventListener = (
  eventName: string,
  handler: EventListener,
  element?: Element | Window | Document,
  options?: AddEventListenerOptions
) => {
  const elementRef = React.useRef<Element | Window | Document>();
  
  React.useEffect(() => {
    const targetElement = element || elementRef.current || window;
    
    if (!targetElement?.addEventListener) return;
    
    const eventOptions = {
      passive: true,
      ...options
    };
    
    targetElement.addEventListener(eventName, handler, eventOptions);
    
    return () => {
      targetElement.removeEventListener(eventName, handler, eventOptions);
    };
  }, [eventName, handler, element, options]);
  
  return elementRef;
};

// Polyfill per supporto passive events
export const supportsPassive = (() => {
  let supportsPassive = false;
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get: function() {
        supportsPassive = true;
        return true;
      }
    });
    window.addEventListener('testPassive', () => {}, opts);
    window.removeEventListener('testPassive', () => {}, opts);
  } catch (e) {}
  return supportsPassive;
})();