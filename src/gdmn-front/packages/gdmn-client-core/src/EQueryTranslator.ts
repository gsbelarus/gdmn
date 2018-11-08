import { EntityAttribute, EntityLink, EntityQuery, EntityQueryField, EntityQueryOptions } from 'gdmn-orm';
import { Determiner, ICommand, ICommandObject } from 'gdmn-nlp-agent';

class EQueryTranslator {
  public static process(command: ICommand): EntityQuery[] {
    if (command.objects) {
      switch (command.action) {
        case 'SHOW':
          return command.objects.map(commandObject => {
            const fields = Object.values(commandObject.entity.attributes).reduce(
              (eFields, attribute) => {
                if (!(attribute instanceof EntityAttribute)) {
                  eFields.push(new EntityQueryField(attribute));
                }
                return eFields;
              },
              <EntityQueryField[]>[]
            );
            const link = new EntityLink(commandObject.entity, 'alias', fields);
            const options = EQueryTranslator.createOptions(commandObject);
            return new EntityQuery(link, options);
          });
      }
    }
    throw new Error("Can't create EntityQuery by command");
  }

  private static createOptions(commandObject: ICommandObject): EntityQueryOptions | undefined {
    switch (commandObject.determiner) {
      case Determiner.All:
        return;
    }
  }
}

export { EQueryTranslator };
