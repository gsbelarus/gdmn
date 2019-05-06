import { IEntityDataDlgProps } from "./EntityDataDlg.types";
import React, { useEffect } from "react";

export function EntityDataDlg(props: IEntityDataDlgProps): JSX.Element {

  const { addViewTab, url, entityName, id, rs, loadRS, entity } = props;

  useEffect(
    () => {
      addViewTab({
        url,
        caption: `${entityName}-${id}`,
        rs: rs ? [rs.name] : undefined
      });
    }, [url, entityName, id, rs]
  );

  useEffect( () => {
    if (!rs && entity) {
      loadRS(url, entity, id);
    }
  }, [rs, entity, url, id]);

  if (!entity) {
    return <div>Unknown entity</div>;
  }

  if (!rs) {
    return <div>Loading...</div>;
  }

  return <div>Hi!</div>;
};