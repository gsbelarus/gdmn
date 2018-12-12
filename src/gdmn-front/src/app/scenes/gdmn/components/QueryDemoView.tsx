import React from 'react';
import { PrimaryButton } from 'office-ui-fabric-react/lib/components/Button';
import { ERTranslatorRU, ICommand } from 'gdmn-nlp-agent';
import { parsePhrase, ParsedText, RusPhrase, RusWord } from 'gdmn-nlp';
import { EntityLink, EntityQuery, EntityQueryField, ERModel, IEntityQueryInspector, ScalarAttribute } from 'gdmn-orm';
import { EQueryTranslator } from '@gdmn/client-core';
import { TQueryTaskCmd, TTaskActionNames } from '@gdmn/server-api';

import { View } from '../../components/View';

interface IQueryDemoViewProps {
  erModel?: ERModel;
  apiGetData: (queryInspector: IEntityQueryInspector) => void;
}

function createNlpCommand(erTranslatorRU: ERTranslatorRU, parsedTextPhrase: RusPhrase): ICommand | never {
  return erTranslatorRU.process(parsedTextPhrase);
}

class QueryDemoView extends View<IQueryDemoViewProps> {
  public getViewCaption(): string {
    return 'Query';
  }

  public render() {
    console.log('ermodel ', this.props.erModel);

    return this.renderOneColumn(
      <div className="ViewBody">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div>
            <PrimaryButton onClick={this.handleSendQueryClick} text="SEND QUERY-TASK" disabled={!this.props.erModel} />
          </div>
        </div>
      </div>
    );
  }

  private handleSendQueryClick = () => {
    // -- TEST BEGIN
    if (!this.props.erModel || Object.keys(this.props.erModel.entities).length === 0) return;
    console.log('handleSendQueryClick');
    const entity = Object.values(this.props.erModel.entities)[0];
    const queries = [
      new EntityQuery(
        new EntityLink(
          entity,
          'alias',
          Object.values(entity!.attributes)
            .filter(value => value instanceof ScalarAttribute)
            .map(value => new EntityQueryField(value))
        )
      )
    ];

    Promise.all(
      queries.map(query => {
        this.props.apiGetData(query.inspect());
      })
    );
    // -- TEST END

    /*
    // -- TEST BEGIN
    const phrase = 'покажи все организации и школы из минска и пинска';
    const parsedPhrase = parsePhrase<RusWord>(phrase).phrase;

    if (!parsedPhrase || !this.props.erModel) return;

    const erTranslatorRU = new ERTranslatorRU(this.props.erModel);
    try {
      const nlpCmd: ICommand = createNlpCommand(erTranslatorRU, parsedPhrase);
      const queries = EQueryTranslator.process(nlpCmd);

      Promise.all(
        queries.map(query => {
          this.props.apiGetData(query.inspect()); // query.serialize());
        })
      );
    } catch (e) {
      console.log('createCommand() error:', e);
    }
    // -- TEST END
    */
  };
}

export { QueryDemoView, IQueryDemoViewProps };
