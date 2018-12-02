import { ERModel, Entity, StringAttribute, EntityAttribute } from "gdmn-orm";

const uiModel = new ERModel();

const commandGroup = new Entity({
  name: 'commandGroup',
  lName: { en: { name: 'Command Group' } }
});
commandGroup.addUnique([
  new StringAttribute({
    name: 'name',
    required: true,
    lName: { en: { name: 'Group name' } }
  })
]);
uiModel.add(commandGroup);

const form = new Entity({
  name: 'form',
  lName: { en: { name: 'Form' } }
});
commandGroup.addUnique([
  new StringAttribute({
    name: 'name',
    required: true,
    lName: { en: { name: 'Form name' } }
  })
]);
uiModel.add(form);

const command = new Entity({
  name: 'command',
  lName: { en: { name: 'Command' } }
});
command.addUnique([
  new EntityAttribute({
    name: 'form',
    lName: { en: { name: 'Command form' } },
    entities: [
      commandGroup
    ]
  }),
  new EntityAttribute({
    name: 'group',
    lName: { en: { name: 'Command group' } },
    entities: [
      commandGroup
    ]
  }),
  new StringAttribute({
    name: 'command',
    lName: { en: { name: 'Command' } }
  })
]);
command.add(
  new StringAttribute({
    name: 'caption',
    lName: { en: { name: 'Caption' } }
  })
);
uiModel.add(command);

const uiForms = [
  {
    name: 'stompProtocol'
  }
];

const uiCommands = [
  {
    command: 'userProfile',
    form: 'mainHeader',
    group: 'userAccount',
    caption: 'User profile...'
  },
  {
    command: 'logout',
    form: 'mainHeader',
    group: 'userAccount',
    caption: 'Logout'
  },
  {
    command: 'deleteAccount',
    form: 'mainHeader',
    group: 'userAccount',
    caption: 'Delete account'
  },
];