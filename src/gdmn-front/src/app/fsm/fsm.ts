import { createStateType, Flow } from "./types";

const logged = createStateType('LOGGED', resolve => (userName: string) => resolve({ userName }) );
const showData = createStateType('SHOW_DATA', resolve => (queryPhrase: string) => resolve({ queryPhrase }));

export const flow: Flow = [
  {
    fromState: logged.getType(),
    toState: showData.getType()
  }
];
