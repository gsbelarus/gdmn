import { Object, Objects } from "./types";
import { Label, TextField, Checkbox, ITextFieldStyles } from "office-ui-fabric-react";
import React from "react";
import { object2style, object2ITextFieldStyles, object2ILabelStyles } from "./utils";
import { WithSelectionFrame } from "./WithSelectionFrame";
import { EntityAttribute, Entity } from 'gdmn-orm';
import { SetLookupComboBox } from '@src/app/components/SetLookupComboBox/SetLookupComboBox';
import { TFieldType, RecordSet } from 'gdmn-recordset';
import { DatepickerJSX } from '@src/app/components/Datepicker/Datepicker';

interface IInternalControlProps {
  object: Object;
  objects: Objects;
  entity?: Entity;
  rs?: RecordSet;
};

const Field = (props: { styles: Partial<ITextFieldStyles>, label: string, fieldName: string, rs?: RecordSet, entity?: Entity /*fd: IFieldDef, field?: string, areaStyle?: IStyleFieldsAndAreas, aeraDirection?: TDirection*/ }): JSX.Element | null => {
  const fd = props.rs!.fieldDefs.find(fieldDef => fieldDef.caption === props.fieldName);

  if(fd) {
    const dataType = fd.dataType;

    if (props.rs && fd.eqfa!.linkAlias !== props.rs.eq!.link.alias && fd.eqfa!.attribute === 'ID') {
      const fkFieldName = fd.eqfa!.linkAlias;
      const attr = props.entity!.attributes[fkFieldName] as EntityAttribute;

      const refIdFieldAlias = fd.fieldName;
      const refNameFieldDef = props.rs.fieldDefs.find( fd2 => !!fd2.eqfa && fd2.eqfa.linkAlias === fd.eqfa!.linkAlias && fd2.eqfa.attribute !== 'ID');
      const refNameFieldAlias = refNameFieldDef ? refNameFieldDef.fieldName : '';
      const linkEntity = attr.entities[0];
      if (attr instanceof EntityAttribute) {
        return (
          <SetLookupComboBox
            key={props.label}
            label={props.label}
            name={fkFieldName}
            onLookup={(filter, limit) => {return Promise.resolve([])}}
            onChanged={() => {}}
            styles={props.styles}
          />
        );
      }
    }

    if (fd.eqfa!.linkAlias !== props.rs!.eq!.link.alias) {
      return null;
    }

    if (dataType === TFieldType.Date) {
      return (
        <DatepickerJSX
          key={props.label}
          label={props.label}
          fieldName={`${fd!.fieldName}`}
          value=''
          onChange={() => {}}
          styles={props.styles}
          styleIcon={undefined}
        />
      );
    } else if (dataType === TFieldType.Boolean) {
      const locked = props.rs ? props.rs.locked : false;
      return (
        <Checkbox
          key={props.label}
          label={props.label}
          disabled={locked}
          defaultChecked={props.rs!.getBoolean(fd!.fieldName)}
        />
      )
    } else {
      return (
        <TextField
          key={props.label}
          label={props.label}
          defaultValue={props.rs!.getString(fd!.fieldName)}
          readOnly={true}
          styles={props.styles}
        />
      )
    }
  } else {
    return null;
  }
}

const InternalControl = ({ object, objects, rs, entity }: IInternalControlProps) => {

  switch (object.type) {
    case 'LABEL':
      return (
        <Label
          key={object.name}
          styles={object2ILabelStyles(object, objects)}
        >
          {object.text}
        </Label>
      );

    case 'FIELD':
      return (
        <div>
          <Field
            styles={object2ITextFieldStyles(object, objects)}
            label={object.label}
            fieldName={object.fieldName}
            rs={rs}
            entity={entity}
          />
        </div>
      )

    case 'IMAGE':
      return (
        <div>
          <img
            src={object.url}
            alt={object.alt}
            style={object2style(object, objects)}
          />
        </div>
      )

    default:
      return null;
  }
};

interface IControlProps {
  object: Object;
  objects: Objects;
  rs?: RecordSet;
  entity?: Entity;
  selected: boolean;
  previewMode?: boolean;
  onSelectObject: () => void;
};

export const Control = ({ object, objects, rs, entity, onSelectObject, selected, previewMode }: IControlProps) =>
  <WithSelectionFrame selected={selected} previewMode={previewMode} onSelectObject={onSelectObject}>
    <InternalControl object={object} objects={objects} rs={rs} entity={entity} />
  </WithSelectionFrame>
