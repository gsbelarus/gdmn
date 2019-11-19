import { Object, Objects } from "./types";
import { Label, TextField, Checkbox, ITextFieldStyles } from "office-ui-fabric-react";
import React from "react";
import { object2style, object2ITextFieldStyles, object2ILabelStyles } from "./utils";
import { WithSelectionFrame } from "./WithSelectionFrame";
import { EntityAttribute, Entity } from 'gdmn-orm';
import { TFieldType, RecordSet } from 'gdmn-recordset';
import { DatepickerJSX } from '@src/app/components/Datepicker/Datepicker';
import { FrameBox } from "./FrameBox";
import { LookupComboBox } from "@src/app/components/LookupComboBox/LookupComboBox";

interface IInternalControlProps {
  object: Object;
  objects: Objects;
  entity?: Entity;
  rs?: RecordSet;
  gridMode?: boolean;
  previewMode?: boolean;
  selectedObject?: Object;
  onSelectObject: (object: Object | undefined) => void;
};

const Field = (props: { styles: Partial<ITextFieldStyles>, label: string, fieldName: string, rs?: RecordSet, entity?: Entity /*fd: IFieldDef, field?: string, areaStyle?: IStyleFieldsAndAreas, aeraDirection?: TDirection*/ }): JSX.Element | null => {
  const fd = props.rs!.fieldDefs.find(fieldDef => fieldDef.caption === props.fieldName);

  if(fd) {
    const dataType = fd.dataType;

    if (props.rs && fd.eqfa!.linkAlias !== props.rs.eq!.link.alias && fd.eqfa!.attribute === 'ID') {
      const fkFieldName = fd.eqfa!.linkAlias;
      const attr = props.entity!.attributes[fkFieldName] as EntityAttribute;

      if (attr instanceof EntityAttribute) {
        return (
          <LookupComboBox
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

const InternalControl = ({ object, objects, rs, entity, onSelectObject, previewMode, selectedObject }: IInternalControlProps) => {

  switch (object.type) {
    case 'LABEL':
      return (
        <Label
          key={object.name}
          styles={object2ILabelStyles(object, objects)}
          onClick={ () => onSelectObject(object) }
        >
          {object.text}
        </Label>
      );

    case 'FIELD':
      return (
        <div onClick={ () => onSelectObject(object)} >
          <Field
            styles={object2ITextFieldStyles(object, objects)}
            label={object.label !== "" ? object.label : object.fieldName}
            fieldName={object.fieldName}
            rs={rs}
            entity={entity}
          />
        </div>
      )

    case 'IMAGE':
      return (
        <div onClick={ () => onSelectObject(object) } >
          <img
            src={object.url}
            alt={object.alt}
            style={object2style(object, objects)}
          />
        </div>
      )

    case 'FRAME':
      return (
        <FrameBox
          key={object.name}
          previewMode={previewMode}
          selectedObject={selectedObject}
          objects={objects}
          frame={object}
          rs={rs}
          entity={entity}
          onSelectObject={onSelectObject}
        />
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
  selectedObject?: Object;
  onSelectObject: (object: Object | undefined) => void;
};

export const Control = ({ object, objects, rs, entity, onSelectObject, selected, previewMode, selectedObject }: IControlProps) =>
  <WithSelectionFrame selected={selected} previewMode={previewMode} onSelectObject={onSelectObject} >
    <InternalControl object={object} objects={objects} rs={rs} entity={entity} previewMode={previewMode}
      onSelectObject={onSelectObject} selectedObject={selectedObject}/>
  </WithSelectionFrame>
