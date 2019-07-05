import React, { useEffect, useState } from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { gdmnActions } from '../gdmn/actions';
import { IBPProps } from './BP.types';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react';
import { businessProcesses } from '@src/app/fsm/fsm';
import { getLName } from 'gdmn-internals';
import { Edge as DagreEdge, graphlib, layout } from 'dagre';
import { Rect } from './Rect';
import { Edge } from './Edge';

export const BP = CSSModules( (props: IBPProps): JSX.Element => {

  const { url, viewTab, dispatch } = props;
  const [activeBP, setActiveBP] = useState( Object.keys(businessProcesses).length ? Object.keys(businessProcesses)[0] : null );
  const bp = activeBP ? businessProcesses[activeBP] : undefined;

  useEffect( () => {
    if (!viewTab) {
      dispatch(gdmnActions.addViewTab({
        url,
        caption: 'BP',
        canClose: true
      }));
    }
  }, []);

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'start',
      text: 'Старт',
      iconProps: {
        iconName: 'CRMProcesses'
      },
      onClick: () => {}
    }
  ];

  // Create a new directed graph
  const g = new graphlib.Graph({ multigraph: true, directed: true });

  if (bp) {
    // Set an object for the graph label
    g.setGraph({});

    // Default to assigning a new object as a label for each new edge.
    g.setDefaultEdgeLabel(() => {
      return {};
    });

    const created: { [name: string]: boolean } = {};

    const createStateNode = (label: string) => {
      if (!created[label]) {
        g.setNode(label, {
          label,
          width: label.length * 9 + 8,
          height: 26,
          className: 'state',
          rank: 'min'
        });
        created[label] = true;
      }
    };

    bp.flow.forEach( t => {
      createStateNode(t.fromState);
      createStateNode(t.toState);
      g.setEdge(t.fromState, t.toState);
      if (t.returning) {
        g.setEdge(t.toState, t.fromState);
      }
    });

    g.graph().ranksep = 64;
    g.graph().marginx = 2;
    g.graph().marginy = 2;
    layout(g);
  }

  const makeRect = (n: string, idx: number) => {
    const nd = g.node(n);
    if (!nd) return null;

    const x = nd.x - nd.width / 2;
    const y = nd.y - nd.height / 2;
    return (
      <Rect key={idx} x={x} y={y} width={nd.width} height={nd.height} text={nd.label} className={nd.className} />
    );
  };

  const makeEdge = (e: DagreEdge, idx: number) => <Edge key={idx} points={g.edge(e).points} />;

  return (
    <div styleName="SGrid">
      <div styleName="SGridTop">
        <CommandBar items={commandBarItems} />
      </div>
      <div styleName="SGridTable">
        <div styleName="BPList">
          <div styleName="BPColumn">
            {
              Object.entries(businessProcesses).map( ([name, bp]) =>
                <div
                  styleName={`BPCard ${ name === activeBP ? 'SelectedBP' : '' }`}
                  onClick={ () => setActiveBP(name) }
                >
                  <h2>{getLName(bp.caption, ['ru'])}</h2>
                  <article>{getLName(bp.description, ['ru'])}</article>
                </div>
              )
            }
          </div>
          <div styleName="BPFlow">
            {g.graph() ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={g.graph().width}
                height={g.graph().height}
                viewBox={'0 0 ' + g.graph().width + ' ' + g.graph().height}
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <marker
                    id="arrow"
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerUnits="strokeWidth"
                    markerWidth="10"
                    markerHeight="8"
                    orient="auto"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 Z" style={{ strokeWidth: '1', fill: 'gray' }} />
                  </marker>
                </defs>
                <g>
                  {g.nodes().map((n, idx) => makeRect(n, idx))}
                  {g.edges().map((e, idx) => makeEdge(e, idx))}
                </g>
              </svg>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}, styles, { allowMultiple: true });