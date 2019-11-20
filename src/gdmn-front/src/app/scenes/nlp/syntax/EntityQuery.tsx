import React from "react";
import { EntityQuery, EntityLinkField } from "gdmn-orm";
import { Frame } from "../../gdmn/components/Frame";
import { Stack, getTheme } from "office-ui-fabric-react";

const ELField = ({ f }: { f: EntityLinkField }) => {
  return (
    <div
      style={{
        border: '1px solid ' + getTheme().palette.themeDarker,
        borderRadius: '2px',
        padding: '0 2px 0 2px'
      }}
    >
      {f.attribute.name}
    </div>
  )
};

export const EQ = ({ eq }: { eq: EntityQuery }) => {
  return (
    <>
      <div>
        {`${eq.link.alias} -- ${eq.link.entity.name}`}
      </div>
      <Frame border marginTop caption="Fields">
        <Stack horizontal wrap tokens={{ childrenGap: '2px' }}>
          {
            eq.link.fields.map( f => <ELField key={f.attribute.name} f={f} /> )
          }
        </Stack>
      </Frame>
      <pre>
        {JSON.stringify(eq.inspect().options, undefined, 2)}
      </pre>
    </>
  )
};