import React, { useEffect, useState } from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { gdmnActions } from '../gdmn/actions';
import { IBPProps } from './BP.types';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react';
import { businessProcesses } from '@src/app/fsm/fsm';
import { getLName } from 'gdmn-internals';
import cytoscape, { Core } from 'cytoscape';
import { isTransition } from '@src/app/fsm/types';
import dagre from 'cytoscape-dagre';

cytoscape.use( dagre );

export const BP = CSSModules( (props: IBPProps): JSX.Element => {

  const { url, viewTab, dispatch } = props;
  const [activeBP, setActiveBP] = useState( Object.keys(businessProcesses).length ? Object.keys(businessProcesses)[0] : null );
  const bp = activeBP ? businessProcesses[activeBP] : undefined;
  const [cy, setCy] = useState<Core | null>(null);

  useEffect( () => {
    if (!viewTab) {
      dispatch(gdmnActions.addViewTab({
        url,
        caption: 'BP',
        canClose: true
      }));
    }
  }, []);

  useEffect( () => {
    if (!bp) return;

    setCy(cytoscape(
      {
        container: document.getElementById('cy'),

        boxSelectionEnabled: false,
        autounselectify: false,

        wheelSensitivity: 0.07,

        style: [
          {
            selector: 'node',
            css: {
              'height': 40,
              'width': 200,
              'border-color': '#000',
              'border-width': 1,
              'content': 'data(id)',
              'text-valign': 'center'
            }
          },
          {
            selector: 'edge',
            css: {
              'width': 2,
              'target-arrow-shape': 'triangle',
              'line-color': '#ffaaaa',
              'target-arrow-color': '#ffaaaa',
              'curve-style': 'bezier',
              'content': 'data(label)'
            }
          },
          {
            selector: 'edge.returning',
            css: {
              'width': 2,
              'line-color': '#ffaaaa',
              'target-arrow-shape': 'triangle',
              'target-arrow-color': '#ffaaaa',
              'source-arrow-shape': 'triangle',
              'source-arrow-color': '#ffaaaa',
            }
          }
        ],

        elements: {
          nodes: bp.nodes.map( n => ({ data: { id: n.id }, style: { 'shape': 'round-rectangle' } }) ),
          edges: bp.flow.flatMap( e => {
            if (isTransition(e)) {
              if (e.returning) {
                return { data: { source: e.fromState, target: e.toState }, classes: 'returning' };
              } else {
                return { data: { source: e.fromState, target: e.toState } };
              }
            } else {
              return [
                { data: { source: e.fromState, target: e.thenState } },
                { data: { source: e.fromState, target: e.elseState } }
              ];
            }
           } )
        },

        layout: {
          name: 'dagre',
          // dagre algo options, uses default value on undefined
          nodeSep: undefined, // the separation between adjacent nodes in the same rank
          edgeSep: undefined, // the separation between adjacent edges in the same rank
          rankSep: undefined, // the separation between adjacent nodes in the same rank
          rankDir: undefined, // 'TB' for top to bottom flow, 'LR' for left to right,
          ranker: undefined, // Type of algorithm to assign a rank to each node in the input graph. Possible values: 'network-simplex', 'tight-tree' or 'longest-path'
          minLen: function( _edge: any ){ return 1; }, // number of ranks to keep between the source and target of the edge
          edgeWeight: function( _edge: any ){ return 1; }, // higher weight edges are generally made shorter and straighter than lower weight edges
        } as any
      })
    );
  }, [bp]);

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
          <div styleName="BPFlow" id="cy">

          </div>
        </div>
      </div>
    </div>
  );
}, styles, { allowMultiple: true });