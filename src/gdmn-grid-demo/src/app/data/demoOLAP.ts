import { RSCreateFunc } from "./types";
import { loadDemoData } from "./demoData";
import { GetRowDataFunc } from "gdmn-recordset";

export function loadDemoOLAP(name: string, rscf: RSCreateFunc) {
  loadDemoData(name, rs => {
    rscf(rs.sort([
        {
          fieldName: 'company'
        },
        {
          fieldName: 'good'
        }
      ],
      [
        {
          fieldName: 'year'
        },
        {
          fieldName: 'month'
        }
      ],
      [
        {
          fieldName: 'sumCost',
          measureCalcFunc: (getRowData: GetRowDataFunc, rowStart: number, count: number) => {
            if (!count) {
              return null;
            }

            let v = 0;
            for (let i = rowStart; i < rowStart + count; i++) {
              v += getRowData(i)['cost'] as number;
            }
            return v;
          }
        }
      ])
    );
  });
};