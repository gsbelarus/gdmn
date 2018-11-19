import { GetRowDataFunc } from "gdmn-recordset";
import { RSCreateFunc } from "./types";
import { loadNBRBRates } from "./nbrbRates";

export function loadNBRBOLAP(name: string, rscf: RSCreateFunc) {
  loadNBRBRates(name, rs => {
    rscf(rs.sort([
        {
          fieldName: 'Cur_Abbreviation'
        }
      ],
      [
        {
          fieldName: 'Year'
        },
        {
          fieldName: 'Month'
        }
      ],
      [
        {
          fieldName: 'avgRate',
          measureCalcFunc: (getRowData: GetRowDataFunc, rowStart: number, count: number) => {
            if (!count) {
              return null;
            }

            let v = 0;
            for (let i = rowStart; i < rowStart + count; i++) {
              v += getRowData(i)['Cur_OfficialRate'] as number;
            }
            return v / count;
          }
        }
      ])
    );
  });
};