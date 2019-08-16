export const listType = [
  {key: 'Detail', text: 'Detail'},
  {key: 'Parent', text: 'Parent'},
  {key: 'Entity', text: 'Entity'},
  {key: 'String', text: 'String'},
  {key: 'Set', text: 'Set'},
  {key: 'Sequence', text: 'Sequence'},
  {key: 'Integer', text: 'Integer'},
  {key: 'Numeric', text: 'Numeric'},
  {key: 'Float', text: 'Float'},
  {key: 'Boolean', text: 'Boolean'},
  {key: 'Date', text: 'Date'},
  {key: 'TimeStamp', text: 'TimeStamp'},
  {key: 'Time', text: 'Time'},
  {key: 'Blob', text: 'Blob'},
  {key: 'Enum', text: 'Enum'},
];

export const alignmentlist = [
  {key: 'left', text: 'left'},
  {key: 'right', text: 'right'},
  {key: 'center', text: 'center'}
];

export interface ILastFocusedRow {
  value: string,
  numberRow: number
};

export const dateFormats = ['', 'dd.mm.yy', 'dd.mm.yyyy'];

export const numberFormats = [
  {
    name: ''
  },
  {
    name: '0',
    maxDecDigits: 0
  },
  {
    name: '0.##',
    maxDecDigits: 2
  },
  {
    name: '0.00',
    maxDecDigits: 2,
    minDecDigits: 2
  },
  {
    name: '0.000',
    maxDecDigits: 3,
    minDecDigits: 3
  },
  {
    name: '0.0000',
    maxDecDigits: 4,
    minDecDigits: 4
  },
  {
    name: '#,##0.00',
    maxDecDigits: 2,
    minDecDigits: 2,
    useGrouping: true,
    groupSeparator: ','
  },
  {
    name: '$#,##0.00',
    maxDecDigits: 2,
    minDecDigits: 2,
    currSign: '$ ',
    currSignPlaceBefore: true
  }
];

export const BooleanFormats = ["Yes, No", "True, false", "1, 0"];


export const getFieldType = (value: string) => {
  switch (value) {
    case 'Parent':
    case 'Entity':
    case 'Set':
      return {fieldType: "link"};
      break;
    case 'Integer':
    case 'Numeric':
    case 'Float':
      return {fieldType: "number"};
      break;
    case 'Date':
    case 'Time':
    case 'TimeStamp':
      return {fieldType: "date"};
      break;
    case 'Boolean':
      return {fieldType: "boolean"};
      break;
    default:
      return {fieldType: ""};
  }
};
