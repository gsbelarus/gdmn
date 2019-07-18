import React, { useEffect, useState } from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { gdmnActions } from '../gdmn/actions';
import { IBPProps } from './BP.types';
import { CommandBar, ICommandBarItemProps, Dropdown } from 'office-ui-fabric-react';
import { businessProcesses } from '@src/app/fsm/fsm';
import { getLName } from 'gdmn-internals';
import cytoscape, { Core } from 'cytoscape';
import dagre from 'cytoscape-dagre';
//import nodeHtmlLabel from 'cytoscape-node-html-label';

cytoscape.use(dagre);

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

    const cyInstance = cytoscape(
      {
        container: document.getElementById('cy'),

        zoom: 1,
        boxSelectionEnabled: false,

        //wheelSensitivity: 0.07,

        style: [
          {
            selector: 'node',
            css: {
              'height': 'label',
              'width': 'label',
              'border-color': '#000',
              'border-width': 1,
              'content': 'data(label)',
              'text-valign': 'center',
              'font-size': '12',
              //'font-weight': 400,
              'font-family': 'Segoe UI,Helvetica,Roboto,sans',
              'color': 'white',
              'background-color': '#404040',
              'shape': 'rectangle',
              'padding': '12px'
            }
          },
          {
            selector: 'node#S_TEST_CONDITION',
            css: {
              'shape': 'diamond'
            }
          },
          {
            selector: 'edge',
            css: {
              'width': 1,
              'mid-target-arrow-shape': 'vee',
              'mid-target-arrow-color': 'gray',
              'line-color': 'gray',
              'curve-style': 'bezier'
            } as any
          }
        ],

        elements: {
          nodes: Object.values(bp.states).map( state => ({ data: { id: state.id, state, label: state.label ? state.label : state.type.label ? state.type.label : state.id } }) ),
          edges: bp.flow.flatMap( e => {
            return { data: { source: e.sFrom.id, target: e.sTo.id } };
           } )
        },

        layout: {
          name: 'dagre',
          fit: false,
          // dagre algo options, uses default value on undefined
          nodeSep: undefined, // the separation between adjacent nodes in the same rank
          edgeSep: undefined, // the separation between adjacent edges in the same rank
          rankSep: undefined, // the separation between adjacent nodes in the same rank
          rankDir: undefined, // 'TB' for top to bottom flow, 'LR' for left to right,
          ranker: undefined, // Type of algorithm to assign a rank to each node in the input graph. Possible values: 'network-simplex', 'tight-tree' or 'longest-path'
          minLen: function( _edge: any ){ return 1; }, // number of ranks to keep between the source and target of the edge
          edgeWeight: function( _edge: any ){ return 1; }, // higher weight edges are generally made shorter and straighter than lower weight edges
        } as any
      }
    );

    // set nodeHtmlLabel for your Cy instance
    /*
    if (!Object.getPrototypeOf(cyInstance)['nodeHtmlLabel']) {
      nodeHtmlLabel(cytoscape);
    };

    (cyInstance as any).nodeHtmlLabel([{
        query: 'node',
        valign: 'top',
        halign: 'left',
        valignBox: 'bottom',
        halignBox: 'right',
        tpl: (data: any) => {
          let stateParams = '';

          if (data.state && data.state.params) {
            stateParams =
              '<ul>' +
                Object.entries(data.state.params).map( ([name, p]) => '<li>' + name + ': ' + p + '</li>' )
              '</ul>';
          }

          return (
            '<div class="BPNode">' +
              '<div class="BPNodeTitle">' +
                data.label +
              '</div>' +
              stateParams +
            '</div>'
          );
        }
      }
    ]);
    */

    setCy(cyInstance);
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
            <Dropdown
              label="Бизнес-процесс"
              selectedKey={activeBP}
              onChange={ (_event, option) => option && typeof option.key === 'string' && setActiveBP(option.key) }
              placeholder="Select a business process"
              options={Object.entries(businessProcesses).map( ([key, bp]) =>({ key, text: getLName(bp.label, ['ru']) }) )}
              //styles={{ dropdown: { width: 300 } }}
            />
            {
              activeBP
              &&
              <div
                styleName="BPCard"
              >
                {getLName(businessProcesses[activeBP].description, ['ru'])}
              </div>
            }
          </div>
          <div styleName="BPFlow" id="cy">

          </div>
        </div>
      </div>
    </div>
  );
}, styles, { allowMultiple: true });