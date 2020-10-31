import React, { useRef, useEffect } from 'react';
import useForceUpdate from './useForceUpdate';
import raf from '../utils/raf';

export default function useFreshState(defaultValue, propValue){
  const valueRef = useRef(defaultValue);
  const forceUpdate = useForceUpdate();
  const rafRef = useRef();

  function setValue(newValue) {
    valueRef.current = newValue;
    forceUpdate();
  }

  function cleanUp() {
    if (rafRef?.current) {
      raf.cancel(rafRef?.current);
    }
  }

  function rafSyncValue(newValue) {
    cleanUp();
    rafRef.current = raf(() => {
      setValue(newValue);
    });
  }

  function getValue(displayValue = false) {
    if (displayValue) {
      return propValue || valueRef.current;
    }

    return valueRef.current;
  }

  useEffect(() => {
    if (propValue) {
      rafSyncValue(propValue);
    }
  }, [propValue]);

  useEffect(
    () => () => {
      cleanUp();
    },
    [],
  );

  return [getValue, setValue];
}
