import React, { useEffect, useState, useRef, useMemo } from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { gdmnActions } from '../gdmn/actions';
import { IBPProps } from './BP.types';
import { CommandBar, ICommandBarItemProps, Dropdown, getTheme, Stack, Label } from 'office-ui-fabric-react';
import { getLName } from 'gdmn-internals';
import { mxEvent, mxGraph, mxRubberband, mxHierarchicalLayout, mxConstants } from 'mxgraph/javascript/mxClient';
import { fsmActions } from '@src/app/fsm/actions';
import { FSM } from '@src/app/fsm/fsm';
import { flowcharts } from '@src/app/fsm/flowcharts';
import { IFSMState } from '@src/app/fsm/types';
import { fsmSignals } from '@src/app/fsm/fsmSignals';
import { getPlugins } from '@src/app/fsm/plugins';

interface IGraphState{
  graph: any;
};

export const BP = CSSModules( (props: IBPProps): JSX.Element => {

  const { url, viewTab, dispatch, fsm, theme, history } = props;
  const [flowchart, setFlowchart] = useState( fsm ? fsm.flowchart : Object.values(flowcharts).length ? Object.values(flowcharts)[0] : null );
  const [graphState, setGraphState] = useState<IGraphState | null>(null);
  const graphContainer = useRef(null);

  useEffect( () => {
    if (!viewTab) {
      dispatch(gdmnActions.addViewTab({
        url,
        caption: 'BP',
        canClose: true
      }));
    }
  }, []);

  const graphStyles = useMemo( () => {
    const t = getTheme();
    return {
      current: {
        terminator: 'fillColor=firebrick;strokeColor=maroon;fontColor=white;',
        process: 'fillColor=mediumblue;strokeColor=navy;fontColor=white;'
      },
      regular: {
        terminator: 'fillColor=pink;strokeColor=red;',
        process: 'fillColor=powderblue;strokeColor=cornflowerblue;'
      }
    };
  }, [theme]);

  useEffect( () => {
    const container = graphContainer.current;

    if (!flowchart || !container) return;

    // Disables the built-in context menu
    mxEvent.disableContextMenu(container);

    // Creates the graph inside the given container
    const graph = graphState && graphState.graph ? graphState.graph : new mxGraph(container);

    if (!graphState || !graphState.graph) {
      // Enables rubberband selection
      new mxRubberband(graph);

      const vertexStyle = graph.getStylesheet().getDefaultVertexStyle();
      vertexStyle[mxConstants.STYLE_PERIMETER_SPACING] = 2;
      vertexStyle[mxConstants.STYLE_FONTFAMILY] = 'Segoe UI';

      const edgeStyle = graph.getStylesheet().getDefaultEdgeStyle();
      edgeStyle[mxConstants.STYLE_ROUNDED] = true;
      edgeStyle[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_CONNECTOR;
      edgeStyle[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_CLASSIC;
      edgeStyle[mxConstants.STYLE_STROKECOLOR] = getTheme().semanticColors.bodyText;
      edgeStyle[mxConstants.STYLE_FONTCOLOR] = getTheme().semanticColors.bodyText;
      edgeStyle[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = getTheme().semanticColors.bodyBackground;

      graph.gridSize = 20;

      graph.addListener(mxEvent.CLICK, (_sender: any, evt: any) => {
        var cell = evt.getProperty("cell"); // cell may be null
        if (cell != null) {
          console.log(cell);
          graph.setSelectionCell(cell);
        }
        evt.consume();
      });
    }

    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    const parent = graph.getDefaultParent();

    const layout = new mxHierarchicalLayout(graph);

    layout.interRankCellSpacing = 40;
    layout.forceConstant = 80;

    const w = 200;
    const h = 32;

    // Adds cells to the model in a single step
    graph.getModel().beginUpdate();
    try
    {
      graph.removeCells(graph.getChildVertices(parent));

      const map = new Map<IFSMState, any>();

      const createVertex = (fsmState: IFSMState, terminator: boolean) => {
        const variantStyle = fsm && fsm.state === fsmState ? graphStyles.current : graphStyles.regular;

        const style = terminator
          ? 'shape=rectangle;rounded=1;' + variantStyle.terminator
          : 'shape=rectangle' + variantStyle.process;

        const label = fsmState.label ? getLName(fsmState.label) : '';

        const v = graph.insertVertex(
          parent,
          fsmState.id,
          label ? label : fsmState.type.id,
          0,
          0,
          w,
          h,
          style);
        map.set(fsmState, v);
      };

      Object.entries(flowchart.rules).forEach( ([name, rule]) => {
        if (!map.has(rule.state)) {
          createVertex(rule.state, rule.id === 'BEGIN');
        }

        if (!map.has(rule.nextState)) {
          createVertex(rule.nextState, false);
        }

        /*
        const variantStyle = fsm && fsm.block === block ? graphStyles.current : graphStyles.regular;

        const style = block.type.shape === 'PROCESS'
          ? 'shape=rectangle' + variantStyle.process
          : block.type.shape === 'DECISION'
          ? 'shape=rhombus'
          : 'shape=rectangle;rounded=1;' + variantStyle.terminator;

        const v = graph.insertVertex(
          parent,
          null,
          block.label ? block.label : name,
          0,
          0,
          w,
          block.type.shape === 'DECISION' ? h * 1.5 : h,
          style);
        map.set(block, v);
        */
      });

      const connectStates = (fromState: IFSMState, toState: IFSMState, edgeLabel: string = '') => {
        graph.insertEdge(parent, null, edgeLabel, map.get(fromState), map.get(toState));
      };

      Object.values(flowchart.rules).forEach( rule => {
        connectStates(rule.state, rule.nextState, rule.id);
      });

      layout.execute(parent);
    }
    finally
    {
      // Updates the display
      graph.getModel().endUpdate();
    }

    setGraphState({ graph });

  }, [flowchart, graphContainer.current, fsm]);

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'active',
      text: 'Активный',
      disabled: !fsm || fsm.flowchart === flowchart,
      iconProps: {
        iconName: 'CRMProcesses'
      },
      onClick: () => setFlowchart(fsm!.flowchart)
    },
    {
      key: 'start',
      text: 'Старт',
      disabled: !!fsm || !flowchart,
      iconProps: {
        iconName: 'Play'
      },
      onClick: () => dispatch(fsmActions.setFSM(FSM.create(flowchart!, getPlugins(history)).processSignal(fsmSignals.start)))
    },
    {
      key: 'stop',
      text: 'Стоп',
      disabled: !fsm || flowchart !== fsm.flowchart,
      iconProps: {
        iconName: 'Stop'
      },
      onClick: () => dispatch(fsmActions.destroyFSM())
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
              selectedKey={flowchart ? flowchart.id : undefined}
              onChange={ (_event, option) => option && typeof option.key === 'string' && setFlowchart(flowcharts[option.key]) }
              placeholder="Select a business process"
              options={Object.entries(flowcharts).map( ([key, f]) =>({ key, text: getLName(f.label, ['ru']) }) )}
              //styles={{ dropdown: { width: 300 } }}
            />
            {
              flowchart
              &&
              <div
                styleName="BPCard"
              >
                {getLName(flowchart.description, ['ru'])}
              </div>
            }
            <Label>Current state: {fsm && fsm.state.type.id}</Label>
            <Label>Path:</Label>
            <Stack>
              {
                fsm && fsm.path.map( s => <div>{s.type.id}</div> )
              }
            </Stack>
          </div>
          <div styleName="BPFlow" ref={graphContainer}>

          </div>
        </div>
      </div>
    </div>
  );
}, styles, { allowMultiple: true });