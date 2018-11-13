import { ActionType, createAction } from 'typesafe-actions';

export const morphologyActions = {
  setMorphText: createAction('demos/morphology/SET_MORPH_TEXT', resolve => {
    return (text: string) => resolve(text);
  })
};

export type MorphologyActions = ActionType<typeof morphologyActions>;

