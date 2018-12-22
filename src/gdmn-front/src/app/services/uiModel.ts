import { Entity, EntityAttribute, ERModel, StringAttribute } from 'gdmn-orm';

export const uiModel = new ERModel();

const commandGroup = new Entity({
  name: 'commandGroup',
  lName: { en: { name: 'Command Group' } }
});

const commandGroupName = new StringAttribute({
  name: 'name',
  required: true,
  lName: { en: { name: 'Group name' } }
});

commandGroup.add(commandGroupName);
commandGroup.addUnique([commandGroupName]);

uiModel.add(commandGroup);

const form = new Entity({
  name: 'form',
  lName: { en: { name: 'Form' } }
});

const formName = new StringAttribute({
  name: 'name',
  required: true,
  lName: { en: { name: 'Form name' } }
});

form.add(formName);
form.addUnique([formName]);
uiModel.add(form);

const command = new Entity({
  name: 'command',
  lName: { en: { name: 'Command' } }
});

const commandForm = new EntityAttribute({
  name: 'form',
  lName: { en: { name: 'Command form' } },
  entities: [form]
});

const commandCommandGroup = new EntityAttribute({
  name: 'group',
  lName: { en: { name: 'Command group' } },
  entities: [commandGroup]
});

const commandCommand = new StringAttribute({
  name: 'command',
  lName: { en: { name: 'Command' } }
});

command.add(commandForm);
command.add(commandCommandGroup);
command.add(commandCommand);

command.addUnique([commandForm, commandCommandGroup, commandCommand]);

command.add(
  new StringAttribute({
    name: 'caption',
    lName: { en: { name: 'Caption' } }
  })
);
command.add(
  new StringAttribute({
    name: 'iconName',
    lName: { en: { name: 'Icon name' } }
  })
);
command.add(
  new StringAttribute({
    name: 'link',
    lName: { en: { name: 'Link' } }
  })
);
command.add(
  new StringAttribute({
    name: 'action',
    lName: { en: { name: 'Action' } }
  })
);
uiModel.add(command);
