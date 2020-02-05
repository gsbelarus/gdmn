import { ICommand } from "./command";
import { ERTranslatorError } from "./types";

export function command2Text(command: ICommand): string {
  if (command.action !== 'QUERY') {
    throw new ERTranslatorError('UNSUPPORTED_COMMAND_TYPE');
  }

  const eq = command.payload;
  const entity = eq.link.entity;
  const res = [`Покажи все ${entity.name}.`];

  // TODO: не обрабатываются цепочки условий OR, AND
  if (eq.options?.where?.length) {
    for (const { contains } of eq.options.where) {
      if (contains?.length) {
        for (const { alias, attribute, value } of contains) {
          if (alias === eq.link.alias) {
            res.push(`Атрибут ${attribute.name} содержит "${value}".`);
          } else {
            const attrLink = entity.attributes[alias];
            if (attrLink) {
              res.push(`Атрибут ${attribute.name} атрибута ${attrLink.name} содержит "${value}".`);
            }
          }
        }
      }
    }
  }

  if (eq.options?.order?.length) {
    const ordr = eq.options.order[0];
    res.push(`Отсортируй по ${ordr.attribute.name}${ordr.type === 'DESC' ? ', по убыванию.' : '.'}`);
  }

  return res.join(' ');
};