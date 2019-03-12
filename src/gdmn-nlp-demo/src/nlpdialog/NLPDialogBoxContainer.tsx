import { connect } from 'react-redux';
import { State } from '../store';
import { ChatBox } from './NLPDialogBox';
import { NLPDialogAction } from './reducer';
import { addNLPItem } from './actions';
import { ThunkDispatch } from 'redux-thunk';
import { Dispatch } from 'redux';
import { parsePhrase, ParsedText, RusPhrase } from 'gdmn-nlp';

export const ChatBoxContainer = connect(
  (state: State) => ({
    nlpDialog: state.nlpDialog
  }),
  (dispatch: ThunkDispatch<State, never, NLPDialogAction>) => ({
    addNLPMessage: (text: string) => dispatch(
      (dispatch: Dispatch<NLPDialogAction>, getState: () => State) => {
        dispatch(addNLPItem({ item: { who: 'me', text } }));

        let parsedText: ParsedText | undefined = undefined;
        let command;
        let errors: string[] = [];

        try {
          parsedText = parsePhrase(text.trim());
        }
        catch(e) {
          dispatch(addNLPItem({ item: { who: 'it', text: e.message } }));
        }

        if (parsedText && parsedText.phrase instanceof RusPhrase) {
          Object.entries(getState().ermodel).some( ([n, m]) => {
            if (m && !m.loading && m.erModel && m.erTranslatorRU) {
              try {
                command = m.erTranslatorRU.process(parsedText!.phrase as RusPhrase);
                return true;
              }
              catch (e) {
                errors.push(e.message);
              }
            }

            return false;
          });
        }

        if (command) {
          dispatch(addNLPItem({ item: { who: 'it', text: 'готово!' }, parsedText }));
        } else {
          errors.forEach( text => dispatch(addNLPItem({ item: { who: 'it', text } })) )
        }
      }
    )
  })
)(ChatBox);