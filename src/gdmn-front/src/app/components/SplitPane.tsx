import React, {useRef, useState, useEffect, createRef, createContext, useContext, ReactNode} from 'react';
import { getTheme } from 'office-ui-fabric-react';

export interface ISplitPaneContext {
  leftWidth: number,
  setLeftWidth: React.Dispatch<React.SetStateAction<number>>
}

interface ISplitPaneProps {
  children: ReactNode[],
  [x: string] : any
}

const splitPaneContext = createContext({} as ISplitPaneContext);

export default function SplitPane(props: ISplitPaneProps) {
  const [leftWidth, setLeftWidth] = useState(150);
  const separatorXPosition = useRef(0);

  const splitPaneRef = createRef<HTMLDivElement>();

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    separatorXPosition.current = e.clientX;
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!separatorXPosition.current) {
      return;
    }

    const newLeftWidth = leftWidth + e.clientX - separatorXPosition.current;
    separatorXPosition.current = e.clientX;

    setLeftWidth(newLeftWidth);
  };

  const onMouseUp = () => {
    separatorXPosition.current = 0;
  };

  useEffect(() => {
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      document.removeEventListener("mouseup", onMouseUp);
    };
  });

  useEffect(() => {
    document.addEventListener("mousemove", onMouseMove);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
    };
  });

  return (
    <div
      {...props}
      className="split-pane"
      ref={splitPaneRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'row'
      }}
    >
      <splitPaneContext.Provider value={{ leftWidth, setLeftWidth }}>
        {props.children[0]}
        <div className="separator" onMouseDown={onMouseDown} style={{cursor: 'col-resize',  width: '6px', height: '100%', background: `linear-gradient(90deg, ${getTheme().palette.white} 0%, ${getTheme().palette.neutralSecondaryAlt} 50%, ${getTheme().palette.white} 100%)`}} />
        {props.children[1]}
      </splitPaneContext.Provider>
    </div>
  );
}

SplitPane.Left = function SplitPaneTop(props: any) {
  const leftRef = createRef<any>();
  const { leftWidth, setLeftWidth } = useContext(splitPaneContext);

  useEffect(() => {
    if (!leftWidth) {
      setLeftWidth(leftRef.current.clientHeight);
      leftRef.current.style.flex = "none";
      return;
    }

    leftRef.current.style.width = `${leftWidth}px`;
  }, [leftWidth]);

  return <div {...props} className="split-pane-left" ref={leftRef} style={{overflow: 'auto'}} />;
};

SplitPane.Right = function SplitPaneBottom(props: any) {
  return <div {...props} className="split-pane-right" style={{width: '100%'}} />;
};
