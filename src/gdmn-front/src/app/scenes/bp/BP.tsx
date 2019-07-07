import React, { useEffect, useState } from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { gdmnActions } from '../gdmn/actions';
import { IBPProps } from './BP.types';
import { CommandBar, ICommandBarItemProps, Stylesheet } from 'office-ui-fabric-react';
import { businessProcesses } from '@src/app/fsm/fsm';
import { getLName } from 'gdmn-internals';
import cytoscape, { Core } from 'cytoscape';

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

        style: [
          {
            selector: 'node',
            css: {
              'height': 40,
              'width': 200,
              'border-color': '#000',
              'border-width': 1,
              'content': 'data(id)',
              'text-valign': 'center',
            }
          },
          {
            selector: 'edge',
            css: {
              'width': 2,
              'target-arrow-shape': 'triangle',
              'line-color': '#ffaaaa',
              'target-arrow-color': '#ffaaaa',
              'curve-style': 'bezier'
            }
          }
        ],

        elements: {
          nodes: bp.nodes.map( n => ({ data: { id: n.id }, style: { 'shape': 'round-rectangle' } }) ),
          edges: bp.flow.flatMap( e => {
            const res = [{ data: { source: e.fromState, target: e.toState } }];
            if (e.returning) {
              res.push({ data: { source: e.toState, target: e.fromState } });
            }
            return res;
           } )
        },

        layout: {
          name: 'breadthfirst',
          directed: true,
          padding: 10
        }
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