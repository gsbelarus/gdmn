import { createAction } from 'typesafe-actions';

export const setMorphText = createAction('MORPHOLOGY/SET_MORPH_TEXT', resolve => {
    return (text: string) => resolve(text);
  });

export type SetMorphText = typeof setMorphText;

