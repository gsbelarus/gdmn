import { IAttribute } from "gdmn-orm";
import React from "react";

interface IEntityAttributeProps {
  attr: IAttribute;
};

export const EntityAttribute = ({ attr }: IEntityAttributeProps) => {
  return (
    <div>
      {attr.name}
    </div>
  );
};